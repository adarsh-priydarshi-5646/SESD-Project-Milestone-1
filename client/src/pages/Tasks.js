import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Button, Grid, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Paper } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { fetchMyTasks, createTask } from '../store/slices/taskSlice';
import { fetchMyProjects } from '../store/slices/projectSlice';
import TaskCard from '../components/TaskCard';
import FilterPanel from '../components/FilterPanel';
import SearchBar from '../components/SearchBar';
import { toast } from 'react-toastify';

function Tasks() {
  const dispatch = useDispatch();
  const { tasks, loading } = useSelector((state) => state.tasks);
  const { projects } = useSelector((state) => state.projects);
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState({ status: '', priority: '', search: '' });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    priority: 'MEDIUM',
    dueDate: ''
  });

  useEffect(() => {
    dispatch(fetchMyTasks());
    dispatch(fetchMyProjects());
  }, [dispatch]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setFormData({ title: '', description: '', projectId: '', priority: 'MEDIUM', dueDate: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.projectId) {
      toast.error('Please select a project');
      return;
    }
    try {
      await dispatch(createTask(formData)).unwrap();
      toast.success('Task created successfully');
      handleClose();
      dispatch(fetchMyTasks()); // Refresh tasks
    } catch (error) {
      toast.error(error || 'Failed to create task');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleClearFilters = () => {
    setFilters({ status: '', priority: '', search: '' });
  };

  const filteredTasks = tasks.filter(task => {
    if (filters.status && task.status !== filters.status) return false;
    if (filters.priority && task.priority !== filters.priority) return false;
    if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">My Tasks</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
          New Task
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box mb={2}>
          <SearchBar 
            onSearch={(value) => handleFilterChange('search', value)} 
            placeholder="Search tasks..."
          />
        </Box>
        <FilterPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />
      </Paper>

      {loading ? (
        <Typography>Loading tasks...</Typography>
      ) : filteredTasks.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="textSecondary">
            {tasks.length === 0 ? 'No tasks found. Create your first task!' : 'No tasks match your filters'}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {filteredTasks.map((task) => (
            <Grid item xs={12} md={6} lg={4} key={task.id}>
              <TaskCard task={task} />
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              select
              label="Project"
              name="projectId"
              value={formData.projectId}
              onChange={handleChange}
              margin="normal"
              required
            >
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              select
              label="Priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
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
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleChange}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">Create</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default Tasks;
