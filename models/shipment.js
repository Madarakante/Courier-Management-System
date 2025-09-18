const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class Shipment extends Model {
    static associate(models) {
      Shipment.belongsTo(models.User, {
        foreignKey: 'createdBy',
        as: 'creator'
      });
      Shipment.hasMany(models.ShipmentHistory, {
        foreignKey: 'shipmentId',
        as: 'history'
      });
      Shipment.hasMany(models.Package, {
        foreignKey: 'shipmentId',
        as: 'packages'
      });
    }
  }

  Shipment.init({
    trackingNumber: {
      type: DataTypes.STRING,
      unique: true
    },
    // Shipper Details
    shipperName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    shipperPhone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    shipperAddress: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    shipperEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    // Receiver Details
    receiverName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    receiverPhone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    receiverAddress: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    receiverEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    // Shipment Details
    shipmentType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    totalWeight: {
      type: DataTypes.DECIMAL(10, 2)
    },
    courier: {
      type: DataTypes.STRING
    },
    totalPackages: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    mode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    product: {
      type: DataTypes.STRING
    },
    quantity: {
      type: DataTypes.INTEGER
    },
    paymentMode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    totalFreight: {
      type: DataTypes.DECIMAL(10, 2)
    },
    carrier: {
      type: DataTypes.STRING
    },
    carrierReferenceNo: {
      type: DataTypes.STRING
    },
    departureTime: {
      type: DataTypes.DATE
    },
    origin: {
      type: DataTypes.STRING,
      allowNull: false
    },
    destination: {
      type: DataTypes.STRING,
      allowNull: false
    },
    pickupDate: {
      type: DataTypes.DATE
    },
    pickupTime: {
      type: DataTypes.TIME
    },
    expectedDeliveryDate: {
      type: DataTypes.DATE
    },
    comments: {
      type: DataTypes.TEXT
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending'
    },
    currentLocation: {
      type: DataTypes.STRING
    },
    currentLocationUpdatedAt: {
      type: DataTypes.DATE
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Shipment',
    hooks: {
      beforeValidate: (shipment) => {
        if (!shipment.trackingNumber) {
          // Generate tracking number: AS (Atlantic Shipping) + Year + Random UUID
          const year = new Date().getFullYear().toString().substr(-2);
          const uniqueId = uuidv4().substr(0, 6).toUpperCase();
          shipment.trackingNumber = `AS${year}${uniqueId}`;
        }
      }
    }
  });

  return Shipment;
};