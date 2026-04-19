import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchProjects = createAsyncThunk('projects/fetchProjects', async () => {
  const response = await api.get('/projects');
  return response.data.data.projects;
});

export const fetchMyProjects = createAsyncThunk('projects/fetchMyProjects', async () => {
  const response = await api.get('/projects/my-projects');
  return response.data.data.projects;
});

export const createProject = createAsyncThunk('projects/createProject', async (projectData) => {
  const response = await api.post('/projects', projectData);
  return response.data.data.project;
});

export const updateProject = createAsyncThunk('projects/updateProject', async ({ id, data }) => {
  const response = await api.put(`/projects/${id}`, data);
  return response.data.data.project;
});

export const deleteProject = createAsyncThunk('projects/deleteProject', async (id) => {
  await api.delete(`/projects/${id}`);
  return id;
});

const projectSlice = createSlice({
  name: 'projects',
  initialState: {
    projects: [],
    currentProject: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchMyProjects.fulfilled, (state, action) => {
        state.projects = action.payload;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.projects.unshift(action.payload);
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        const index = state.projects.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter(p => p.id !== action.payload);
      });
  },
});

export const { clearError } = projectSlice.actions;
export default projectSlice.reducer;
