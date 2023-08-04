'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Vendor extends Model {
    static associate(models) {
      Vendor.hasMany(models.User, { foreignKey: 'vendorId' });
    }
  }
  Vendor.init({
    uuid: DataTypes.UUID,
    vendorName: DataTypes.STRING,
    vendor_is_active: DataTypes.BOOLEAN,
    vendor_description:DataTypes.STRING,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'Vendor',
    paranoid: true, // Enables soft deletes
  });
  return Vendor;
};
