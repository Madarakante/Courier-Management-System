const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const dotenv = require('dotenv');
const expressLayouts = require('express-ejs-layouts');
const cors = require('cors');

// Load environment variables
dotenv.config();

const app = express();

// Enable CORS for the API
app.use('/api', cors());

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/admin');
app.use(expressLayouts);

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Session setup - Must be before flash
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize flash messages - Must be after session
app.use(flash());

// Add layout middleware - Must be after flash
const layoutMiddleware = require('./middleware/layout');
app.use(layoutMiddleware);

// Import models and database
const db = require('../models');

// Import middleware
const { isAuthenticated } = require('./middleware/auth');
const { getStatusBadgeClass, formatStatus, formatDate } = require('./utils/helpers');

// Import routes
const authRoutes = require('./routes/auth');
const shipmentRoutes = require('./routes/shipments');
const trackingRoutes = require('./routes/tracking');
const reportsRoutes = require('./routes/reports');
const settingsRoutes = require('./routes/settings');
const apiRoutes = require('./routes/api');

// Disable layout for public tracking pages
app.use('/tracking', (req, res, next) => {
    res.locals.layout = false;
    next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/admin/shipments', shipmentRoutes);
app.use('/admin/reports', reportsRoutes);
app.use('/admin/settings', settingsRoutes);
app.use('/tracking', trackingRoutes);
app.use('/api', apiRoutes);
// Mount tracking routes for admin access with layout
app.use('/admin/tracking', (req, res, next) => {
    res.locals.layout = 'layouts/admin'; // Ensure admin layout
    next();
}, isAuthenticated, trackingRoutes);

// Redirect /login to /auth/login
app.get('/login', (req, res) => {
    res.redirect('/auth/login');
});

app.get('/', (req, res) => {
    res.redirect('/tracking');
});

app.get('/admin', isAuthenticated, async (req, res) => {
    try {
        // Get dashboard stats
        const stats = {
            totalShipments: await db.Shipment.count(),
            deliveredShipments: await db.Shipment.count({ where: { status: 'delivered' } }),
            inTransitShipments: await db.Shipment.count({ where: { status: 'in_transit' } }),
            todayShipments: await db.Shipment.count({
                where: {
                    createdAt: {
                        [db.Sequelize.Op.gte]: new Date().setHours(0, 0, 0, 0),
                        [db.Sequelize.Op.lt]: new Date().setHours(23, 59, 59, 999)
                    }
                }
            })
        };

        // Get recent shipments
        const recentShipments = await db.Shipment.findAll({
            order: [['createdAt', 'DESC']],
            limit: 5,
            include: [{
                model: db.User,
                as: 'creator',
                attributes: ['name']
            }]
        });

        res.render('dashboard/index', { 
            title: 'Dashboard',
            stats,
            recentShipments,
            getStatusBadgeClass,
            formatStatus,
            formatDate
        });
    } catch (error) {
        console.error('Dashboard Error:', error);
        res.status(500).render('error', { error });
    }
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { error: err });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});