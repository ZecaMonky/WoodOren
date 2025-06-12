const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('DeliveryInfo', {
        address: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        city: {
            type: DataTypes.STRING,
            allowNull: false
        },
        postal_code: {
            type: DataTypes.STRING,
            allowNull: false
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        tableName: 'delivery_info',
        freezeTableName: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });
}; 