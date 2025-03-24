import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Divider,
  Slider,
  Alert,
  Chip,
  IconButton
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  Delete as DeleteIcon,
  DirectionsBike as BikeIcon
} from '@mui/icons-material';

function TestMUI() {
  const [sliderValue, setSliderValue] = useState(50);
  const [textValue, setTextValue] = useState('');
  const [switchChecked, setSwitchChecked] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);

  const handleSliderChange = (event, newValue) => {
    setSliderValue(newValue);
  };

  const handleTextChange = (event) => {
    setTextValue(event.target.value);
  };

  const handleSwitchChange = (event) => {
    setSwitchChecked(event.target.checked);
  };

  const handleShowAlert = () => {
    setAlertVisible(true);
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setAlertVisible(false);
    }, 3000);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom color="primary">
          Material-UI Test Page
        </Typography>
        <Typography variant="body1" paragraph>
          This page showcases various Material-UI components to test the integration.
        </Typography>

        <Divider sx={{ my: 3 }} />

        {/* Basic components section */}
        <Typography variant="h5" component="h2" gutterBottom>
          Basic Components
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Buttons
              </Typography>
              <Box sx={{ '& > button': { m: 1 } }}>
                <Button variant="contained" color="primary">Primary</Button>
                <Button variant="contained" color="secondary">Secondary</Button>
                <Button variant="outlined" color="primary">Outlined</Button>
                <Button variant="text" color="primary">Text</Button>
              </Box>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Text Field
              </Typography>
              <TextField
                fullWidth
                label="Enter some text"
                variant="outlined"
                value={textValue}
                onChange={handleTextChange}
                margin="normal"
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Switch
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={switchChecked}
                    onChange={handleSwitchChange}
                    color="primary"
                  />
                }
                label={switchChecked ? "ON" : "OFF"}
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Slider
              </Typography>
              <Slider
                value={sliderValue}
                onChange={handleSliderChange}
                aria-labelledby="continuous-slider"
                valueLabelDisplay="auto"
                min={0}
                max={100}
              />
              <Typography variant="body2" color="text.secondary">
                Value: {sliderValue}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Chips
              </Typography>
              <Box sx={{ '& > *': { m: 0.5 } }}>
                <Chip label="Basic" />
                <Chip label="Primary" color="primary" />
                <Chip label="Secondary" color="secondary" />
                <Chip label="With Icon" icon={<BikeIcon />} color="primary" />
                <Chip
                  label="Deletable"
                  color="error"
                  onDelete={() => {}}
                  deleteIcon={<DeleteIcon />}
                />
              </Box>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Alert
              </Typography>
              <Button variant="outlined" color="primary" onClick={handleShowAlert}>
                Show Alert
              </Button>
              <Box sx={{ mt: 2 }}>
                {alertVisible && (
                  <Alert severity="success" onClose={() => setAlertVisible(false)}>
                    This is a success alert — check it out!
                  </Alert>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Card Example */}
        <Typography variant="h5" component="h2" gutterBottom>
          Card Component
        </Typography>

        <Card sx={{ maxWidth: 345, mb: 4 }}>
          <CardMedia
            component="img"
            height="140"
            image="https://images.ctfassets.net/ogr4ifihl2yh/3gvlDBzj1UgLVNH2vAhFEF/5a1585c9a1463d431d7cce957ba7c984/Profile_-_Around_the_Block_Women-s_26__Single_Speed_-_Mint_Green_-_630042_NEW.png?w=1000&q=85"
            alt="green bike"
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              City Cruiser
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Comfortable and stylish city bike perfect for commuting and casual rides.
              Features 7-speed Shimano gearing and an upright riding position.
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small" startIcon={<BikeIcon />}>Rent</Button>
            <Button size="small">Learn More</Button>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton aria-label="add to favorites" color="primary">
              <FavoriteIcon />
            </IconButton>
            <IconButton aria-label="share">
              <ShareIcon />
            </IconButton>
          </CardActions>
        </Card>

        {/* Theme demonstration */}
        <Typography variant="h5" component="h2" gutterBottom>
          Theme Colors
        </Typography>
        <Box 
          sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 2,
            mb: 2
          }}
        >
          <Box sx={{ width: 100, height: 100, bgcolor: 'primary.main', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="caption" color="primary.contrastText">primary.main</Typography>
          </Box>
          <Box sx={{ width: 100, height: 100, bgcolor: 'primary.light', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="caption" color="primary.contrastText">primary.light</Typography>
          </Box>
          <Box sx={{ width: 100, height: 100, bgcolor: 'primary.dark', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="caption" color="primary.contrastText">primary.dark</Typography>
          </Box>
          <Box sx={{ width: 100, height: 100, bgcolor: 'secondary.main', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="caption" color="secondary.contrastText">secondary.main</Typography>
          </Box>
          <Box sx={{ width: 100, height: 100, bgcolor: 'error.main', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="caption" color="error.contrastText">error.main</Typography>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Button variant="contained" color="primary" href="/">
          Back to Home
        </Button>
      </Box>
    </Container>
  );
}

export default TestMUI;