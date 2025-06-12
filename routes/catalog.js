const express = require('express');
const router = express.Router();
const { Product, Category } = require('../models');

router.get('/', async (req, res) => {
    try {
        const categories = await Category.findAll();
        const products = await Product.findAll({
            include: [Category]
        });
        
        res.render('catalog/index', {
            categories,
            products,
            user: req.session.user
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка сервера');
    }
});

router.get('/category/:slug', async (req, res) => {
    try {
        const category = await Category.findOne({
            where: { slug: req.params.slug }
        });
        
        if (!category) {
            return res.status(404).send('Категория не найдена');
        }
        
        const products = await Product.findAll({
            where: { category_id: category.id },
            include: [Category]
        });
        
        res.render('catalog/category', {
            category,
            products,
            user: req.session.user
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка сервера');
    }
});

router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            include: [Category]
        });
        console.log('Открытие товара:', req.params.id, 'Результат:', product);
        if (!product) {
            return res.status(404).send('Товар не найден');
        }
        res.render('catalog/product', {
            product,
            user: req.session.user
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка сервера');
    }
});

module.exports = router; 