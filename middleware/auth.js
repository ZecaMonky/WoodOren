const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    req.flash('error', 'Пожалуйста, войдите в систему');
    res.redirect('/auth/login');
};

const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    req.flash('error', 'У вас нет доступа к этой странице');
    res.redirect('/');
};

module.exports = {
    isAuthenticated,
    isAdmin
}; 