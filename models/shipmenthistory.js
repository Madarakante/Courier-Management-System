'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ShipmentHistory extends Model {
    static associate(models) {
      // define associations here
      ShipmentHistory.belongsTo(models.Shipment, {
        foreignKey: 'shipmentId',
        as: 'shipment'
      });
      ShipmentHistory.belongsTo(models.User, {
        foreignKey: 'updatedBy',
        as: 'updater'
      });
    }
  }

  ShipmentHistory.init({
    shipmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Shipments',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed_delivery']]
      }
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false
    },
    notes: DataTypes.TEXT,
    updatedBy: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'ShipmentHistory'
  });

  return ShipmentHistory;
};
