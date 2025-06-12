const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const ContactMessage = sequelize.define('ContactMessage', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { isEmail: true }
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        is_read: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        tableName: 'contact_messages',
        freezeTableName: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });
    return ContactMessage;
}; 