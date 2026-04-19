import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Avatar, IconButton } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { format } from 'date-fns';

function CommentList({ comments, onAddComment, onDeleteComment, currentUserId }) {
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      await onAddComment(newComment);
      setNewComment('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Comments ({comments?.length || 0})
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          sx={{ mb: 1 }}
        />
        <Button 
          type="submit" 
          variant="contained" 
          disabled={loading || !newComment.trim()}
        >
          Add Comment
        </Button>
      </Box>

      {comments?.map((comment) => (
        <Paper key={comment.id} sx={{ p: 2, mb: 2 }}>
          <Box display="flex" alignItems="start" gap={2}>
            <Avatar>{comment.author?.name?.charAt(0)}</Avatar>
            <Box flex={1}>
              <Box display="flex" justifyContent="space-between" alignItems="start">
                <Box>
                  <Typography variant="subtitle2">{comment.author?.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {format(new Date(comment.createdAt), 'MMM dd, yyyy HH:mm')}
                  </Typography>
                </Box>
                {comment.userId === currentUserId && (
                  <IconButton 
                    size="small" 
                    onClick={() => onDeleteComment(comment.id)}
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {comment.content}
              </Typography>
            </Box>
          </Box>
        </Paper>
      ))}

      {(!comments || comments.length === 0) && (
        <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
          No comments yet. Be the first to comment!
        </Typography>
      )}
    </Box>
  );
}

export default CommentList;
