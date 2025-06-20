const bcrypt = require('bcrypt');
const { User } = require('../models');

exports.getLogin = (req, res) => {
    res.render('auth/login');
};

exports.postLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt for email:', email);
        
        const cleanEmail = email.trim().toLowerCase();
        const user = await User.findOne({ where: { email: cleanEmail } });
        
        console.log('User found:', !!user);
        
        if (!user) {
            console.log('User not found');
            req.flash('error', 'Неверный email или пароль');
            return res.redirect('/login');
        }

        console.log('Stored password hash:', user.password);
        console.log('Attempting to compare passwords...');
        
        const passwordMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', passwordMatch);
        console.log('Input password length:', password.length);
        console.log('Stored hash length:', user.password.length);

        if (!passwordMatch) {
            console.log('Password does not match');
            req.flash('error', 'Неверный email или пароль');
            return res.redirect('/login');
        }

        if (user.banned) {
            console.log('User is banned');
            req.flash('error', 'Ваш аккаунт заблокирован. Обратитесь к администрации.');
            return res.redirect('/login');
        }

        console.log('Login successful, setting session');
        req.session.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        res.redirect('/');
    } catch (error) {
        console.error('Login error details:', error);
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
    console.log('Registration attempt for email:', email);
    console.log('Password length:', password.length);
    
    const cleanEmail = email.trim().toLowerCase();
    const errors = {};
    const values = { name, email: cleanEmail };

    if (!name || name.length < 2 || !/^[а-яА-Яa-zA-Z\s]+$/.test(name)) {
        errors.name = 'Имя должно содержать только буквы и быть не короче 2 символов';
    }
    if (!cleanEmail || !/^[\w-.]+@[\w-]+\.[a-z]{2,}$/i.test(cleanEmail)) {
        errors.email = 'Введите корректный email';
    }
    if (!password || password.length < 6 || !/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
        errors.password = 'Пароль должен быть не короче 6 символов и содержать буквы и цифры';
    }

    if (Object.keys(errors).length > 0) {
        return res.render('auth/register', { errors, values });
    }

    try {
        const existingUser = await User.findOne({ where: { email: cleanEmail } });
        if (existingUser) {
            console.log('User already exists');
            req.flash('error', 'Пользователь с таким email уже существует');
            return res.redirect('/register');
        }

        console.log('Creating new user...');
        const user = await User.create({
            name,
            email: cleanEmail,
            password,
            role: 'user'
        });

        console.log('User created successfully');
        console.log('Stored hash:', user.password);
        console.log('Stored hash length:', user.password.length);

        req.session.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        res.redirect('/');
    } catch (error) {
        console.error('Registration error details:', error);
        req.flash('error', 'Ошибка при регистрации');
        res.redirect('/register');
    }
};

exports.logout = (req, res) => {
    req.session.destroy();
    res.redirect('/');
}; 