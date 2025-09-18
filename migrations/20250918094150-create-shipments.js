'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Shipments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      trackingNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      customerName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      customerEmail: {
        type: Sequelize.STRING,
        allowNull: false
      },
      customerPhone: {
        type: Sequelize.STRING
      },
      customerAddress: {
        type: Sequelize.STRING
      },
      originLocation: {
        type: Sequelize.STRING,
        allowNull: false
      },
      originAddress: {
        type: Sequelize.STRING
      },
      destinationLocation: {
        type: Sequelize.STRING,
        allowNull: false
      },
      destinationAddress: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'pending'
      },
      currentLocation: {
        type: Sequelize.STRING
      },
      currentLocationUpdatedAt: {
        type: Sequelize.DATE
      },
      estimatedDelivery: {
        type: Sequelize.DATE
      },
      actualDelivery: {
        type: Sequelize.DATE
      },
      weight: {
        type: Sequelize.FLOAT
      },
      dimensions: {
        type: Sequelize.JSON
      },
      notes: {
        type: Sequelize.TEXT
      },
      createdBy: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Shipments');
  }
};