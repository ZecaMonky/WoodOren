const { Sequelize } = require('sequelize');
const config = require('../config/database')[process.env.NODE_ENV || 'development'];

const sequelize = new Sequelize(config.url, {
    dialect: config.dialect,
    dialectOptions: config.dialectOptions,
    logging: config.logging
});

const User = require('./user')(sequelize);
const Product = require('./product')(sequelize);
const Category = require('./category')(sequelize);
const Order = require('./order')(sequelize);
const OrderItem = require('./orderItem')(sequelize);
const DeliveryInfo = require('./deliveryInfo')(sequelize);
const ContactMessage = require('./contactMessage')(sequelize);

// Связи между моделями
Product.belongsTo(Category, { foreignKey: 'category_id' });
Category.hasMany(Product, { foreignKey: 'category_id' });

Order.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Order, { foreignKey: 'user_id' });

OrderItem.belongsTo(Order, { foreignKey: 'order_id' });
Order.hasMany(OrderItem, { foreignKey: 'order_id' });

OrderItem.belongsTo(Product, { foreignKey: 'product_id' });
Product.hasMany(OrderItem, { foreignKey: 'product_id' });

DeliveryInfo.belongsTo(User, { foreignKey: 'user_id' });
User.hasOne(DeliveryInfo, { foreignKey: 'user_id' });

module.exports = {
    sequelize,
    User,
    Product,
    Category,
    Order,
    OrderItem,
    DeliveryInfo,
    ContactMessage
}; 