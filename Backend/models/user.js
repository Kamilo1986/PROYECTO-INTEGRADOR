const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
const User = sequelize.define('User', {
    email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    },
    password: {
    type: DataTypes.STRING,
    allowNull: false,
    },
});


User.beforeCreate((user, options) => {
    const salt = bcrypt.genSaltSync(10);
    user.password = bcrypt.hashSync(user.password, salt);
});

return User;
};