import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { Assignment, CheckCircle, Schedule, Warning } from '@mui/icons-material';
import api from '../services/api';
import TaskCard from '../components/TaskCard';
import StatCard from '../components/StatCard';

function Dashboard() {
  const { user } = useSelector((state) => state.auth);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/dashboard/user');
      setDashboard(response.data.data.dashboard);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load dashboard');
      setLoading(false);
    }
  };

  if (loading) return <Typography>Loading dashboard...</Typography>;

  const stats = dashboard?.taskStats || {};
  const recentTasks = dashboard?.recentTasks || [];
  const overdueTasks = dashboard?.overdueTasks || [];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.name}!
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        Here's an overview of your tasks
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="To Do"
            value={stats.TODO || 0}
            color="primary.main"
            icon={<Assignment fontSize="large" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="In Progress"
            value={stats.IN_PROGRESS || 0}
            color="warning.main"
            icon={<Schedule fontSize="large" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="In Review"
            value={stats.IN_REVIEW || 0}
            color="info.main"
            icon={<Assignment fontSize="large" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completed"
            value={stats.DONE || 0}
            color="success.main"
            icon={<CheckCircle fontSize="large" />}
          />
        </Grid>
      </Grid>

      {overdueTasks.length > 0 && (
        <Paper sx={{ p: 3, mt: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Warning />
            <Typography variant="h6">
              You have {overdueTasks.length} overdue task{overdueTasks.length > 1 ? 's' : ''}
            </Typography>
          </Box>
        </Paper>
      )}

      <Box display="flex" justifyContent="space-between" alignItems="center" mt={4} mb={2}>
        <Typography variant="h5">
          Recent Tasks
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Total: {stats.total || 0}
        </Typography>
      </Box>

      {recentTasks.length > 0 ? (
        <Grid container spacing={2}>
          {recentTasks.map((task) => (
            <Grid item xs={12} md={6} key={task.id}>
              <TaskCard task={task} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No tasks assigned to you yet
          </Typography>
        </Paper>
      )}

      {dashboard?.projectStats && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Project Overview
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="h4" color="primary">
                {dashboard.projectStats.total_projects}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Projects
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h4" color="success.main">
                {dashboard.projectStats.active_projects}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Projects
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
}

export default Dashboard;
