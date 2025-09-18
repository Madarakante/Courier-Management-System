const jwt = require('jsonwebtoken');
const { supabase } = require('../services/supabaseClient');

exports.isAuthenticated = async (req, res, next) => {
    try {
        // Check for token in cookies
        const token = req.cookies.token;
        
        if (!token) {
            return res.redirect('/auth/login');
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Get user from Supabase
        const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('id', decoded.id)
            .maybeSingle();
        if (!user) {
            return res.redirect('/auth/login');
        }

        // Add user to request
        req.user = user;
        next();
    } catch (error) {
        res.redirect('/login');
    }
};

exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).render('error', {
            message: 'Access denied. Admin privileges required.'
        });
    }
};

exports.createToken = (user) => {
    return jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1d' }
    );
};