const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { supabase } = require('../services/supabaseClient');
const { createToken } = require('../middleware/auth');

// Login page
router.get('/login', (req, res) => {
    res.render('auth/login', {
        layout: false,
        error: req.flash('error')
    });
});

// Login submission
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt for:', email);

        // Find user in Supabase
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .maybeSingle();
        if (error) {
            console.error('Supabase user lookup error:', error);
            throw error;
        }
        if (!user) {
            console.log('User not found for email:', email);
            req.flash('error', 'Invalid email or password');
            return res.redirect('/auth/login');
        }

        // Check password (bcrypt compare against stored hash)
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Password mismatch for user:', email);
            req.flash('error', 'Invalid email or password');
            return res.redirect('/auth/login');
        }

        // Update last login
        await supabase.from('users').update({ lastLogin: new Date().toISOString() }).eq('id', user.id);

        // Create token and set cookie
        const token = createToken(user);
        console.log('Created token for user:', user.id, 'role:', user.role);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });
        console.log('Set cookie, redirecting to /admin');

        res.redirect('/admin');
    } catch (error) {
        console.error('Login error:', error);
        req.flash('error', 'An error occurred during login');
        res.redirect('/auth/login');
    }
});

// Logout
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/auth/login');
});

module.exports = router;
