import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, Paper, Typography, Grid, Chip, Button, TextField, MenuItem, Divider, IconButton } from '@mui/material';
import { ArrowBack, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import api from '../services/api';
import CommentList from '../components/CommentList';
import FileUpload from '../components/FileUpload';
import { toast } from 'react-toastify';

function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchTaskDetails();
    fetchComments();
    fetchAttachments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchTaskDetails = async () => {
    try {
      const response = await api.get(`/tasks/${id}`);
      setTask(response.data.data.task);
      setFormData(response.data.data.task);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load task');
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await api.get(`/comments/task/${id}`);
      setComments(response.data.data.comments);
    } catch (error) {
      console.error('Failed to load comments');
    }
  };

  const fetchAttachments = async () => {
    try {
      const response = await api.get(`/attachments/task/${id}`);
      setAttachments(response.data.data.attachments);
    } catch (error) {
      console.error('Failed to load attachments');
    }
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/tasks/${id}`, formData);
      toast.success('Task updated successfully');
      setEditing(false);
      fetchTaskDetails();
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to update task');
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await api.patch(`/tasks/${id}/status`, { status: newStatus });
      toast.success('Status updated successfully');
      fetchTaskDetails();
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await api.delete(`/tasks/${id}`);
      toast.success('Task deleted successfully');
      navigate('/tasks');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const handleAddComment = async (content) => {
    try {
      await api.post('/comments', { taskId: id, content });
      toast.success('Comment added');
      fetchComments();
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`);
      toast.success('Comment deleted');
      fetchComments();
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  const handleUploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('taskId', id);

    try {
      await api.post('/attachments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('File uploaded successfully');
      fetchAttachments();
    } catch (error) {
      toast.error('Failed to upload file');
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    try {
      await api.delete(`/attachments/${attachmentId}`);
      toast.success('Attachment deleted');
      fetchAttachments();
    } catch (error) {
      toast.error('Failed to delete attachment');
    }
  };

  const handleDownloadAttachment = async (attachmentId) => {
    window.open(`/api/v1/attachments/${attachmentId}/download`, '_blank');
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (!task) return <Typography>Task not found</Typography>;

  const statusColors = {
    TODO: 'default',
    IN_PROGRESS: 'warning',
    IN_REVIEW: 'info',
    DONE: 'success',
  };

  const priorityColors = {
    LOW: 'default',
    MEDIUM: 'primary',
    HIGH: 'warning',
    URGENT: 'error',
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/tasks')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" flex={1}>
          Task Details
        </Typography>
        {!editing && (
          <>
            <Button startIcon={<EditIcon />} onClick={() => setEditing(true)} sx={{ mr: 1 }}>
              Edit
            </Button>
            <Button startIcon={<DeleteIcon />} color="error" onClick={handleDelete}>
              Delete
            </Button>
          </>
        )}
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            {editing ? (
              <>
                <TextField
                  fullWidth
                  label="Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  margin="normal"
                  multiline
                  rows={4}
                />
                <TextField
                  fullWidth
                  select
                  label="Priority"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  margin="normal"
                >
                  <MenuItem value="LOW">Low</MenuItem>
                  <MenuItem value="MEDIUM">Medium</MenuItem>
                  <MenuItem value="HIGH">High</MenuItem>
                  <MenuItem value="URGENT">Urgent</MenuItem>
                </TextField>
                <TextField
                  fullWidth
                  label="Due Date"
                  type="date"
                  value={formData.dueDate || ''}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
                <Box mt={2}>
                  <Button variant="contained" onClick={handleUpdate} sx={{ mr: 1 }}>
                    Save
                  </Button>
                  <Button onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                </Box>
              </>
            ) : (
              <>
                <Typography variant="h5" gutterBottom>
                  {task.title}
                </Typography>
                <Box display="flex" gap={1} mb={2}>
                  <Chip label={task.status.replace('_', ' ')} color={statusColors[task.status]} />
                  <Chip label={task.priority} color={priorityColors[task.priority]} />
                </Box>
                <Typography variant="body1" paragraph>
                  {task.description || 'No description'}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Assignee</Typography>
                    <Typography>{task.assignee?.name || 'Unassigned'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Created By</Typography>
                    <Typography>{task.creator?.name}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Due Date</Typography>
                    <Typography>
                      {task.dueDate ? format(new Date(task.dueDate), 'MMM dd, yyyy') : 'Not set'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Created</Typography>
                    <Typography>{format(new Date(task.createdAt), 'MMM dd, yyyy')}</Typography>
                  </Grid>
                </Grid>
              </>
            )}
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <CommentList
              comments={comments}
              onAddComment={handleAddComment}
              onDeleteComment={handleDeleteComment}
              currentUserId={user?.id}
            />
          </Paper>

          <Paper sx={{ p: 3 }}>
            <FileUpload
              attachments={attachments}
              onUpload={handleUploadFile}
              onDelete={handleDeleteAttachment}
              onDownload={handleDownloadAttachment}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Change Status
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              {['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'].map((status) => (
                <Button
                  key={status}
                  variant={task.status === status ? 'contained' : 'outlined'}
                  onClick={() => handleStatusChange(status)}
                  disabled={task.status === status}
                >
                  {status.replace('_', ' ')}
                </Button>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default TaskDetail;
