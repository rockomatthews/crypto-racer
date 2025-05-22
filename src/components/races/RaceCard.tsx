import React from 'react';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  CardActions,
  Button,
  Grid,
  Divider,
} from '@mui/material';
import { RaceStatus } from '@prisma/client';
import Link from 'next/link';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import SportsMmaIcon from '@mui/icons-material/SportsMma';
import PlaceIcon from '@mui/icons-material/Place';
import ScheduleIcon from '@mui/icons-material/Schedule';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

// Define status colors
const statusColors = {
  UPCOMING: 'primary',
  LIVE: 'error',
  COMPLETED: 'success',
  CANCELLED: 'default',
};

// Define props type
interface RaceCardProps {
  race: {
    id: string;
    name: string;
    track: string;
    category: string;
    startTime: Date | string;
    status: RaceStatus;
    participants: Array<{
      id: string;
      name: string;
      finishPosition?: number | null;
    }>;
    bets?: Array<{
      id: string;
      amount: number;
      odds: number;
    }>;
  };
}

export default function RaceCard({ race }: RaceCardProps) {
  // Format date
  const raceDate = typeof race.startTime === 'string' 
    ? new Date(race.startTime) 
    : race.startTime;
  
  const formattedDate = format(raceDate, 'MMM dd, yyyy');
  const formattedTime = format(raceDate, 'h:mm a');
  
  // Count bets if available
  const betCount = race.bets?.length || 0;
  
  // Check if any bets were placed by the current user
  const hasBets = betCount > 0;

  // Get status color
  const statusColor = statusColors[race.status] || 'default';
  
  return (
    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            {race.name}
          </Typography>
          <Chip 
            label={race.status.replace('_', ' ')} 
            color={statusColor as any}
            size="small"
          />
        </Box>
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PlaceIcon color="action" fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                {race.track}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DirectionsCarIcon color="action" fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                {race.category}
              </Typography>
            </Box>
          </Grid>
        </Grid>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <ScheduleIcon color="action" fontSize="small" />
          <Typography variant="body2" color="text.secondary">
            {formattedDate} at {formattedTime}
          </Typography>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmojiEventsIcon color="action" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              {race.participants.length} Drivers
            </Typography>
          </Box>
          
          {hasBets && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SportsMmaIcon color="secondary" fontSize="small" />
              <Typography variant="body2" color="secondary.main">
                {betCount} Bet{betCount !== 1 ? 's' : ''} Placed
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
      
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button 
          component={Link}
          href={`/races/${race.id}`}
          variant="contained" 
          color="primary"
          fullWidth
        >
          {race.status === 'UPCOMING' ? 'Place Bet' : 'View Details'}
        </Button>
      </CardActions>
    </Card>
  );
} 