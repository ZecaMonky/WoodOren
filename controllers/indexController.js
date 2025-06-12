const { Product, Category } = require('../models');

exports.getHome = async (req, res) => {
    try {
        const products = await Product.findAll({
            where: {
                hidden: false
            },
            include: [{
                model: Category,
                attributes: ['name']
            }],
            limit: 3,
            order: [['created_at', 'DESC']]
        });

        res.render('index', {
            title: 'Главная',
            products
        });
    } catch (error) {
        console.error('Ошибка при загрузке главной страницы:', error);
        res.status(500).render('error', { 
            message: 'Ошибка при загрузке главной страницы',
            layout: 'layouts/main'
        });
    }
};

exports.getAbout = (req, res) => {
    res.render('about', { title: 'О нас' });
};

exports.getContact = (req, res) => {
    res.render('contact', { title: 'Контакты' });
}; 