'use client';

import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Container, 
  Paper, 
  Divider, 
  Chip, 
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Tabs,
  Tab,
} from '@mui/material';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PlaceIcon from '@mui/icons-material/Place';
import ScheduleIcon from '@mui/icons-material/Schedule';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import BettingForm from '@/components/betting/BettingForm';
import { RaceStatus } from '@prisma/client';

interface Driver {
  id: string;
  name: string;
  carNumber?: string;
  teamName?: string;
  finishPosition?: number | null;
}

interface Race {
  id: string;
  name: string;
  track: string;
  category: string;
  startTime: Date | string;
  endTime?: Date | string | null;
  status: RaceStatus;
  participants: Driver[];
}

// Mock data for now, in a real app this would come from the API
const mockRaces: Record<string, Race> = {
  '1': {
    id: '1',
    name: 'Daytona 500',
    track: 'Daytona International Speedway',
    category: 'Oval',
    startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    status: 'UPCOMING',
    participants: Array.from({ length: 40 }, (_, i) => ({
      id: `driver-${i + 1}`,
      name: `Driver ${i + 1}`,
      carNumber: `${i + 1}`,
      teamName: `Team ${Math.floor(i / 2) + 1}`,
    })),
  },
  '2': {
    id: '2',
    name: 'Spa 24 Hours',
    track: 'Circuit de Spa-Francorchamps',
    category: 'Road',
    startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    status: 'UPCOMING',
    participants: Array.from({ length: 30 }, (_, i) => ({
      id: `driver-${i + 100}`,
      name: `Driver ${i + 100}`,
      carNumber: `${i + 100}`,
      teamName: `Team ${Math.floor(i / 2) + 50}`,
    })),
  },
  '3': {
    id: '3',
    name: 'Nürburgring Grand Prix',
    track: 'Nürburgring',
    category: 'Road',
    startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    status: 'UPCOMING',
    participants: Array.from({ length: 25 }, (_, i) => ({
      id: `driver-${i + 200}`,
      name: `Driver ${i + 200}`,
      carNumber: `${i + 200}`,
      teamName: `Team ${Math.floor(i / 2) + 100}`,
    })),
  },
  '4': {
    id: '4',
    name: 'Monaco Sprint',
    track: 'Circuit de Monaco',
    category: 'Road',
    startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours after start
    status: 'COMPLETED',
    participants: Array.from({ length: 20 }, (_, i) => ({
      id: `driver-${i + 300}`,
      name: `Driver ${i + 300}`,
      carNumber: `${i + 300}`,
      teamName: `Team ${Math.floor(i / 2) + 150}`,
      finishPosition: i,
    })),
  },
  '5': {
    id: '5',
    name: 'Indianapolis 500',
    track: 'Indianapolis Motor Speedway',
    category: 'Oval',
    startTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    status: 'LIVE',
    participants: Array.from({ length: 33 }, (_, i) => ({
      id: `driver-${i + 400}`,
      name: `Driver ${i + 400}`,
      carNumber: `${i + 400}`,
      teamName: `Team ${Math.floor(i / 2) + 200}`,
    })),
  },
};

// Define status colors
const statusColors: Record<RaceStatus, "primary" | "error" | "success" | "default"> = {
  UPCOMING: 'primary',
  LIVE: 'error',
  COMPLETED: 'success',
  CANCELLED: 'default',
};

export default function RaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [race, setRace] = useState<Race | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchRace = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Mock API call with a delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // In a real app, this would be a fetch call
        // const response = await fetch(`/api/races/${id}`);
        // const data = await response.json();
        // setRace(data.race);
        
        // Using mock data for now
        const mockRace = mockRaces[id as string];
        if (!mockRace) {
          throw new Error('Race not found');
        }
        
        setRace(mockRace);
      } catch (err) {
        console.error('Error fetching race:', err);
        setError('Failed to load race details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchRace();
    }
  }, [id]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !race) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ py: 4 }}>
          <Alert severity="error">{error || 'Race not found'}</Alert>
        </Box>
      </Container>
    );
  }

  // Format dates
  const raceDate = typeof race.startTime === 'string' 
    ? new Date(race.startTime) 
    : race.startTime;
  
  const formattedStartDate = format(raceDate, 'PPP');
  const formattedStartTime = format(raceDate, 'p');
  
  let formattedEndDate = '';
  let formattedEndTime = '';
  
  if (race.endTime) {
    const endDate = typeof race.endTime === 'string' 
      ? new Date(race.endTime) 
      : race.endTime;
    
    formattedEndDate = format(endDate, 'PPP');
    formattedEndTime = format(endDate, 'p');
  }
  
  // Sort participants by position if race is completed
  const sortedParticipants = [...race.participants];
  if (race.status === 'COMPLETED') {
    sortedParticipants.sort((a, b) => {
      if (a.finishPosition === null && b.finishPosition === null) return 0;
      if (a.finishPosition === null || a.finishPosition === undefined) return 1;
      if (b.finishPosition === null || b.finishPosition === undefined) return -1;
      return a.finishPosition - b.finishPosition;
    });
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Race Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                {race.name}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PlaceIcon color="action" fontSize="small" />
                  <Typography variant="body1" color="text.secondary">
                    {race.track}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DirectionsCarIcon color="action" fontSize="small" />
                  <Typography variant="body1" color="text.secondary">
                    {race.category}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Chip 
              label={race.status}
              color={statusColors[race.status]}
              size="medium"
              sx={{ fontWeight: 600 }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <ScheduleIcon color="action" />
            <Typography variant="body1">
              {formattedStartDate} at {formattedStartTime}
              {race.status === 'COMPLETED' && race.endTime && (
                <> to {formattedEndDate} at {formattedEndTime}</>
              )}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmojiEventsIcon color="action" />
            <Typography variant="body1">
              {race.participants.length} Drivers
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Tabs and Content */}
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="race tabs">
              <Tab label="Participants" />
              {race.status === 'UPCOMING' && <Tab label="Place Bet" />}
              {race.status === 'COMPLETED' && <Tab label="Results" />}
            </Tabs>
          </Box>

          {/* Participants Tab */}
          <Box role="tabpanel" hidden={activeTab !== 0} sx={{ py: 3 }}>
            {activeTab === 0 && (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Driver</TableCell>
                      <TableCell>Car Number</TableCell>
                      <TableCell>Team</TableCell>
                      {race.status === 'COMPLETED' && <TableCell align="right">Position</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedParticipants.map((driver) => (
                      <TableRow key={driver.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar>{driver.name.charAt(0)}</Avatar>
                            <Typography>{driver.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{driver.carNumber || '-'}</TableCell>
                        <TableCell>{driver.teamName || '-'}</TableCell>
                        {race.status === 'COMPLETED' && (
                          <TableCell align="right">
                            {driver.finishPosition !== null && driver.finishPosition !== undefined
                              ? driver.finishPosition === 0
                                ? <Chip label="1st" color="success" size="small" />
                                : driver.finishPosition === 1
                                  ? <Chip label="2nd" color="primary" size="small" />
                                  : driver.finishPosition === 2
                                    ? <Chip label="3rd" color="secondary" size="small" />
                                    : `${driver.finishPosition + 1}th`
                              : 'DNF'}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>

          {/* Place Bet Tab */}
          <Box role="tabpanel" hidden={activeTab !== 1 || race.status !== 'UPCOMING'} sx={{ py: 3 }}>
            {activeTab === 1 && race.status === 'UPCOMING' && (
              <BettingForm 
                raceId={race.id} 
                raceName={race.name} 
                drivers={race.participants} 
              />
            )}
          </Box>

          {/* Results Tab */}
          <Box role="tabpanel" hidden={activeTab !== 1 || race.status !== 'COMPLETED'} sx={{ py: 3 }}>
            {activeTab === 1 && race.status === 'COMPLETED' && (
              <Paper variant="outlined" sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Race Results
                </Typography>
                
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Position</TableCell>
                        <TableCell>Driver</TableCell>
                        <TableCell>Team</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sortedParticipants
                        .filter(driver => driver.finishPosition !== null && driver.finishPosition !== undefined)
                        .map((driver) => (
                          <TableRow key={driver.id}>
                            <TableCell>
                              {driver.finishPosition === 0 ? (
                                <Chip label="1st" color="success" size="small" />
                              ) : driver.finishPosition === 1 ? (
                                <Chip label="2nd" color="primary" size="small" />
                              ) : driver.finishPosition === 2 ? (
                                <Chip label="3rd" color="secondary" size="small" />
                              ) : (
                                `${driver.finishPosition! + 1}th`
                              )}
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar>{driver.name.charAt(0)}</Avatar>
                                <Typography>{driver.name}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell>{driver.teamName || '-'}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}
          </Box>
        </Box>
      </Box>
    </Container>
  );
} 