'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Drop existing columns
    await queryInterface.removeColumn('Shipments', 'customerName');
    await queryInterface.removeColumn('Shipments', 'customerEmail');
    await queryInterface.removeColumn('Shipments', 'customerPhone');
    await queryInterface.removeColumn('Shipments', 'customerAddress');
    await queryInterface.removeColumn('Shipments', 'originLocation');
    await queryInterface.removeColumn('Shipments', 'originAddress');
    await queryInterface.removeColumn('Shipments', 'destinationLocation');
    await queryInterface.removeColumn('Shipments', 'destinationAddress');
    await queryInterface.removeColumn('Shipments', 'weight');
    await queryInterface.removeColumn('Shipments', 'dimensions');
    await queryInterface.removeColumn('Shipments', 'notes');

    // Add new columns
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn('Shipments', 'shipperName', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Legacy Customer'
      }, { transaction });

      await queryInterface.addColumn('Shipments', 'shipperPhone', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'N/A'
      }, { transaction });

      await queryInterface.addColumn('Shipments', 'shipperAddress', {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: 'N/A'
      }, { transaction });

      await queryInterface.addColumn('Shipments', 'shipperEmail', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'legacy@example.com'
      }, { transaction });

      await queryInterface.addColumn('Shipments', 'receiverName', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Legacy Customer'
      }, { transaction });

      await queryInterface.addColumn('Shipments', 'receiverPhone', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'N/A'
      }, { transaction });

      await queryInterface.addColumn('Shipments', 'receiverAddress', {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: 'N/A'
      }, { transaction });

      await queryInterface.addColumn('Shipments', 'receiverEmail', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'legacy@example.com'
      }, { transaction });

      await queryInterface.addColumn('Shipments', 'shipmentType', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Standard'
      }, { transaction });

      await queryInterface.addColumn('Shipments', 'totalWeight', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('Shipments', 'courier', {
        type: Sequelize.STRING,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('Shipments', 'totalPackages', {
        type: Sequelize.INTEGER,
        defaultValue: 1
      }, { transaction });

      await queryInterface.addColumn('Shipments', 'mode', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Standard'
      }, { transaction });

      await queryInterface.addColumn('Shipments', 'product', {
        type: Sequelize.STRING,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('Shipments', 'quantity', {
        type: Sequelize.INTEGER,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('Shipments', 'paymentMode', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Prepaid'
      }, { transaction });

      await queryInterface.addColumn('Shipments', 'totalFreight', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('Shipments', 'carrier', {
        type: Sequelize.STRING,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('Shipments', 'carrierReferenceNo', {
        type: Sequelize.STRING,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('Shipments', 'departureTime', {
        type: Sequelize.DATE,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('Shipments', 'origin', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Unknown'
      }, { transaction });

      await queryInterface.addColumn('Shipments', 'destination', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Unknown'
      }, { transaction });

      await queryInterface.addColumn('Shipments', 'pickupDate', {
        type: Sequelize.DATE,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('Shipments', 'pickupTime', {
        type: Sequelize.TIME,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('Shipments', 'expectedDeliveryDate', {
        type: Sequelize.DATE,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('Shipments', 'comments', {
        type: Sequelize.TEXT,
        allowNull: true
      }, { transaction });
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      // Restore original columns
      await queryInterface.addColumn('Shipments', 'customerName', {
        type: Sequelize.STRING,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('Shipments', 'customerEmail', {
        type: Sequelize.STRING,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('Shipments', 'customerPhone', {
        type: Sequelize.STRING,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('Shipments', 'customerAddress', {
        type: Sequelize.TEXT,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('Shipments', 'originLocation', {
        type: Sequelize.STRING,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('Shipments', 'originAddress', {
        type: Sequelize.TEXT,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('Shipments', 'destinationLocation', {
        type: Sequelize.STRING,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('Shipments', 'destinationAddress', {
        type: Sequelize.TEXT,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('Shipments', 'weight', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('Shipments', 'dimensions', {
        type: Sequelize.JSON,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('Shipments', 'notes', {
        type: Sequelize.TEXT,
        allowNull: true
      }, { transaction });

      // Remove new columns
      await queryInterface.removeColumn('Shipments', 'shipperName', { transaction });
      await queryInterface.removeColumn('Shipments', 'shipperPhone', { transaction });
      await queryInterface.removeColumn('Shipments', 'shipperAddress', { transaction });
      await queryInterface.removeColumn('Shipments', 'shipperEmail', { transaction });
      await queryInterface.removeColumn('Shipments', 'receiverName', { transaction });
      await queryInterface.removeColumn('Shipments', 'receiverPhone', { transaction });
      await queryInterface.removeColumn('Shipments', 'receiverAddress', { transaction });
      await queryInterface.removeColumn('Shipments', 'receiverEmail', { transaction });
      await queryInterface.removeColumn('Shipments', 'shipmentType', { transaction });
      await queryInterface.removeColumn('Shipments', 'totalWeight', { transaction });
      await queryInterface.removeColumn('Shipments', 'courier', { transaction });
      await queryInterface.removeColumn('Shipments', 'totalPackages', { transaction });
      await queryInterface.removeColumn('Shipments', 'mode', { transaction });
      await queryInterface.removeColumn('Shipments', 'product', { transaction });
      await queryInterface.removeColumn('Shipments', 'quantity', { transaction });
      await queryInterface.removeColumn('Shipments', 'paymentMode', { transaction });
      await queryInterface.removeColumn('Shipments', 'totalFreight', { transaction });
      await queryInterface.removeColumn('Shipments', 'carrier', { transaction });
      await queryInterface.removeColumn('Shipments', 'carrierReferenceNo', { transaction });
      await queryInterface.removeColumn('Shipments', 'departureTime', { transaction });
      await queryInterface.removeColumn('Shipments', 'origin', { transaction });
      await queryInterface.removeColumn('Shipments', 'destination', { transaction });
      await queryInterface.removeColumn('Shipments', 'pickupDate', { transaction });
      await queryInterface.removeColumn('Shipments', 'pickupTime', { transaction });
      await queryInterface.removeColumn('Shipments', 'expectedDeliveryDate', { transaction });
      await queryInterface.removeColumn('Shipments', 'comments', { transaction });
    });
  }
};