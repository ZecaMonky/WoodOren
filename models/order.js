const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Order', {
        status: {
            type: DataTypes.STRING,
            defaultValue: 'pending',
            validate: {
                isIn: [['pending', 'processing', 'shipped', 'delivered', 'cancelled']]
            }
        },
        total_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        shipping_address: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    }, {
        tableName: 'orders',
        freezeTableName: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });
}; 