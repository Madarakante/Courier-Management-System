'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Packages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      shipmentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Shipments',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      pieceType: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT
      },
      length: {
        type: Sequelize.DECIMAL(10, 2)
      },
      width: {
        type: Sequelize.DECIMAL(10, 2)
      },
      height: {
        type: Sequelize.DECIMAL(10, 2)
      },
      weight: {
        type: Sequelize.DECIMAL(10, 2)
      },
      volumetricWeight: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      volume: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
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

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Packages');
  }
};