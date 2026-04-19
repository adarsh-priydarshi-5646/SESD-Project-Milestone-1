import React, { useState } from 'react';
import { Box, Button, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Typography, LinearProgress } from '@mui/material';
import { CloudUpload, Delete as DeleteIcon, Download as DownloadIcon } from '@mui/icons-material';

function FileUpload({ attachments, onUpload, onDelete, onDownload }) {
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      await onUpload(file);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          Attachments ({attachments?.length || 0})
        </Typography>
        <Button
          variant="outlined"
          component="label"
          startIcon={<CloudUpload />}
          disabled={uploading}
        >
          Upload File
          <input
            type="file"
            hidden
            onChange={handleFileSelect}
            accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.zip"
          />
        </Button>
      </Box>

      {uploading && <LinearProgress sx={{ mb: 2 }} />}

      {attachments && attachments.length > 0 ? (
        <List>
          {attachments.map((attachment) => (
            <ListItem key={attachment.id} divider>
              <ListItemText
                primary={attachment.fileName}
                secondary={`${formatFileSize(attachment.fileSize)} • Uploaded by ${attachment.uploader?.name}`}
              />
              <ListItemSecondaryAction>
                <IconButton 
                  edge="end" 
                  onClick={() => onDownload(attachment.id)}
                  sx={{ mr: 1 }}
                >
                  <DownloadIcon />
                </IconButton>
                <IconButton 
                  edge="end" 
                  onClick={() => onDelete(attachment.id)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
          No attachments yet
        </Typography>
      )}
    </Box>
  );
}

export default FileUpload;
