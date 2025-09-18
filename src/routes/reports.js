const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const db = require('../../models');
const { Shipment } = db;
const { isAuthenticated } = require('../middleware/auth');
const { getStatusBadgeClass, formatStatus, formatDate } = require('../utils/helpers');

router.get('/', isAuthenticated, async (req, res) => {
    try {
        const { startDate, endDate, status } = req.query;
        const where = {};

        // Add date range filter
        if (startDate && endDate) {
            where.createdAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        // Add status filter
        if (status && status !== 'all') {
            where.status = status;
        }

        // Get shipments
        const shipments = await Shipment.findAll({
            where,
            include: [
                {
                    model: db.User,
                    as: 'creator',
                    attributes: ['name']
                },
                {
                    model: db.Package,
                    as: 'packages'
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        // Calculate statistics
        const stats = {
            totalShipments: shipments.length,
            totalWeight: shipments.reduce((sum, shipment) => {
                return sum + (shipment.packages?.reduce((pSum, pkg) => pSum + (pkg.weight * pkg.quantity), 0) || 0);
            }, 0),
            totalVolume: shipments.reduce((sum, shipment) => {
                return sum + (shipment.packages?.reduce((pSum, pkg) => pSum + (pkg.volume * pkg.quantity), 0) || 0);
            }, 0),
            statusCounts: shipments.reduce((counts, shipment) => {
                counts[shipment.status] = (counts[shipment.status] || 0) + 1;
                return counts;
            }, {}),
            typeCounts: shipments.reduce((counts, shipment) => {
                counts[shipment.shipmentType] = (counts[shipment.shipmentType] || 0) + 1;
                return counts;
            }, {}),
            modeCounts: shipments.reduce((counts, shipment) => {
                counts[shipment.mode] = (counts[shipment.mode] || 0) + 1;
                return counts;
            }, {})
        };

        res.render('reports/index', {
            shipments,
            stats,
            filters: { startDate, endDate, status },
            getStatusBadgeClass,
            formatStatus,
            formatDate
        });
    } catch (error) {
        console.error('Error generating report:', error);
        req.flash('error', 'Failed to generate report');
        res.redirect('/admin');
    }
});

module.exports = router;
