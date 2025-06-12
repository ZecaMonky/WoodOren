const { Product, Category, Order, OrderItem } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('sequelize');

exports.getCatalog = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 12;
        const offset = (page - 1) * limit;
        const categoryId = req.query.category;
        const search = req.query.search;
        const sort = req.query.sort || 'default';
        const minPrice = req.query.minPrice;
        const maxPrice = req.query.maxPrice;

        // Базовые условия поиска
        const where = {};
        if (categoryId) where.category_id = categoryId;
        if (search) {
            where[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { description: { [Op.iLike]: `%${search}%` } }
            ];
        }
        if (minPrice) where.price = { ...where.price, [Op.gte]: minPrice };
        if (maxPrice) where.price = { ...where.price, [Op.lte]: maxPrice };

        // Настройка сортировки
        let order = [];
        switch (sort) {
            case 'price_asc':
                order = [['price', 'ASC']];
                break;
            case 'price_desc':
                order = [['price', 'DESC']];
                break;
            case 'name_asc':
                order = [['name', 'ASC']];
                break;
            case 'name_desc':
                order = [['name', 'DESC']];
                break;
            default:
                order = [['created_at', 'DESC']];
        }

        // Получение товаров
        const { count, rows: products } = await Product.findAndCountAll({
            where,
            include: [{
                model: Category,
                attributes: ['name']
            }],
            order,
            limit,
            offset
        });

        // Получение категорий для фильтра
        const categories = await Category.findAll();

        // Получение минимальной и максимальной цены
        const priceRange = await Product.findAll({
            attributes: [
                [sequelize.fn('MIN', sequelize.col('price')), 'minPrice'],
                [sequelize.fn('MAX', sequelize.col('price')), 'maxPrice']
            ]
        });

        res.render('shop/catalog', {
            title: 'Каталог',
            products,
            categories,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            currentCategory: categoryId,
            currentSearch: search,
            currentSort: sort,
            currentMinPrice: minPrice,
            currentMaxPrice: maxPrice,
            priceRange: priceRange[0],
            query: req.query
        });
    } catch (error) {
        console.error('Ошибка при загрузке каталога:', error);
        res.status(500).render('error', { 
            message: 'Ошибка при загрузке каталога',
            layout: 'layouts/main'
        });
    }
};

exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            include: [{ model: Category }]
        });

        if (!product) {
            return res.status(404).render('error', { message: 'Товар не найден' });
        }

        res.render('shop/product', { product });
    } catch (error) {
        console.error('Product error:', error);
        res.status(500).render('error', { message: 'Ошибка при загрузке товара' });
    }
};

exports.getCart = async (req, res) => {
    const cart = req.session.cart || [];
    if (cart.length === 0) {
        return res.render('shop/cart', { cart: [] });
    }
    const productIds = cart.map(item => item.id);
    const products = await Product.findAll({ where: { id: productIds } });

    const cartItems = products.map(product => {
        const cartItem = cart.find(item => item.id === product.id);
        return {
            ...product.toJSON(),
            quantity: cartItem.quantity
        };
    });

    res.render('shop/cart', { cart: cartItems });
};

exports.addToCart = (req, res) => {
    const { id, quantity = 1 } = req.body;
    const cart = req.session.cart || [];

    const existingItem = cart.find(item => item.id === parseInt(id));
    if (existingItem) {
        existingItem.quantity += parseInt(quantity);
    } else {
        cart.push({ id: parseInt(id), quantity: parseInt(quantity) });
    }

    req.session.cart = cart;
    res.redirect('/cart');
};

exports.updateCart = (req, res) => {
    const { id, quantity } = req.body;
    const cart = req.session.cart || [];

    const item = cart.find(item => item.id === parseInt(id));
    if (item) {
        item.quantity = parseInt(quantity);
        if (item.quantity <= 0) {
            req.session.cart = cart.filter(item => item.id !== parseInt(id));
        }
    }

    res.redirect('/cart');
};

exports.removeFromCart = (req, res) => {
    const { id } = req.params;
    const cart = req.session.cart || [];

    req.session.cart = cart.filter(item => item.id !== parseInt(id));
    res.redirect('/cart');
};

exports.getCheckout = async (req, res) => {
    try {
        const cart = req.session.cart || [];
        if (cart.length === 0) {
            return res.redirect('/cart');
        }

        const productIds = cart.map(item => item.id);
        const products = await Product.findAll({
            where: { id: productIds }
        });

        const cartItems = products.map(product => {
            const cartItem = cart.find(item => item.id === product.id);
            return {
                ...product.toJSON(),
                quantity: cartItem.quantity,
                total: product.price * cartItem.quantity
            };
        });

        const total = cartItems.reduce((sum, item) => sum + item.total, 0);

        res.render('shop/checkout', { cartItems, total });
    } catch (error) {
        console.error('Checkout error:', error);
        res.status(500).render('error', { message: 'Ошибка при оформлении заказа' });
    }
};

exports.createOrder = async (req, res) => {
    try {
        const { full_name, phone, city, street, house, apartment, postal_code } = req.body;
        const cart = req.session.cart || [];

        if (cart.length === 0) {
            return res.redirect('/cart');
        }

        const productIds = cart.map(item => item.id);
        const products = await Product.findAll({
            where: { id: productIds }
        });

        const orderItems = products.map(product => {
            const cartItem = cart.find(item => item.id === product.id);
            return {
                product_id: product.id,
                quantity: cartItem.quantity,
                price: product.price
            };
        });

        const total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Собираем адрес в одну строку
        const shipping_address = `${full_name}, ${phone}, ${city}, ул. ${street}, д. ${house}, кв. ${apartment}, ${postal_code}`;

        const order = await Order.create({
            user_id: req.session.user.id,
            status: 'pending',
            total_amount: total,
            shipping_address
        });

        await Promise.all(orderItems.map(item => 
            OrderItem.create({
                order_id: order.id,
                ...item
            })
        ));

        req.session.cart = [];
        res.redirect('/profile/orders');
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).render('error', { message: 'Ошибка при создании заказа' });
    }
}; 