import { Typography, Box, Button, Paper, Container } from '@mui/material';
import Link from 'next/link';
import RaceCard from '@/components/races/RaceCard';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';

// Mock data until we can fetch from backend
const upcomingRaces = [
  {
    id: '1',
    name: 'Daytona 500',
    track: 'Daytona International Speedway',
    category: 'Oval',
    startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    status: 'UPCOMING' as const,
    participants: Array.from({ length: 40 }, (_, i) => ({
      id: `driver-${i + 1}`,
      name: `Driver ${i + 1}`,
    })),
  },
  {
    id: '2',
    name: 'Spa 24 Hours',
    track: 'Circuit de Spa-Francorchamps',
    category: 'Road',
    startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    status: 'UPCOMING' as const,
    participants: Array.from({ length: 30 }, (_, i) => ({
      id: `driver-${i + 100}`,
      name: `Driver ${i + 100}`,
    })),
  },
  {
    id: '3',
    name: 'Nürburgring Grand Prix',
    track: 'Nürburgring',
    category: 'Road',
    startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    status: 'UPCOMING' as const,
    participants: Array.from({ length: 25 }, (_, i) => ({
      id: `driver-${i + 200}`,
      name: `Driver ${i + 200}`,
    })),
  },
];

const features = [
  {
    icon: <SecurityIcon fontSize="large" color="primary" />,
    title: 'Secure Betting',
    description: 'Place bets on your favorite iRacing drivers safely with Solana blockchain technology.'
  },
  {
    icon: <SpeedIcon fontSize="large" color="primary" />,
    title: 'Real-Time Results',
    description: 'Get instant race results and payouts directly from official iRacing data.'
  },
  {
    icon: <AttachMoneyIcon fontSize="large" color="primary" />,
    title: 'Crypto Payouts',
    description: 'Automatic and transparent payouts using cryptocurrency. No middlemen, no delays.'
  }
];

export default function Home() {
  return (
    <Box sx={{ width: '100%' }}>
      {/* Hero Section */}
      <Paper 
        elevation={0}
        sx={{ 
          position: 'relative',
          height: { xs: '50vh', md: '70vh' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          bgcolor: 'primary.dark',
          color: 'white',
          borderRadius: 0,
          mb: 6,
        }}
      >
        {/* Background image or gradient can be added here */}
        <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.5)', zIndex: 1 }} />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 800,
              mb: 3,
              fontSize: { xs: '2.5rem', md: '3.5rem' }
            }}
          >
            Bet on iRacing Events with Crypto
          </Typography>
          <Typography 
            variant="h5" 
            component="p" 
            gutterBottom
            sx={{ 
              maxWidth: '800px',
              mx: 'auto',
              mb: 4,
              opacity: 0.9,
            }}
          >
            A secure and transparent betting platform for iRacing events powered by Solana blockchain technology.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button 
              component={Link}
              href="/races"
              variant="contained" 
              color="secondary" 
              size="large"
            >
              Explore Races
            </Button>
            <Button 
              component={Link}
              href="/auth/signin"
              variant="outlined" 
              color="inherit" 
              size="large"
            >
              Sign In with iRacing
            </Button>
          </Box>
        </Container>
      </Paper>

      {/* Upcoming Races Section */}
      <Container maxWidth="xl">
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Upcoming Races
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Browse upcoming races and place your bets on your favorite drivers.
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3, mt: 3 }}>
            {upcomingRaces.map((race) => (
              <Box key={race.id}>
                <RaceCard race={race} />
              </Box>
            ))}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button 
              component={Link}
              href="/races"
              variant="outlined" 
              color="primary" 
              size="large"
            >
              View All Races
            </Button>
          </Box>
        </Box>

        {/* Features Section */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom textAlign="center">
            How It Works
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4, mt: 2 }}>
            {features.map((feature, index) => (
              <Paper 
                key={index}
                elevation={0} 
                sx={{ 
                  p: 4, 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  textAlign: 'center',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Box sx={{ mb: 2 }}>
                  {feature.icon}
                </Box>
                <Typography variant="h6" component="h3" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
