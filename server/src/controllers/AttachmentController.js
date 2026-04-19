const AttachmentService = require('../services/AttachmentService');
const logger = require('../utils/logger');
const path = require('path');

class AttachmentController {
  async uploadAttachment(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: { message: 'No file uploaded' }
        });
      }

      const attachmentData = {
        taskId: req.body.taskId,
        fileName: req.file.originalname,
        filePath: req.file.path,
        fileType: req.file.mimetype,
        fileSize: req.file.size
      };

      const attachment = await AttachmentService.createAttachment(attachmentData, req.user);

      logger.info(`Attachment uploaded: ${attachment.id} by user: ${req.user.id}`);
      
      res.status(201).json({
        success: true,
        message: 'File uploaded successfully',
        data: { attachment }
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAttachment(req, res, next) {
    try {
      const { id } = req.params;
      const user = req.user;
      
      const result = await AttachmentService.deleteAttachment(id, user);
      
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  async getTaskAttachments(req, res, next) {
    try {
      const { taskId } = req.params;
      
      const attachments = await AttachmentService.getTaskAttachments(taskId);
      
      res.status(200).json({
        success: true,
        data: { attachments }
      });
    } catch (error) {
      next(error);
    }
  }

  async downloadAttachment(req, res, next) {
    try {
      const { id } = req.params;
      
      const attachment = await AttachmentService.getAttachmentById(id);
      
      res.download(attachment.filePath, attachment.fileName);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AttachmentController();
