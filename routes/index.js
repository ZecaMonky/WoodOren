const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const shopController = require('../controllers/shopController');
const profileController = require('../controllers/profileController');
const { isAuthenticated } = require('../middleware/auth');
const indexController = require('../controllers/indexController');

// Главная страница
router.get('/', indexController.getHome);

// О нас и Контакты
router.get('/about', indexController.getAbout);
router.get('/contact', indexController.getContact);

// Аутентификация
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.get('/register', authController.getRegister);
router.post('/register', authController.postRegister);
router.get('/logout', authController.logout);

// Каталог и товары
router.get('/catalog', shopController.getCatalog);
router.get('/product/:id', shopController.getProduct);

// Корзина
router.get('/cart', shopController.getCart);
router.post('/cart/add', shopController.addToCart);
router.post('/cart/update', shopController.updateCart);
router.post('/cart/remove/:id', shopController.removeFromCart);

// Оформление заказа
router.get('/checkout', isAuthenticated, shopController.getCheckout);
router.post('/checkout', isAuthenticated, shopController.createOrder);

// Профиль пользователя
router.get('/profile', isAuthenticated, profileController.getProfile);
router.post('/profile', isAuthenticated, profileController.updateProfile);
router.get('/profile/orders', isAuthenticated, profileController.getOrders);
router.get('/profile/orders/:id', isAuthenticated, profileController.getOrderDetails);

module.exports = router; 