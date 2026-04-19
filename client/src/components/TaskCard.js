import React from 'react';
import { Card, CardContent, Typography, Chip, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

function TaskCard({ task }) {
  const navigate = useNavigate();

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
    <Card 
      sx={{ cursor: 'pointer', '&:hover': { boxShadow: 3 } }}
      onClick={() => navigate(`/tasks/${task.id}`)}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
          <Typography variant="h6" component="div">
            {task.title}
          </Typography>
          <Chip 
            label={task.priority} 
            color={priorityColors[task.priority]} 
            size="small" 
          />
        </Box>
        <Typography variant="body2" color="text.secondary" noWrap>
          {task.description || 'No description'}
        </Typography>
        <Box display="flex" gap={1} mt={2}>
          <Chip 
            label={task.status.replace('_', ' ')} 
            color={statusColors[task.status]} 
            size="small" 
          />
          {task.dueDate && (
            <Chip 
              label={`Due: ${format(new Date(task.dueDate), 'MMM dd')}`} 
              size="small" 
              variant="outlined"
            />
          )}
        </Box>
        {task.assignee && (
          <Typography variant="caption" color="text.secondary" display="block" mt={1}>
            Assigned to: {task.assignee.name}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default TaskCard;
