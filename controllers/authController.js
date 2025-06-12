const bcrypt = require('bcrypt');
const { User } = require('../models');

exports.getLogin = (req, res) => {
    res.render('auth/login');
};

exports.postLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            req.flash('error', 'Неверный email или пароль');
            return res.redirect('/login');
        }

        if (user.banned) {
            req.flash('error', 'Ваш аккаунт заблокирован. Обратитесь к администрации.');
            return res.redirect('/login');
        }

        req.session.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        res.redirect('/');
    } catch (error) {
        console.error('Login error:', error);
        req.flash('error', 'Ошибка при входе');
        res.redirect('/login');
    }
};

exports.getRegister = (req, res) => {
    res.render('auth/register', {
        errors: {},
        values: {}
    });
};

exports.postRegister = async (req, res) => {
    const { name, email, password } = req.body;
    const errors = {};
    const values = { name, email };

    if (!name || name.length < 2 || !/^[а-яА-Яa-zA-Z\s]+$/.test(name)) {
        errors.name = 'Имя должно содержать только буквы и быть не короче 2 символов';
    }
    if (!email || !/^[\w-.]+@[\w-]+\.[a-z]{2,}$/i.test(email)) {
        errors.email = 'Введите корректный email';
    }
    if (!password || password.length < 6 || !/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
        errors.password = 'Пароль должен быть не короче 6 символов и содержать буквы и цифры';
    }

    if (Object.keys(errors).length > 0) {
        return res.render('auth/register', { errors, values });
    }

    try {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            req.flash('error', 'Пользователь с таким email уже существует');
            return res.redirect('/register');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'user'
        });

        req.session.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        res.redirect('/');
    } catch (error) {
        console.error('Registration error:', error);
        req.flash('error', 'Ошибка при регистрации');
        res.redirect('/register');
    }
};

exports.logout = (req, res) => {
    req.session.destroy();
    res.redirect('/');
}; 