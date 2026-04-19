const { Attachment, User } = require('../models');

class AttachmentRepository {
  async save(attachmentData) {
    return await Attachment.create(attachmentData);
  }

  async findById(attachmentId) {
    return await Attachment.findByPk(attachmentId, {
      include: [
        { model: User, as: 'uploader', attributes: ['id', 'name', 'email'] }
      ]
    });
  }

  async findByTask(taskId) {
    return await Attachment.findAll({
      where: { taskId },
      include: [
        { model: User, as: 'uploader', attributes: ['id', 'name', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  async delete(attachmentId) {
    const attachment = await Attachment.findByPk(attachmentId);
    if (!attachment) return null;
    
    await attachment.destroy();
    return true;
  }
}

module.exports = new AttachmentRepository();
