const express = require('express');
const router = express.Router();
const { supabase } = require('../services/supabaseClient');
const { isAuthenticated } = require('../middleware/auth');
const { getStatusBadgeClass, formatStatus, formatDate } = require('../utils/helpers');
const { sendStatusUpdateEmail, sendShipmentCreatedEmail } = require('../services/email');
const countries = require('../utils/countries');
const { v4: uuidv4 } = require('uuid');

// List all shipments
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const { data: shipments, error } = await supabase
            .from('shipments')
            .select('*, creator:users(name)')
            .order('createdAt', { ascending: false });
        if (error) throw error;

        res.render('shipments/index', { 
            shipments,
            error: req.flash('error'),
            success: req.flash('success'),
            getStatusBadgeClass,
            formatStatus,
            formatDate
        });
    } catch (error) {
        console.error('Error fetching shipments:', error);
        req.flash('error', 'Failed to fetch shipments');
        res.redirect('/admin');
    }
});

// Show create shipment form
router.get('/create', isAuthenticated, (req, res) => {
    res.render('shipments/create', {
        error: req.flash('error'),
        success: req.flash('success'),
        countries
    });
});

// Create new shipment
router.post('/', isAuthenticated, async (req, res) => {
    try {
        const year = new Date().getFullYear().toString().substr(-2);
        const uniqueId = uuidv4().substr(0, 6).toUpperCase();
        const trackingNumber = `AS${year}${uniqueId}`;

        const shipmentPayload = {
            trackingNumber,
            shipperName: req.body.shipperName,
            shipperPhone: req.body.shipperPhone,
            shipperEmail: req.body.shipperEmail,
            shipperAddress: req.body.shipperAddress,
            receiverName: req.body.receiverName,
            receiverPhone: req.body.receiverPhone,
            receiverEmail: req.body.receiverEmail,
            receiverAddress: req.body.receiverAddress,
            shipmentType: req.body.shipmentType,
            courier: req.body.courier,
            mode: req.body.mode,
            paymentMode: req.body.paymentMode,
            totalFreight: req.body.totalFreight,
            carrier: req.body.carrier,
            carrierReferenceNo: req.body.carrierReferenceNo,
            departureTime: req.body.departureTime,
            origin: req.body.origin,
            destination: req.body.destination,
            pickupDate: req.body.pickupDate,
            pickupTime: req.body.pickupTime,
            expectedDeliveryDate: req.body.expectedDeliveryDate,
            comments: req.body.comments,
            status: 'pending',
            currentLocation: req.body.origin,
            createdBy: req.user.id
        };

        const { data: shipment, error: shipmentErr } = await supabase
            .from('shipments')
            .insert(shipmentPayload)
            .select('*')
            .single();
        if (shipmentErr) throw shipmentErr;

        // Parse only flat keys: packages[<idx>].field or packages[<idx>][field]
        const allowedFields = new Set(['quantity','pieceType','description','length','width','height','weight']);
        const groupedByIndex = {};
        for (const [key, value] of Object.entries(req.body)) {
            if (!key.startsWith('packages[')) continue;
            let match = key.match(/packages\[(\d+)\]\.(\w+)/);
            if (!match) match = key.match(/packages\[(\d+)\]\[(\w+)\]/);
            if (!match) continue;
            const idx = match[1];
            const field = match[2];
            if (!allowedFields.has(field)) continue;
            if (!groupedByIndex[idx]) groupedByIndex[idx] = {};
            groupedByIndex[idx][field] = value;
        }
        const hasMeaningfulData = (raw) => {
            const meaningfulFields = ['pieceType','description','length','width','height','weight'];
            return meaningfulFields.some(f => raw[f] !== undefined && raw[f] !== '');
        };

        let packageObjects = Object.values(groupedByIndex)
            .filter(raw => hasMeaningfulData(raw))
            .map(raw => ({
                shipmentId: shipment.id,
                quantity: parseInt(raw.quantity) || 1,
                pieceType: raw.pieceType ?? null,
                description: raw.description ?? null,
                length: raw.length === undefined || raw.length === '' ? 0 : parseFloat(raw.length),
                width: raw.width === undefined || raw.width === '' ? 0 : parseFloat(raw.width),
                height: raw.height === undefined || raw.height === '' ? 0 : parseFloat(raw.height),
                weight: raw.weight === undefined || raw.weight === '' ? 0 : parseFloat(raw.weight)
            }));

        // Compute volumetricWeight per package (cm^3 / 5000) and round to 2 decimals
        packageObjects = packageObjects.map(p => ({
            ...p,
            volumetricWeight: Number(((p.length * p.width * p.height * p.quantity) / 5000).toFixed(2))
        }));

        // Update shipment totalPackages if we have packages
        if (packageObjects.length > 0) {
            await supabase
                .from('shipments')
                .update({ totalPackages: packageObjects.reduce((a, b) => a + (b.quantity || 1), 0) })
                .eq('id', shipment.id);
        }

        if (packageObjects.length > 0) {
            console.log('Parsed packageObjects:', packageObjects);
            const { data: insertedPkgs, error: pkgErr } = await supabase
                .from('packages')
                .insert(packageObjects)
                .select('*');
            if (pkgErr) {
                console.error('Supabase packages insert error:', pkgErr);
                throw pkgErr;
            }
            console.log('Inserted packages:', insertedPkgs);
        }

        const { error: histErr } = await supabase.from('shipment_history').insert({
            shipmentId: shipment.id,
            status: 'pending',
            location: req.body.origin,
            notes: 'Shipment created',
            updatedBy: req.user.id
        });
        if (histErr) throw histErr;

        await sendShipmentCreatedEmail(shipment);

        req.flash('success', `Shipment created with tracking number: ${shipment.trackingNumber}`);
        res.redirect('/admin/shipments');
    } catch (error) {
        console.error('Error creating shipment:', error);
        req.flash('error', 'Failed to create shipment. Please ensure all required fields are filled.');
        res.redirect('/admin/shipments/create');
    }
});

// Update shipment status
router.post('/:id/status', isAuthenticated, async (req, res) => {
    try {
        const { status, location, notes } = req.body;

        const { data: shipment, error: findErr } = await supabase
            .from('shipments')
            .select('*')
            .eq('id', req.params.id)
            .maybeSingle();
        if (findErr) throw findErr;
        if (!shipment) {
            req.flash('error', 'Shipment not found');
            return res.redirect('/admin/shipments');
        }

        const { error: updateErr } = await supabase
            .from('shipments')
            .update({
                status,
                currentLocation: location,
                currentLocationUpdatedAt: new Date().toISOString()
            })
            .eq('id', shipment.id);
        if (updateErr) throw updateErr;

        const { error: histErr } = await supabase.from('shipment_history').insert({
            shipmentId: shipment.id,
            status,
            location,
            notes,
            updatedBy: req.user.id
        });
        if (histErr) throw histErr;

        await sendStatusUpdateEmail(shipment, status, location);

        req.flash('success', 'Shipment status updated successfully');
        res.redirect(`/admin/shipments/${shipment.id}`);
    } catch (error) {
        console.error('Error updating shipment status:', error);
        req.flash('error', 'Failed to update shipment status');
        res.redirect(`/admin/shipments/${req.params.id}`);
    }
});

// View shipment details
router.get('/:id', isAuthenticated, async (req, res) => {
    try {
        const { data: shipment, error } = await supabase
            .from('shipments')
            .select(`
                *,
                creator:users(name),
                history:shipment_history(*, updater:users(name)),
                packages:packages(*)
            `)
            .eq('id', req.params.id)
            .maybeSingle();
        if (error) throw error;

        if (!shipment) {
            req.flash('error', 'Shipment not found');
            return res.redirect('/admin/shipments');
        }

        res.render('shipments/view', { 
            shipment,
            error: req.flash('error'),
            success: req.flash('success'),
            getStatusBadgeClass,
            formatStatus,
            formatDate,
            countries
        });
    } catch (error) {
        console.error('Error fetching shipment:', error);
        req.flash('error', 'Failed to fetch shipment details');
        res.redirect('/admin/shipments');
    }
});

module.exports = router;