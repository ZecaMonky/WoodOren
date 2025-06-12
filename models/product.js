const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Product', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        image: {
            type: DataTypes.STRING
        },
        stock: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        category_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        hidden: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        tableName: 'products',
        freezeTableName: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });
}; 