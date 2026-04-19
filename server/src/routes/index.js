const express = require('express');
const userRoutes = require('./userRoutes');
const taskRoutes = require('./taskRoutes');
const projectRoutes = require('./projectRoutes');
const notificationRoutes = require('./notificationRoutes');
const commentRoutes = require('./commentRoutes');
const attachmentRoutes = require('./attachmentRoutes');
const dashboardRoutes = require('./dashboardRoutes');

const router = express.Router();

router.use('/users', userRoutes);
router.use('/tasks', taskRoutes);
router.use('/projects', projectRoutes);
router.use('/notifications', notificationRoutes);
router.use('/comments', commentRoutes);
router.use('/attachments', attachmentRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
