const CommentService = require('../services/CommentService');
const logger = require('../utils/logger');

class CommentController {
  async createComment(req, res, next) {
    try {
      const commentData = req.body;
      const user = req.user;
      
      const comment = await CommentService.createComment(commentData, user);

      logger.info(`Comment created: ${comment.id} by user: ${user.id}`);
      
      res.status(201).json({
        success: true,
        message: 'Comment created successfully',
        data: { comment }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateComment(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const user = req.user;
      
      const comment = await CommentService.updateComment(id, updateData, user);
      
      res.status(200).json({
        success: true,
        message: 'Comment updated successfully',
        data: { comment }
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteComment(req, res, next) {
    try {
      const { id } = req.params;
      const user = req.user;
      
      const result = await CommentService.deleteComment(id, user);
      
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  async getTaskComments(req, res, next) {
    try {
      const { taskId } = req.params;
      
      const comments = await CommentService.getTaskComments(taskId);
      
      res.status(200).json({
        success: true,
        data: { comments }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CommentController();
