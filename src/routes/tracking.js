const express = require('express');
const router = express.Router();
const db = require('../../models');
const { Shipment } = db;
const { getStatusBadgeClass, formatStatus, formatDate } = require('../utils/helpers');

// Public tracking page
router.get('/', (req, res) => {
    // If accessed from admin area, use admin layout
    const viewPath = req.baseUrl.startsWith('/admin') ? 'tracking/admin-index' : 'tracking/index';
    res.render(viewPath, {
        error: req.flash('error'),
        success: req.flash('success')
    });
});

// Track shipment
router.get('/track/:trackingNumber', async (req, res) => {
    try {
        const shipment = await Shipment.findOne({
            where: { trackingNumber: req.params.trackingNumber },
            include: [
                {
                    model: db.ShipmentHistory,
                    as: 'history',
                    include: [{
                        model: db.User,
                        as: 'updater',
                        attributes: ['name']
                    }],
                    order: [['createdAt', 'DESC']]
                },
                {
                    model: db.Package,
                    as: 'packages'
                }
            ]
        });

        if (!shipment) {
            req.flash('error', 'Shipment not found');
            return res.redirect(req.baseUrl);
        }

        // If accessed from admin area, use admin layout
        const viewPath = req.baseUrl.startsWith('/admin') ? 'tracking/admin-result' : 'tracking/result';
        res.render(viewPath, {
            shipment,
            getStatusBadgeClass,
            formatStatus,
            formatDate,
            error: req.flash('error'),
            success: req.flash('success')
        });
    } catch (error) {
        console.error('Error tracking shipment:', error);
        req.flash('error', 'Failed to track shipment');
        res.redirect(req.baseUrl);
    }
});

module.exports = router;