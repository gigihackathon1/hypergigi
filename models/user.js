'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsTo(models.Vendor, { foreignKey: 'vendorId' });
    }
  }
  User.init({
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true,
    },
    username: DataTypes.STRING,
    phoneNo:{
      type: DataTypes.STRING,
    },
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    roleId: DataTypes.INTEGER,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
    isMobileVerified:{
      type: DataTypes.STRING,
    },
    googleId: DataTypes.STRING,
    user_description:DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'User',
    paranoid: true, // Enables soft deletes
  });
  return User;
};
