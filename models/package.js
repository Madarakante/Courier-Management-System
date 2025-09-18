const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Package extends Model {
    static associate(models) {
      Package.belongsTo(models.Shipment, {
        foreignKey: 'shipmentId',
        as: 'shipment'
      });
    }
  }

  Package.init({
    shipmentId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    pieceType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    length: {
      type: DataTypes.DECIMAL(10, 2)
    },
    width: {
      type: DataTypes.DECIMAL(10, 2)
    },
    height: {
      type: DataTypes.DECIMAL(10, 2)
    },
    weight: {
      type: DataTypes.DECIMAL(10, 2)
    },
    volumetricWeight: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    volume: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'Package',
    hooks: {
      beforeSave: (package) => {
        // Calculate volume and volumetric weight
        if (package.length && package.width && package.height) {
          package.volume = (package.length * package.width * package.height) / 1000000; // Convert to cubic meters
          package.volumetricWeight = (package.length * package.width * package.height) / 5000; // Standard volumetric weight calculation
        }
      }
    }
  });

  return Package;
};
