import React from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import { Clear as ClearIcon } from '@mui/icons-material';

function FilterPanel({ filters, onFilterChange, onClearFilters }) {
  return (
    <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Status</InputLabel>
        <Select
          value={filters.status || ''}
          label="Status"
          onChange={(e) => onFilterChange('status', e.target.value)}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="TODO">To Do</MenuItem>
          <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
          <MenuItem value="IN_REVIEW">In Review</MenuItem>
          <MenuItem value="DONE">Done</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Priority</InputLabel>
        <Select
          value={filters.priority || ''}
          label="Priority"
          onChange={(e) => onFilterChange('priority', e.target.value)}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="LOW">Low</MenuItem>
          <MenuItem value="MEDIUM">Medium</MenuItem>
          <MenuItem value="HIGH">High</MenuItem>
          <MenuItem value="URGENT">Urgent</MenuItem>
        </Select>
      </FormControl>

      {(filters.status || filters.priority) && (
        <Button
          size="small"
          startIcon={<ClearIcon />}
          onClick={onClearFilters}
        >
          Clear Filters
        </Button>
      )}
    </Box>
  );
}

export default FilterPanel;
