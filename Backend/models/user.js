'use strict';
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

  // Cifra la contraseña antes de crear el usuario
  User.beforeCreate((user, options) => {
    const salt = bcrypt.genSaltSync(10); // Genera un salt
    user.password = bcrypt.hashSync(user.password, salt); // Cifra la contraseña
  });

  // Método para comparar contraseñas
  User.prototype.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password); // Compara la contraseña ingresada con la almacenada
  };

  return User;
};
