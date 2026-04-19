import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Paper, Grid, Chip } from '@mui/material';

function Profile() {
  const { user } = useSelector((state) => state.auth);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>
      <Paper sx={{ p: 3, mt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography color="textSecondary">Name</Typography>
            <Typography variant="body1">{user?.name}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography color="textSecondary">Email</Typography>
            <Typography variant="body1">{user?.email}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography color="textSecondary">Role</Typography>
            <Chip label={user?.role} color="primary" size="small" sx={{ mt: 0.5 }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography color="textSecondary">Status</Typography>
            <Chip 
              label={user?.isActive ? 'Active' : 'Inactive'} 
              color={user?.isActive ? 'success' : 'default'} 
              size="small" 
              sx={{ mt: 0.5 }} 
            />
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}

export default Profile;
