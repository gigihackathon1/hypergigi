'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Subcategory extends Model {
    static associate(models) {
      Subcategory.belongsTo(models.Category, { foreignKey: 'categoryId' });
    }
  }
  Subcategory.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    uuid: DataTypes.UUID,
    subcategoryName: DataTypes.STRING,
    categoryId: DataTypes.INTEGER,
    flatOrApartment:{
      type: DataTypes.STRING,
    },
    builderFloor:{
      type: DataTypes.STRING,
    },
    pentHouse:{
      type: DataTypes.STRING,
    },
    serviceApartment:{
      type: DataTypes.STRING,
    },
    studioApartment:{
      type: DataTypes.STRING,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'Subcategory',
    paranoid: true, // Enables soft deletes
  });
  return Subcategory;
};
