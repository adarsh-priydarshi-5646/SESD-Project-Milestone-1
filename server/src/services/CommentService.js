const CommentRepository = require('../repositories/CommentRepository');
const TaskRepository = require('../repositories/TaskRepository');
const NotificationService = require('./NotificationService');
const { ValidationError, ForbiddenError } = require('../utils/errors');

class CommentService {
  async createComment(commentData, user) {
    this.validateCommentData(commentData);

    // Verify task exists
    const task = await TaskRepository.findById(commentData.taskId);
    if (!task) {
      throw new ValidationError('Task not found');
    }

    commentData.userId = user.id;
    const comment = await CommentRepository.save(commentData);

    // Extract mentions
    comment.extractMentions();
    await comment.save();

    // Send notifications
    await NotificationService.notifyCommentAdded(comment, task);

    return await CommentRepository.findById(comment.id);
  }

  async updateComment(commentId, updateData, user) {
    const comment = await CommentRepository.findById(commentId);
    
    if (!comment) {
      throw new ValidationError('Comment not found');
    }

    if (comment.userId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenError('You can only edit your own comments');
    }

    this.validateCommentData(updateData, true);

    return await CommentRepository.update(commentId, updateData);
  }

  async deleteComment(commentId, user) {
    const comment = await CommentRepository.findById(commentId);
    
    if (!comment) {
      throw new ValidationError('Comment not found');
    }

    if (comment.userId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenError('You can only delete your own comments');
    }

    await CommentRepository.delete(commentId);
    return { message: 'Comment deleted successfully' };
  }

  async getTaskComments(taskId) {
    return await CommentRepository.findByTask(taskId);
  }

  validateCommentData(commentData, isUpdate = false) {
    if (!isUpdate && !commentData.taskId) {
      throw new ValidationError('Task ID is required');
    }

    if (!commentData.content || commentData.content.trim().length === 0) {
      throw new ValidationError('Comment content is required');
    }

    if (commentData.content.length > 2000) {
      throw new ValidationError('Comment content must be less than 2000 characters');
    }
  }
}

module.exports = new CommentService();
