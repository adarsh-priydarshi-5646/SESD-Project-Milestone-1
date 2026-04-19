const { Comment, User } = require('../models');

class CommentRepository {
  async save(commentData) {
    return await Comment.create(commentData);
  }

  async findById(commentId) {
    return await Comment.findByPk(commentId, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'email'] }
      ]
    });
  }

  async findByTask(taskId) {
    return await Comment.findAll({
      where: { taskId },
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  async update(commentId, updateData) {
    const comment = await Comment.findByPk(commentId);
    if (!comment) return null;
    
    return await comment.update(updateData);
  }

  async delete(commentId) {
    const comment = await Comment.findByPk(commentId);
    if (!comment) return null;
    
    await comment.destroy();
    return true;
  }
}

module.exports = new CommentRepository();
