// frontend/src/components/bikes/ModeSelectorMUI.js
import React from 'react';
import {
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  Paper
} from '@mui/material';
import {
  Storefront as StoreIcon,
  DirectionsBike as BikeIcon
} from '@mui/icons-material';

function ModeSelectorMUI({ mode, setMode }) {
  const handleModeChange = (event, newMode) => {
    if (newMode !== null) {
      setMode(newMode);
    }
  };

  return (
    <Paper elevation={3} sx={{ mb: 3, p: 2, borderRadius: 2 }}>
      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'medium', mb: 1.5 }}>
        Select Mode
      </Typography>
      
      <ToggleButtonGroup
        value={mode}
        exclusive
        onChange={handleModeChange}
        fullWidth
        color="primary"
        sx={{
          '& .MuiToggleButtonGroup-grouped': {
            borderRadius: 2,
            m: 0.5,
            py: 1
          }
        }}
      >
        <ToggleButton value="purchase" aria-label="purchase mode">
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <StoreIcon sx={{ mr: 1 }} />
            <Typography variant="body2">Buy Bicycles</Typography>
          </Box>
        </ToggleButton>
        
        <ToggleButton value="rental" aria-label="rental mode">
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <BikeIcon sx={{ mr: 1 }} />
            <Typography variant="body2">Rent Bicycles</Typography>
          </Box>
        </ToggleButton>
      </ToggleButtonGroup>
    </Paper>
  );
}

export default ModeSelectorMUI;