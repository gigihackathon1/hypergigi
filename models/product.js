'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      Product.belongsTo(models.Vendor, { foreignKey: 'vendorId' });
    }
  }
  Product.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    uuid: DataTypes.UUID,
    productName: DataTypes.TEXT('long'),
    productDescription: DataTypes.TEXT,
    productLocation: DataTypes.STRING,
    productPincode: DataTypes.STRING,
    productUrl: DataTypes.STRING,
    productImageUrl: DataTypes.TEXT('long'),
    vendorId: DataTypes.INTEGER,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'Product',
    paranoid: true, // Enables soft deletes
  });
  return Product;
};
