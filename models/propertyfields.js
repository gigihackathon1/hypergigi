'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PropertyField extends Model {
    static associate(models) {
      PropertyField.belongsTo(models.Vendor, { foreignKey: 'vendorId' });
    }
  }
  PropertyField.init({
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
    uuid: DataTypes.UUID,
    propertyFields: DataTypes.STRING,
    prices: DataTypes.STRING,
    places: DataTypes.STRING,
    negotiation: DataTypes.BOOLEAN,
    area:{
        type: DataTypes.STRING,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
    vendorId: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'PropertyField',
    tableName: 'propertyFieldsTable', // Make sure this matches the actual table name
  });
  return PropertyField;
};
