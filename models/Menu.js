const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Menu = sequelize.define('Menu', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  category: {
    type: DataTypes.STRING, // e.g., Appetizer, Main Course
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING, // e.g., Chicken Tikka
    allowNull: false,
  },
  isVeg: {
    type: DataTypes.BOOLEAN, // true for veg, false for non-veg
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
}, {
  timestamps: true,
});

Menu.belongsTo(User, { foreignKey: 'userId' });

module.exports = Menu;