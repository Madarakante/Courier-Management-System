module.exports = (req, res, next) => {
    // Add default layout data
    res.locals.user = req.user || null;
    res.locals.messages = {
        success: req.flash('success'),
        error: req.flash('error'),
        info: req.flash('info')
    };
    next();
};
