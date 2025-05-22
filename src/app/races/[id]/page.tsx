'use client';

import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Container,
  Paper,
  Grid,
  Chip,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { format, addHours } from 'date-fns';
import { useSession } from 'next-auth/react';
import { useSolana } from '@/hooks/useSolana';

// Mock drivers data
const mockDrivers = Array.from({ length: 20 }, (_, i) => ({
  id: `driver-${i + 1}`,
  name: `Driver ${i + 1}`,
  number: `${i + 1}`,
  team: `Team ${Math.floor(i / 2) + 1}`,
  odds: (Math.random() * 10 + 1).toFixed(2),
  previousRank: Math.floor(Math.random() * 20) + 1
}));

// Mock race data
const mockRace = {
  id: '1',
  name: 'Daytona 500',
  track: {
    name: 'Daytona International Speedway',
    location: 'Daytona Beach, FL',
    logoUrl: '/tracks/daytona.jpg'
  },
  description: 'The Daytona 500 is the most prestigious race on the NASCAR Cup Series calendar. Known as "The Great American Race," it serves as the season-opening race and carries the biggest purse and prestige for drivers.',
  startTime: addHours(new Date(), 24),
  category: 'Stock Car',
  entryCount: 43,
  distance: 500,
  laps: 200,
  betCount: 156,
  format: 'Race',
  weather: 'Sunny, 75°F',
  status: 'UPCOMING'
};

// Get placeholder image for track
const getTrackImageFallback = (trackName: string) => {
  return `https://placehold.co/1200x400/222/fff?text=${encodeURIComponent(trackName)}`;
};

export default function RaceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { connected, walletAddress } = useSolana();
  
  const [race, setRace] = useState<typeof mockRace | null>(null);
  const [drivers, setDrivers] = useState<typeof mockDrivers>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Betting state
  const [betDialogOpen, setBetDialogOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<(typeof mockDrivers)[0] | null>(null);
  const [betAmount, setBetAmount] = useState<string>('0.1');
  const [placingBet, setPlacingBet] = useState(false);
  const [betSuccess, setBetSuccess] = useState(false);
  const [betError, setBetError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRaceDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // In a real app, this would fetch from your API which calls iRacing
        // const response = await fetch(`/api/races/${id}`);
        // const data = await response.json();
        
        // Mock API call with delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        setRace(mockRace);
        setDrivers(mockDrivers);
      } catch (err) {
        console.error('Error fetching race details:', err);
        setError('Failed to load race details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchRaceDetails();
    }
  }, [id]);

  const handleBack = () => {
    router.back();
  };

  const openBetDialog = (driver: (typeof mockDrivers)[0]) => {
    if (!session) {
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent(`/races/${id}`));
      return;
    }
    
    if (!connected) {
      alert('Please connect your Solana wallet first');
      return;
    }
    
    setSelectedDriver(driver);
    setBetDialogOpen(true);
  };

  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers with up to 2 decimal places
    if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
      setBetAmount(value);
    }
  };

  const handlePlaceBet = async () => {
    if (!selectedDriver || !race) return;
    
    setPlacingBet(true);
    setBetError(null);
    
    try {
      // In a real app, this would call your API to place the bet on the blockchain
      // const response = await fetch('/api/bets', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     raceId: race.id,
      //     driverId: selectedDriver.id,
      //     amount: parseFloat(betAmount),
      //   }),
      // });
      // const data = await response.json();
      
      // Mock API call with delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock success response
      setBetSuccess(true);
      
      // Close dialog after a delay
      setTimeout(() => {
        setBetDialogOpen(false);
        setBetSuccess(false);
        setSelectedDriver(null);
        setBetAmount('0.1');
      }, 2000);
    } catch (err) {
      console.error('Error placing bet:', err);
      setBetError('Failed to place bet. Please try again.');
    } finally {
      setPlacingBet(false);
    }
  };

  const handleDriverSelect = (event: SelectChangeEvent<string>) => {
    const driverId = event.target.value;
    const driver = drivers.find(d => d.id === driverId) || null;
    setSelectedDriver(driver);
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !race) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{ mb: 2 }}
          >
            Back to Races
          </Button>
          
          <Alert severity="error" sx={{ mb: 4 }}>
            {error || 'Race not found'}
          </Alert>
        </Box>
      </Container>
    );
  }

  // Calculate potential winnings for bet dialog
  const potentialWinnings = selectedDriver 
    ? (parseFloat(betAmount) * parseFloat(selectedDriver.odds)).toFixed(2) 
    : '0.00';

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mb: 2 }}
        >
          Back to Races
        </Button>
        
        {/* Race Header */}
        <Paper 
          elevation={0}
          sx={{ 
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            mb: 4
          }}
        >
          <Box 
            sx={{ 
              height: 200, 
              background: `url(${race.track.logoUrl || getTrackImageFallback(race.track.name)})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'flex-end',
              position: 'relative'
            }}
          >
            <Box 
              sx={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0.7))'
              }}
            />
            <Box sx={{ p: 3, color: 'white', position: 'relative', zIndex: 1, width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Chip 
                    label={race.category} 
                    size="small" 
                    color="primary" 
                    sx={{ mb: 1, bgcolor: 'rgba(25, 118, 210, 0.8)' }}
                  />
                  <Typography variant="h4" fontWeight={700} component="h1">
                    {race.name}
                  </Typography>
                </Box>
                
                <Chip 
                  label={race.status} 
                  size="medium" 
                  color={race.status === 'LIVE' ? 'error' : race.status === 'UPCOMING' ? 'primary' : 'default'}
                  sx={{ fontWeight: 600 }}
                />
              </Box>
            </Box>
          </Box>
          
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Typography variant="body1" paragraph>
                  {race.description}
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationOnIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {race.track.name}, {race.track.location}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarTodayIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {format(race.startTime, 'PP')}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccessTimeIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {format(race.startTime, 'p')}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Distance
                    </Typography>
                    <Typography variant="h6">
                      {race.distance > 0 ? `${race.distance} miles` : 'Timed Race'}
                    </Typography>
                  </Paper>
                  
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Laps
                    </Typography>
                    <Typography variant="h6">
                      {race.laps > 0 ? race.laps : 'Endurance'}
                    </Typography>
                  </Paper>
                  
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Format
                    </Typography>
                    <Typography variant="h6">
                      {race.format}
                    </Typography>
                  </Paper>
                  
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Weather
                    </Typography>
                    <Typography variant="h6">
                      {race.weather}
                    </Typography>
                  </Paper>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
        
        {/* Drivers Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Drivers
          </Typography>
          
          <Paper 
            elevation={0}
            sx={{ 
              borderRadius: 2,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Car #</TableCell>
                    <TableCell>Driver</TableCell>
                    <TableCell>Team</TableCell>
                    <TableCell>Previous Rank</TableCell>
                    <TableCell>Odds</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {drivers.map((driver) => (
                    <TableRow key={driver.id} hover>
                      <TableCell>{driver.number}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <DirectionsCarIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                          {driver.name}
                        </Box>
                      </TableCell>
                      <TableCell>{driver.team}</TableCell>
                      <TableCell>{driver.previousRank}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <EmojiEventsIcon color="warning" sx={{ mr: 1, fontSize: 20 }} />
                          {driver.odds}x
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => openBetDialog(driver)}
                          disabled={race.status !== 'UPCOMING'}
                        >
                          Place Bet
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
        
        {/* Betting Dialog */}
        <Dialog open={betDialogOpen} onClose={() => setBetDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>
            Place Bet {selectedDriver && `on ${selectedDriver.name}`}
          </DialogTitle>
          <DialogContent>
            {betSuccess ? (
              <Alert severity="success" sx={{ my: 2 }}>
                Bet placed successfully!
              </Alert>
            ) : (
              <>
                {betError && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {betError}
                  </Alert>
                )}
                
                <FormControl fullWidth margin="normal" variant="outlined">
                  <InputLabel id="driver-select-label">Select Driver</InputLabel>
                  <Select
                    labelId="driver-select-label"
                    value={selectedDriver?.id || ''}
                    onChange={handleDriverSelect}
                    label="Select Driver"
                  >
                    {drivers.map((driver) => (
                      <MenuItem key={driver.id} value={driver.id}>
                        {driver.name} ({driver.odds}x)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <TextField
                  label="Bet Amount"
                  type="text"
                  value={betAmount}
                  onChange={handleBetAmountChange}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">SOL</InputAdornment>,
                  }}
                />
                
                <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Bet Summary
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Odds:</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {selectedDriver?.odds}x
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Bet Amount:</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {betAmount} SOL
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2">Potential Winnings:</Typography>
                    <Typography variant="subtitle2" color="success.main" fontWeight={700}>
                      {potentialWinnings} SOL
                    </Typography>
                  </Box>
                </Box>
              </>
            )}
          </DialogContent>
          
          {!betSuccess && (
            <DialogActions>
              <Button onClick={() => setBetDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="contained"
                onClick={handlePlaceBet}
                disabled={!selectedDriver || placingBet || parseFloat(betAmount) <= 0}
              >
                {placingBet ? <CircularProgress size={24} /> : 'Place Bet'}
              </Button>
            </DialogActions>
          )}
        </Dialog>
      </Box>
    </Container>
  );
} 