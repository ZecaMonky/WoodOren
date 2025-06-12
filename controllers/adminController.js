const { Order, User, OrderItem, Product, ContactMessage } = require('../models');

// Управление заказами
exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            include: [
                { model: User, attributes: ['name', 'email'] },
                { 
                    model: OrderItem,
                    include: [{ model: Product, attributes: ['name'] }]
                }
            ],
            order: [['created_at', 'DESC']]
        });

        res.render('admin/orders/index', { orders });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.render('admin/orders/index', { 
            orders: [],
            error: 'Ошибка при загрузке заказов'
        });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const order = await Order.findByPk(id);
        if (!order) {
            return res.status(404).json({ error: 'Заказ не найден' });
        }

        await order.update({ status });
        res.redirect('/admin/orders');
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ error: 'Ошибка при обновлении статуса заказа' });
    }
};

exports.getContactMessages = async (req, res) => {
    try {
        const messages = await ContactMessage.findAll({ order: [['created_at', 'DESC']] });
        res.render('admin/contact-messages', { messages });
    } catch (error) {
        console.error('Ошибка при получении сообщений:', error);
        res.status(500).render('error', { message: 'Ошибка при получении сообщений' });
    }
};

// Управление товарами
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            include: [{ model: Category }],
            order: [['created_at', 'DESC']]
        });
        res.render('admin/products/index', { products });
    } catch (error) {
        console.error('Ошибка при загрузке товаров:', error);
        res.status(500).render('error', { message: 'Ошибка при загрузке товаров' });
    }
};

exports.toggleProductVisibility = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id);
        
        if (!product) {
            return res.status(404).json({ error: 'Товар не найден' });
        }

        await product.update({ hidden: !product.hidden });
        res.redirect('/admin/products');
    } catch (error) {
        console.error('Ошибка при обновлении видимости товара:', error);
        res.status(500).json({ error: 'Ошибка при обновлении видимости товара' });
    }
}; 