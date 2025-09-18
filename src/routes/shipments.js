const express = require('express');
const router = express.Router();
const db = require('../../models');
const { Shipment, User, Package } = db;
const { isAuthenticated } = require('../middleware/auth');
const { getStatusBadgeClass, formatStatus, formatDate } = require('../utils/helpers');
const { sendStatusUpdateEmail, sendShipmentCreatedEmail } = require('../services/email');
const countries = require('../utils/countries');

// List all shipments
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const shipments = await Shipment.findAll({
            include: [{
                model: User,
                as: 'creator',
                attributes: ['name']
            }],
            order: [['createdAt', 'DESC']]
        });

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
    const transaction = await db.sequelize.transaction();
    
    try {
        // Create shipment
        const shipment = await Shipment.create({
            // Shipper Details
            shipperName: req.body.shipperName,
            shipperPhone: req.body.shipperPhone,
            shipperEmail: req.body.shipperEmail,
            shipperAddress: req.body.shipperAddress,
            
            // Receiver Details
            receiverName: req.body.receiverName,
            receiverPhone: req.body.receiverPhone,
            receiverEmail: req.body.receiverEmail,
            receiverAddress: req.body.receiverAddress,
            
            // Shipment Details
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
            
            // System fields
            status: 'pending',
            currentLocation: req.body.origin,
            createdBy: req.user.id
        }, { transaction });

        // Process packages
        if (req.body.packages) {
            // Group package data by index
            const groupedData = {};
            Object.keys(req.body).forEach(key => {
                if (key.startsWith('packages[')) {
                    const match = key.match(/packages\[(\d+)\]\[(\w+)\]/);
                    if (match) {
                        const [, index, field] = match;
                        if (!groupedData[index]) {
                            groupedData[index] = {};
                        }
                        groupedData[index][field] = req.body[key];
                    }
                }
            });

            // Convert grouped data to array of package objects
            const packageObjects = Object.values(groupedData).map(pkg => ({
                shipmentId: shipment.id,
                quantity: parseInt(pkg.quantity) || 1,
                pieceType: pkg.pieceType,
                description: pkg.description,
                length: parseFloat(pkg.length) || 0,
                width: parseFloat(pkg.width) || 0,
                height: parseFloat(pkg.height) || 0,
                weight: parseFloat(pkg.weight) || 0
            }));

            console.log('Creating packages:', packageObjects);
            await Package.bulkCreate(packageObjects, { 
                transaction,
                validate: true
            });
        }

        // Create initial history entry
        await db.ShipmentHistory.create({
            shipmentId: shipment.id,
            status: 'pending',
            location: req.body.origin,
            notes: 'Shipment created',
            updatedBy: req.user.id
        }, { transaction });

        await transaction.commit();

        // Send confirmation email
        await sendShipmentCreatedEmail(shipment);

        req.flash('success', `Shipment created with tracking number: ${shipment.trackingNumber}`);
        res.redirect('/admin/shipments');
    } catch (error) {
        await transaction.rollback();
        console.error('Error creating shipment:', error);
        console.error('Error details:', error.parent || error);
        req.flash('error', 'Failed to create shipment. Please ensure all required fields are filled.');
        res.redirect('/admin/shipments/create');
    }
});

// Update shipment status
router.post('/:id/status', isAuthenticated, async (req, res) => {
    try {
        const { status, location, notes } = req.body;
        const shipment = await Shipment.findByPk(req.params.id);

        if (!shipment) {
            req.flash('error', 'Shipment not found');
            return res.redirect('/admin/shipments');
        }

        // Update shipment status
        await shipment.update({
            status,
            currentLocation: location,
            currentLocationUpdatedAt: new Date()
        });

        // Create history entry
        await db.ShipmentHistory.create({
            shipmentId: shipment.id,
            status,
            location,
            notes,
            updatedBy: req.user.id
        });

        // Send status update email
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
        const shipment = await Shipment.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    as: 'creator',
                    attributes: ['name']
                },
                {
                    model: db.ShipmentHistory,
                    as: 'history',
                    include: [{
                        model: User,
                        as: 'updater',
                        attributes: ['name']
                    }],
                    order: [['createdAt', 'DESC']]
                },
                {
                    model: Package,
                    as: 'packages'
                }
            ]
        });

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