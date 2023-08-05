'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      Category.belongsTo(models.Vendor, { foreignKey: 'vendorId' });
    }
  }
  Category.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    uuid: DataTypes.UUID,
    categoryName: {
      type: DataTypes.STRING,
    },
    categoryOne: {
      type: DataTypes.STRING,
    },
    categoryTwo: {
      type: DataTypes.STRING,
    },
    categoryThree: {
      type: DataTypes.STRING,
    },
    categoryFour: {
      type: DataTypes.STRING,
    },
    categoryFive: {
      type: DataTypes.STRING,
    },
    categorySix: {
      type: DataTypes.STRING,
    },
    categorySeven: {
      type: DataTypes.STRING
    },
    vendorId: DataTypes.INTEGER,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'Category',
    paranoid: true, // Enables soft deletes
  });
  return Category;
};
