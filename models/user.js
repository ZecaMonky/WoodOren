const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
    const User = sequelize.define('User', {
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        role: {
            type: DataTypes.STRING,
            defaultValue: 'user'
        },
        banned: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        tableName: 'users',
        freezeTableName: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        hooks: {
            beforeCreate: async (user) => {
                if (user.password) {
                    console.log('beforeCreate hook - Original password length:', user.password.length);
                    const hashedPassword = await bcrypt.hash(user.password, 10);
                    console.log('beforeCreate hook - Generated hash:', hashedPassword);
                    console.log('beforeCreate hook - Hash length:', hashedPassword.length);
                    user.password = hashedPassword;
                }
            },
            beforeUpdate: async (user) => {
                if (user.changed('password')) {
                    console.log('beforeUpdate hook - Original password length:', user.password.length);
                    const hashedPassword = await bcrypt.hash(user.password, 10);
                    console.log('beforeUpdate hook - Generated hash:', hashedPassword);
                    console.log('beforeUpdate hook - Hash length:', hashedPassword.length);
                    user.password = hashedPassword;
                }
            }
        }
    });

    User.prototype.validatePassword = async function(password) {
        console.log('validatePassword - Input password length:', password.length);
        console.log('validatePassword - Stored hash:', this.password);
        console.log('validatePassword - Stored hash length:', this.password.length);
        return bcrypt.compare(password, this.password);
    };

    return User;
}; 