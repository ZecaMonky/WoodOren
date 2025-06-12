const bcrypt = require('bcrypt');
const { User, Order, OrderItem, Product } = require('../models');

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.session.user.id);
        res.render('profile/index', { user, errors: {}, values: {} });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).render('error', { message: 'Ошибка при загрузке профиля' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, email, currentPassword, newPassword } = req.body;
        const user = await User.findByPk(req.session.user.id);
        const errors = {};
        const values = { name, email };

        if (!name || name.length < 2 || !/^[а-яА-Яa-zA-Z\s]+$/.test(name)) {
            errors.name = 'Имя должно содержать только буквы и быть не короче 2 символов';
        }
        if (!email || !/^[\w-.]+@[\w-]+\.[a-z]{2,}$/i.test(email)) {
            errors.email = 'Введите корректный email';
        }
        if (newPassword && (newPassword.length < 6 || !/[a-zA-Z]/.test(newPassword) || !/\d/.test(newPassword))) {
            errors.newPassword = 'Новый пароль должен быть не короче 6 символов и содержать буквы и цифры';
        }
        if (email !== user.email) {
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                errors.email = 'Пользователь с таким email уже существует';
            }
        }
        if (currentPassword && newPassword) {
            const isValid = await bcrypt.compare(currentPassword, user.password);
            if (!isValid) {
                errors.currentPassword = 'Неверный текущий пароль';
            }
        }
        if (Object.keys(errors).length > 0) {
            return res.render('profile/index', { user, errors, values });
        }

        const updates = { name, email };
        if (currentPassword && newPassword) {
            updates.password = await bcrypt.hash(newPassword, 10);
        }
        await user.update(updates);
        req.flash('success', 'Профиль успешно обновлен');
        res.redirect('/profile');
    } catch (error) {
        console.error('Profile update error:', error);
        req.flash('error', 'Ошибка при обновлении профиля');
        res.redirect('/profile');
    }
};

exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: { user_id: req.session.user.id },
            include: [{
                model: OrderItem,
                include: [Product]
            }],
            order: [['created_at', 'DESC']]
        });

        res.render('profile/orders', { orders });
    } catch (error) {
        console.error('Orders error:', error);
        res.status(500).render('error', { message: 'Ошибка при загрузке заказов' });
    }
};

exports.getOrderDetails = async (req, res) => {
    try {
        const order = await Order.findOne({
            where: {
                id: req.params.id,
                user_id: req.session.user.id
            },
            include: [
                {
                    model: OrderItem,
                    include: [{ model: Product }]
                }
            ]
        });

        if (!order) {
            return res.status(404).render('error', { message: 'Заказ не найден' });
        }

        res.render('profile/order-details', { order });
    } catch (error) {
        console.error('Order details error:', error);
        res.status(500).render('error', { message: 'Ошибка при загрузке деталей заказа' });
    }
}; 