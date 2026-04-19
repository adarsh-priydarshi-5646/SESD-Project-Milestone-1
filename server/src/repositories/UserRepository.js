const { User } = require('../models');
const { Op } = require('sequelize');

class UserRepository {
  async save(userData) {
    return await User.create(userData);
  }

  async findById(userId) {
    return await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });
  }

  async findByEmail(email) {
    return await User.findOne({ where: { email } });
  }

  async findAll(filters = {}) {
    const where = {};
    
    if (filters.role) {
      where.role = filters.role;
    }
    
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${filters.search}%` } },
        { email: { [Op.iLike]: `%${filters.search}%` } }
      ];
    }

    return await User.findAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      limit: filters.limit || 50,
      offset: filters.offset || 0
    });
  }

  async update(userId, updateData) {
    const user = await User.findByPk(userId);
    if (!user) return null;
    
    return await user.update(updateData);
  }

  async delete(userId) {
    const user = await User.findByPk(userId);
    if (!user) return null;
    
    await user.destroy();
    return true;
  }

  async count(filters = {}) {
    const where = {};
    
    if (filters.role) {
      where.role = filters.role;
    }
    
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    return await User.count({ where });
  }
}

module.exports = new UserRepository();
