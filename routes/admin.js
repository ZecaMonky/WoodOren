const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/auth');
const { Product, Category, Order, User, OrderItem, ContactMessage } = require('../models');
const { upload } = require('../config/cloudinary');
const adminController = require('../controllers/adminController');

// Dashboard
router.get('/', isAdmin, async (req, res) => {
    try {
        const [productsCount, categoriesCount, ordersCount, usersCount, contactMessagesCount] = await Promise.all([
            Product.count(),
            Category.count(),
            Order.count(),
            User.count(),
            ContactMessage.count()
        ]);
        
        const recentOrders = await Order.findAll({
            include: [{
                model: OrderItem,
                include: [Product]
            }],
            order: [['created_at', 'DESC']],
            limit: 5
        });

        res.render('admin/index', {
            user: req.session.user,
            productsCount,
            categoriesCount,
            ordersCount,
            usersCount,
            contactMessagesCount,
            recentOrders
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка сервера');
    }
});

// Products
router.get('/products', isAdmin, async (req, res) => {
    try {
        const products = await Product.findAll({
            include: [Category],
            order: [['created_at', 'DESC']]
        });
        
        res.render('admin/products/index', {
            products,
            user: req.session.user
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка сервера');
    }
});

router.get('/products/create', isAdmin, async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.render('admin/products/create', {
            categories,
            user: req.session.user
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка сервера');
    }
});

router.post('/products', isAdmin, upload.single('image'), async (req, res) => {
    try {
        const { name, description, price, category_id, stock } = req.body;
        await Product.create({
            name,
            description,
            price,
            category_id,
            stock,
            image: req.file ? req.file.path : null
        });
        
        req.flash('success', 'Товар успешно создан');
        res.redirect('/admin/products');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Ошибка при создании товара');
        res.redirect('/admin/products/create');
    }
});

router.get('/products/:id/edit', isAdmin, async (req, res) => {
    try {
        const [product, categories] = await Promise.all([
            Product.findByPk(req.params.id),
            Category.findAll()
        ]);
        
        if (!product) {
            return res.status(404).send('Товар не найден');
        }
        
        res.render('admin/products/edit', {
            product,
            categories,
            user: req.session.user
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка сервера');
    }
});

router.put('/products/:id', isAdmin, upload.single('image'), async (req, res) => {
    try {
        const { name, description, price, category_id, stock } = req.body;
        const product = await Product.findByPk(req.params.id);
        
        if (!product) {
            return res.status(404).send('Товар не найден');
        }
        
        await product.update({
            name,
            description,
            price,
            category_id,
            stock,
            image: req.file ? req.file.path : product.image
        });
        
        req.flash('success', 'Товар успешно обновлен');
        res.redirect('/admin/products');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Ошибка при обновлении товара');
        res.redirect(`/admin/products/${req.params.id}/edit`);
    }
});

router.delete('/products/:id', isAdmin, async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        
        if (!product) {
            return res.status(404).send('Товар не найден');
        }
        
        await product.destroy();
        req.flash('success', 'Товар успешно удален');
        res.redirect('/admin/products');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Ошибка при удалении товара');
        res.redirect('/admin/products');
    }
});

// Categories
router.get('/categories', isAdmin, async (req, res) => {
    try {
        const categories = await Category.findAll({
            include: [{
                model: Product,
                attributes: ['id']
            }],
            order: [['created_at', 'DESC']]
        });
        
        res.render('admin/categories/index', {
            categories,
            user: req.session.user
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка сервера');
    }
});

router.post('/categories', isAdmin, async (req, res) => {
    try {
        const { name } = req.body;
        const slug = name.toLowerCase().replace(/\s+/g, '-');
        
        await Category.create({ name, slug });
        req.flash('success', 'Категория успешно создана');
        res.redirect('/admin/categories');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Ошибка при создании категории');
        res.redirect('/admin/categories');
    }
});

router.put('/categories/:id', isAdmin, async (req, res) => {
    try {
        const { name } = req.body;
        const category = await Category.findByPk(req.params.id);
        
        if (!category) {
            return res.status(404).send('Категория не найдена');
        }
        
        const slug = name.toLowerCase().replace(/\s+/g, '-');
        await category.update({ name, slug });
        
        req.flash('success', 'Категория успешно обновлена');
        res.redirect('/admin/categories');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Ошибка при обновлении категории');
        res.redirect('/admin/categories');
    }
});

router.delete('/categories/:id', isAdmin, async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        
        if (!category) {
            return res.status(404).send('Категория не найдена');
        }
        
        await category.destroy();
        req.flash('success', 'Категория успешно удалена');
        res.redirect('/admin/categories');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Ошибка при удалении категории');
        res.redirect('/admin/categories');
    }
});

// Orders
router.get('/orders', isAdmin, adminController.getOrders);
router.put('/orders/:id/status', isAdmin, adminController.updateOrderStatus);

// Users
router.get('/users', isAdmin, async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] },
            order: [['created_at', 'DESC']]
        });
        
        res.render('admin/users/index', {
            users,
            user: req.session.user
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка сервера');
    }
});

router.put('/users/:id/role', isAdmin, async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findByPk(req.params.id);
        
        if (!user) {
            return res.status(404).send('Пользователь не найден');
        }
        
        await user.update({ role });
        req.flash('success', 'Роль пользователя обновлена');
        res.redirect('/admin/users');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Ошибка при обновлении роли пользователя');
        res.redirect('/admin/users');
    }
});

router.put('/users/:id/ban', isAdmin, async (req, res) => {
    try {
        const { ban } = req.body;
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).send('Пользователь не найден');
        }
        // Запретить банить себя
        if (user.id === req.session.user.id) {
            req.flash('error', 'Нельзя забанить самого себя!');
            return res.redirect('/admin/users');
        }
        // Запретить банить других админов
        if (user.role === 'admin') {
            req.flash('error', 'Нельзя банить других администраторов!');
            return res.redirect('/admin/users');
        }
        await user.update({ banned: !!parseInt(ban) });
        req.flash('success', ban === '1' ? 'Пользователь забанен' : 'Пользователь разбанен');
        res.redirect('/admin/users');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Ошибка при изменении статуса пользователя');
        res.redirect('/admin/users');
    }
});

router.get('/contact-messages', isAdmin, adminController.getContactMessages);

module.exports = router; 