const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../../models');
const { User } = db;
const { isAuthenticated } = require('../middleware/auth');

router.get('/', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        res.render('settings/index', {
            user,
            error: req.flash('error'),
            success: req.flash('success')
        });
    } catch (error) {
        console.error('Error fetching settings:', error);
        req.flash('error', 'Failed to load settings');
        res.redirect('/admin');
    }
});

router.post('/profile', isAuthenticated, async (req, res) => {
    try {
        const { name, email } = req.body;
        await User.update(
            { name, email },
            { where: { id: req.user.id } }
        );
        req.flash('success', 'Profile updated successfully');
        res.redirect('/admin/settings');
    } catch (error) {
        console.error('Error updating profile:', error);
        req.flash('error', 'Failed to update profile');
        res.redirect('/admin/settings');
    }
});

router.post('/password', isAuthenticated, async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const user = await User.findByPk(req.user.id);

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            req.flash('error', 'Current password is incorrect');
            return res.redirect('/admin/settings');
        }

        // Verify new password match
        if (newPassword !== confirmPassword) {
            req.flash('error', 'New passwords do not match');
            return res.redirect('/admin/settings');
        }

        // Update password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await user.update({ password: hashedPassword });

        req.flash('success', 'Password updated successfully');
        res.redirect('/admin/settings');
    } catch (error) {
        console.error('Error updating password:', error);
        req.flash('error', 'Failed to update password');
        res.redirect('/admin/settings');
    }
});

module.exports = router;
