import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, Paper, Typography, Grid, Chip, Button, IconButton, Tabs, Tab, Card, CardContent, LinearProgress } from '@mui/material';
import { ArrowBack, Add as AddIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import api from '../services/api';
import TaskCard from '../components/TaskCard';
import { toast } from 'react-toastify';

function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchProjectDetails();
    fetchProjectTasks();
    fetchProjectAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      const response = await api.get(`/projects/${id}`);
      setProject(response.data.data.project);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load project');
      setLoading(false);
    }
  };

  const fetchProjectTasks = async () => {
    try {
      const response = await api.get(`/tasks/project/${id}`);
      setTasks(response.data.data.tasks);
    } catch (error) {
      console.error('Failed to load tasks');
    }
  };

  const fetchProjectAnalytics = async () => {
    try {
      const response = await api.get(`/projects/${id}/analytics`);
      setAnalytics(response.data.data.analytics);
    } catch (error) {
      console.error('Failed to load analytics');
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted successfully');
      navigate('/projects');
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (!project) return <Typography>Project not found</Typography>;

  const statusColors = {
    PLANNING: 'default',
    ACTIVE: 'primary',
    COMPLETED: 'success',
    ARCHIVED: 'default',
  };

  const completionRate = analytics ? parseFloat(analytics.completionRate) : 0;

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/projects')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" flex={1}>
          {project.name}
        </Typography>
        {project.managerId === user?.id && (
          <Button color="error" onClick={handleDeleteProject}>
            Delete Project
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="body1" paragraph>
              {project.description || 'No description'}
            </Typography>
            <Box display="flex" gap={2} alignItems="center">
              <Chip label={project.status} color={statusColors[project.status]} />
              {project.deadline && (
                <Typography variant="body2" color="text.secondary">
                  Deadline: {format(new Date(project.deadline), 'MMM dd, yyyy')}
                </Typography>
              )}
            </Box>
          </Paper>

          <Paper sx={{ mb: 3 }}>
            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
              <Tab label="Tasks" />
              <Tab label="Team Members" />
            </Tabs>
            <Box p={3}>
              {activeTab === 0 && (
                <>
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="h6">Tasks ({tasks.length})</Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => navigate('/tasks')}
                    >
                      New Task
                    </Button>
                  </Box>
                  <Grid container spacing={2}>
                    {tasks.map((task) => (
                      <Grid item xs={12} key={task.id}>
                        <TaskCard task={task} />
                      </Grid>
                    ))}
                  </Grid>
                  {tasks.length === 0 && (
                    <Typography color="text.secondary" align="center" py={3}>
                      No tasks in this project yet
                    </Typography>
                  )}
                </>
              )}
              {activeTab === 1 && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Team Members ({project.members?.length || 0})
                  </Typography>
                  {project.members?.map((member) => (
                    <Card key={member.id} sx={{ mb: 1 }}>
                      <CardContent>
                        <Typography variant="subtitle1">{member.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {member.email}
                        </Typography>
                        <Chip label={member.role} size="small" sx={{ mt: 1 }} />
                      </CardContent>
                    </Card>
                  ))}
                  {(!project.members || project.members.length === 0) && (
                    <Typography color="text.secondary" align="center" py={3}>
                      No team members yet
                    </Typography>
                  )}
                </>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Project Manager
            </Typography>
            <Typography variant="body1">{project.manager?.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {project.manager?.email}
            </Typography>
          </Paper>

          {analytics && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Analytics
              </Typography>
              <Box mb={3}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Completion Rate</Typography>
                  <Typography variant="body2">{completionRate}%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={completionRate} />
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="h4" color="primary">
                    {analytics.totalTasks}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total Tasks
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h4" color="success.main">
                    {analytics.completedTasks}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Completed
                  </Typography>
                </Grid>
              </Grid>
              {analytics.tasksByStatus && analytics.tasksByStatus.length > 0 && (
                <Box mt={3}>
                  <Typography variant="subtitle2" gutterBottom>
                    Tasks by Status
                  </Typography>
                  {analytics.tasksByStatus.map((stat) => (
                    <Box key={stat.status} display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">{stat.status.replace('_', ' ')}</Typography>
                      <Typography variant="body2">{stat.count}</Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

export default ProjectDetail;
