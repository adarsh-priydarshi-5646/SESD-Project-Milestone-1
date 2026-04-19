const { DataTypes } = require('sequelize');

const baseEntityFields = {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
};

const baseEntityOptions = {
  timestamps: true,
  underscored: false
};

module.exports = {
  baseEntityFields,
  baseEntityOptions
};
