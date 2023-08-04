'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      productName: {
        type: Sequelize.TEXT('long'),
        allowNull: false,
      },
      productDescription: {
        type: Sequelize.TEXT,
      },
      productLocation: {
        type: Sequelize.STRING,
      },
      productPincode: {
        type: Sequelize.STRING,
      },
      productUrl: {
        type: Sequelize.STRING,
      },
      productImageUrl: {
        type: Sequelize.TEXT('long'),
      },
      vendorId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Vendors', // Make sure to adjust this to your Vendor table name
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      deletedAt: {
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Products');
  },
};
