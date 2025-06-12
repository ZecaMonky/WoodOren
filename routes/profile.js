const express = require('express');
const router = express.Router();
const { User, Order, OrderItem, Product, DeliveryInfo } = require('../models');
const { isAuthenticated } = require('../middleware/auth');

router.get('/', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findByPk(req.session.user.id);
        const deliveryInfo = await DeliveryInfo.findOne({
            where: { user_id: user.id }
        });
        
        res.render('profile/index', {
            user,
            deliveryInfo,
            error: req.flash('error'),
            success: req.flash('success')
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка сервера');
    }
});

router.get('/orders', isAuthenticated, async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: { user_id: req.session.user.id },
            include: [{
                model: OrderItem,
                include: [Product]
            }],
            order: [['created_at', 'DESC']]
        });
        
        res.render('profile/orders', {
            orders,
            user: req.session.user
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка сервера');
    }
});

router.post('/delivery-info', isAuthenticated, async (req, res) => {
    try {
        const { address, city, postal_code, phone } = req.body;
        
        await DeliveryInfo.upsert({
            user_id: req.session.user.id,
            address,
            city,
            postal_code,
            phone
        });
        
        req.flash('success', 'Информация о доставке обновлена');
        res.redirect('/profile');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Произошла ошибка при обновлении информации');
        res.redirect('/profile');
    }
});

module.exports = router; 