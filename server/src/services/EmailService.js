const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
  }

  async sendEmail(to, subject, html) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@taskflow.com',
        to,
        subject,
        html
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error('Error sending email:', error);
      throw error;
    }
  }

  async sendTaskAssignmentEmail(task) {
    // In a real application, you would fetch the assignee's email
    // For now, this is a placeholder
    const subject = 'New Task Assignment';
    const html = `
      <h2>You have been assigned a new task</h2>
      <p><strong>Task:</strong> ${task.title}</p>
      <p><strong>Description:</strong> ${task.description || 'No description'}</p>
      <p><strong>Priority:</strong> ${task.priority}</p>
      <p><strong>Due Date:</strong> ${task.dueDate || 'Not set'}</p>
      <p>Please log in to TaskFlow to view more details.</p>
    `;

    // This would need the actual email address
    // await this.sendEmail(assigneeEmail, subject, html);
    logger.info(`Task assignment email prepared for task: ${task.id}`);
  }

  async sendPasswordResetEmail(email, resetToken) {
    const subject = 'Password Reset Request';
    const html = `
      <h2>Password Reset Request</h2>
      <p>You requested to reset your password. Click the link below to reset it:</p>
      <p><a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}">Reset Password</a></p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
    `;

    await this.sendEmail(email, subject, html);
  }

  async sendWelcomeEmail(email, name) {
    const subject = 'Welcome to TaskFlow';
    const html = `
      <h2>Welcome to TaskFlow, ${name}!</h2>
      <p>Thank you for joining TaskFlow. We're excited to have you on board.</p>
      <p>Get started by creating your first project or joining an existing team.</p>
      <p>If you have any questions, feel free to reach out to our support team.</p>
    `;

    await this.sendEmail(email, subject, html);
  }
}

module.exports = new EmailService();
