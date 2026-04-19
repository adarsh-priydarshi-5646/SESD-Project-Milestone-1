const express = require('express');
const CommentController = require('../controllers/CommentController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', CommentController.createComment);
router.get('/task/:taskId', CommentController.getTaskComments);
router.put('/:id', CommentController.updateComment);
router.delete('/:id', CommentController.deleteComment);

module.exports = router;
