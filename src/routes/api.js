const express = require('express');
const router = express.Router();
const { getCountryName } = require('../utils/helpers');
const { supabase } = require('../services/supabaseClient');

// Track shipment API endpoint
router.get('/track/:trackingNumber', async (req, res) => {
    try {
        const trackingNumber = req.params.trackingNumber;

        const { data: shipment, error: shipmentError } = await supabase
            .from('shipments')
            .select(`
                *,
                history:shipment_history(*, updater:users(name)),
                packages:packages(*)
            `)
            .eq('trackingNumber', trackingNumber)
            .maybeSingle();

        if (shipmentError) {
            console.error('Supabase shipment fetch error:', shipmentError);
            return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
        }

        if (!shipment) {
            return res.status(404).json({
                success: false,
                message: 'Envio não encontrado'
            });
        }

        // Format the response
        const response = {
            success: true,
            data: {
                trackingNumber: shipment.trackingNumber,
                status: shipment.status,
                currentLocation: shipment.currentLocation,
                origin: getCountryName(shipment.origin),
                destination: getCountryName(shipment.destination),
                shipmentType: shipment.shipmentType,
                mode: shipment.mode,
                shipper: {
                    name: shipment.shipperName,
                    email: shipment.shipperEmail,
                    phone: shipment.shipperPhone,
                    address: shipment.shipperAddress
                },
                receiver: {
                    name: shipment.receiverName,
                    email: shipment.receiverEmail,
                    phone: shipment.receiverPhone,
                    address: shipment.receiverAddress
                },
                packages: (shipment.packages || []).map(pkg => ({
                    type: pkg.pieceType,
                    quantity: pkg.quantity,
                    description: pkg.description,
                    dimensions: {
                        length: pkg.length,
                        width: pkg.width,
                        height: pkg.height,
                        unit: 'cm'
                    },
                    weight: pkg.weight,
                    volumetricWeight: pkg.volumetricWeight
                })),
                history: (shipment.history || []).map(entry => ({
                    status: entry.status,
                    location: entry.location,
                    notes: entry.notes,
                    timestamp: entry.createdAt,
                    updatedBy: entry.updater ? entry.updater.name : 'System'
                })),
                dates: {
                    pickup: shipment.pickupDate,
                    pickupTime: shipment.pickupTime,
                    departure: shipment.departureTime,
                    expectedDelivery: shipment.expectedDeliveryDate,
                    created: shipment.createdAt,
                    lastUpdated: shipment.updatedAt
                },
                carrier: shipment.carrier,
                carrierReferenceNo: shipment.carrierReferenceNo,
                paymentMode: shipment.paymentMode,
                totalFreight: shipment.totalFreight,
                comments: shipment.comments
            }
        };

        res.json(response);
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// Healthcheck for Supabase connectivity
router.get('/health/supabase', async (req, res) => {
    try {
        const { error } = await supabase.from('shipments').select('id').limit(1);
        if (error) {
            return res.status(500).json({ ok: false, error: error.message });
        }
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

module.exports = router;