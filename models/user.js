'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // define associations here
      User.hasMany(models.Shipment, {
        foreignKey: 'createdBy',
        as: 'shipments'
      });
      User.hasMany(models.ShipmentHistory, {
        foreignKey: 'updatedBy',
        as: 'updates'
      });
    }

    // Instance method to check password
    async comparePassword(candidatePassword) {
      return bcrypt.compare(candidatePassword, this.password);
    }
  }

  User.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
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
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'admin',
      validate: {
        isIn: [['admin']]
      }
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    lastLogin: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'User',
    hooks: {
      beforeSave: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  return User;
};