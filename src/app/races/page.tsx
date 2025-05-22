'use client';

import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  CardMedia,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Divider,
  Paper
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { format, addHours } from 'date-fns';
import { useRouter } from 'next/navigation';

// Mock upcoming races data (in real app would come from API)
const MOCK_RACES = [
  {
    id: '1',
    name: 'Daytona 500',
    track: {
      name: 'Daytona International Speedway',
      location: 'Daytona Beach, FL',
      logoUrl: '/tracks/daytona.jpg'
    },
    startTime: addHours(new Date(), 24),
    category: 'Stock Car',
    entryCount: 43,
    distance: 500,
    laps: 200,
    betCount: 156
  },
  {
    id: '2',
    name: 'Monaco Grand Prix',
    track: {
      name: 'Circuit de Monaco',
      location: 'Monte Carlo, Monaco',
      logoUrl: '/tracks/monaco.jpg'
    },
    startTime: addHours(new Date(), 48),
    category: 'Open Wheel',
    entryCount: 20,
    distance: 260,
    laps: 78,
    betCount: 203
  },
  {
    id: '3',
    name: 'Spa 24 Hours',
    track: {
      name: 'Circuit de Spa-Francorchamps',
      location: 'Stavelot, Belgium',
      logoUrl: '/tracks/spa.jpg'
    },
    startTime: addHours(new Date(), 72),
    category: 'GT3',
    entryCount: 60,
    distance: 4000,
    laps: 0, // Endurance race, no fixed lap count
    betCount: 89
  },
  {
    id: '4',
    name: 'Nürburgring 4 Hour',
    track: {
      name: 'Nürburgring Nordschleife',
      location: 'Nürburg, Germany',
      logoUrl: '/tracks/nurburgring.jpg'
    },
    startTime: addHours(new Date(), 120),
    category: 'GT3',
    entryCount: 38,
    distance: 0, // Timed race
    laps: 0,
    betCount: 42
  },
  {
    id: '5',
    name: 'Talladega Superspeedway Cup Series',
    track: {
      name: 'Talladega Superspeedway',
      location: 'Talladega, AL',
      logoUrl: '/tracks/talladega.jpg'
    },
    startTime: addHours(new Date(), 96),
    category: 'Stock Car',
    entryCount: 40,
    distance: 300,
    laps: 160,
    betCount: 112
  }
];

// Placeholder track image URLs (would be actual track images in real app)
const getTrackImageFallback = (trackName: string) => {
  // Return a placeholder image with track name
  return `https://placehold.co/600x400/222/fff?text=${encodeURIComponent(trackName)}`;
};

export default function RacesPage() {
  const [races, setRaces] = useState<typeof MOCK_RACES>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchRaces = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // In a real app, this would be an API call to your backend
        // which would fetch data from the iRacing API
        // For now, simulate a delay and use mock data
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setRaces(MOCK_RACES);
      } catch (err) {
        console.error('Error fetching races:', err);
        setError('Failed to load upcoming races. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRaces();
  }, []);

  const handleRaceClick = (raceId: string) => {
    router.push(`/races/${raceId}`);
  };

  // Sort races by start time (soonest first)
  const sortedRaces = [...races].sort((a, b) => 
    a.startTime.getTime() - b.startTime.getTime()
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Upcoming Races
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Browse upcoming iRacing events and place your bets
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        ) : races.length === 0 ? (
          <Paper 
            elevation={0}
            sx={{ 
              p: 4, 
              textAlign: 'center',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2
            }}
          >
            <DirectionsCarIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No upcoming races found
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Check back later for new races to bet on
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {sortedRaces.map((race) => (
              <Grid item xs={12} sm={6} md={4} key={race.id}>
                <Card 
                  elevation={0}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 3,
                    }
                  }}
                >
                  <CardActionArea 
                    onClick={() => handleRaceClick(race.id)}
                    sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                  >
                    <CardMedia
                      component="img"
                      height="160"
                      image={race.track.logoUrl || getTrackImageFallback(race.track.name)}
                      alt={race.track.name}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = getTrackImageFallback(race.track.name);
                      }}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ mb: 1 }}>
                        <Chip 
                          label={race.category} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                      </Box>
                      <Typography variant="h6" component="h2" gutterBottom>
                        {race.name}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationOnIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          {race.track.name}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
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

                      <Divider sx={{ my: 2 }} />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          {race.entryCount} Drivers
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {race.betCount} Bets
                        </Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
} 