const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { baseEntityFields, baseEntityOptions } = require('./BaseEntity');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    ...baseEntityFields,
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('ADMIN', 'MANAGER', 'TEAM_MEMBER'),
      allowNull: false,
      defaultValue: 'TEAM_MEMBER'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    ...baseEntityOptions,
    tableName: 'users',
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      }
    }
  });

  // Instance methods
  User.prototype.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  };

  User.prototype.hasPermission = function(action) {
    const permissions = {
      ADMIN: ['*'],
      MANAGER: ['CREATE_PROJECT', 'ASSIGN_TASK', 'VIEW_ANALYTICS', 'MANAGE_TEAM'],
      TEAM_MEMBER: ['VIEW_TASKS', 'UPDATE_OWN_TASKS', 'ADD_COMMENTS']
    };
    
    if (this.role === 'ADMIN') return true;
    return permissions[this.role]?.includes(action) || false;
  };

  User.prototype.isManager = function() {
    return this.role === 'MANAGER' || this.role === 'ADMIN';
  };

  User.prototype.isAdmin = function() {
    return this.role === 'ADMIN';
  };

  User.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.password;
    return values;
  };

  return User;
};
