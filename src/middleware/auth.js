const jwt = require('jsonwebtoken');
const { supabase } = require('../services/supabaseClient');

exports.isAuthenticated = async (req, res, next) => {
    try {
        // Check for token in cookies
        const token = req.cookies.token;
        console.log('Auth middleware - token present:', !!token);
        
        if (!token) {
            console.log('No token found, redirecting to login');
            return res.redirect('/auth/login');
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        console.log('Token decoded for user:', decoded.id);
        
        // Get user from Supabase
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', decoded.id)
            .maybeSingle();
        
        if (error) {
            console.error('Supabase user lookup error in auth:', error);
            return res.redirect('/auth/login');
        }
        
        if (!user) {
            console.log('User not found in Supabase for id:', decoded.id);
            return res.redirect('/auth/login');
        }

        console.log('User authenticated:', user.email);
        // Add user to request
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.redirect('/auth/login');
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