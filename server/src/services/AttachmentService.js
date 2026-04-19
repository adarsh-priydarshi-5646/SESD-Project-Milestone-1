const AttachmentRepository = require('../repositories/AttachmentRepository');
const TaskRepository = require('../repositories/TaskRepository');
const { ValidationError, ForbiddenError } = require('../utils/errors');
const fs = require('fs').promises;
const path = require('path');

class AttachmentService {
  async createAttachment(attachmentData, user) {
    // Verify task exists
    const task = await TaskRepository.findById(attachmentData.taskId);
    if (!task) {
      throw new ValidationError('Task not found');
    }

    attachmentData.uploadedBy = user.id;
    const attachment = await AttachmentRepository.save(attachmentData);

    return await AttachmentRepository.findById(attachment.id);
  }

  async deleteAttachment(attachmentId, user) {
    const attachment = await AttachmentRepository.findById(attachmentId);
    
    if (!attachment) {
      throw new ValidationError('Attachment not found');
    }

    if (attachment.uploadedBy !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenError('You can only delete your own attachments');
    }

    // Delete file from filesystem
    try {
      await fs.unlink(attachment.filePath);
    } catch (error) {
      // File might not exist, continue with database deletion
    }

    await AttachmentRepository.delete(attachmentId);
    return { message: 'Attachment deleted successfully' };
  }

  async getTaskAttachments(taskId) {
    return await AttachmentRepository.findByTask(taskId);
  }

  async getAttachmentById(attachmentId) {
    const attachment = await AttachmentRepository.findById(attachmentId);
    if (!attachment) {
      throw new ValidationError('Attachment not found');
    }
    return attachment;
  }
}

module.exports = new AttachmentService();
