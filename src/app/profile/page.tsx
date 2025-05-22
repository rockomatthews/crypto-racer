'use client';

import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Container,
  Paper,
  Tabs,
  Tab,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HistoryIcon from '@mui/icons-material/History';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { format } from 'date-fns';
import { useSolana } from '@/hooks/useSolana';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

// Mock session data
const mockSession = {
  user: {
    id: '123',
    name: 'John Doe',
    email: 'john@example.com',
    iRacingId: 123456,
  }
};

// Mock data for user bets
const mockBets = [
  {
    id: '1',
    amount: 0.5,
    odds: 2.5,
    status: 'WON',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    race: {
      id: '1',
      name: 'Daytona 500',
      track: 'Daytona International Speedway',
      startTime: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    },
    driver: {
      name: 'Driver 1',
    },
    payoutAmount: 1.25,
  },
  {
    id: '2',
    amount: 0.2,
    odds: 3.0,
    status: 'LOST',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    race: {
      id: '2',
      name: 'Monaco Grand Prix',
      track: 'Circuit de Monaco',
      startTime: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    },
    driver: {
      name: 'Driver 15',
    },
  },
  {
    id: '3',
    amount: 1.0,
    odds: 1.8,
    status: 'PENDING',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    race: {
      id: '3',
      name: 'Spa 24 Hours',
      track: 'Circuit de Spa-Francorchamps',
      startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
    driver: {
      name: 'Driver 22',
    },
  },
];

export default function ProfilePage() {
  const [session, setSession] = useState<typeof mockSession | null>(null);
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [bets, setBets] = useState(mockBets);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { connected, walletAddress } = useSolana();

  useEffect(() => {
    // Simulate auth loading
    const loadSession = async () => {
      await new Promise(resolve => setTimeout(resolve, 800));
      setSession(mockSession);
      setAuthStatus('authenticated');
    };
    
    loadSession();
  }, []);

  useEffect(() => {
    // Redirect if not authenticated
    if (authStatus === 'unauthenticated') {
      router.push('/auth/signin');
    }

    // Fetch user bets
    const fetchBets = async () => {
      if (authStatus !== 'authenticated') return;

      setLoading(true);
      setError(null);
      
      try {
        // Mock API call with delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // In a real app, this would be a fetch call
        // const response = await fetch('/api/bets');
        // const data = await response.json();
        // setBets(data.bets);
        
        // Using mock data for now
        setBets(mockBets);
      } catch (err) {
        console.error('Error fetching bets:', err);
        setError('Failed to load your bets. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBets();
  }, [authStatus, router]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Loading state
  if (authStatus === 'loading') {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Not authenticated
  if (!session) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 4 }}>
          <Alert severity="warning">
            You need to sign in to view your profile.
          </Alert>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => router.push('/auth/signin')}
            >
              Sign In
            </Button>
          </Box>
        </Box>
      </Container>
    );
  }

  // Get bet stats - using all bets for demonstration
  const totalBets = bets.length;
  const wonBets = bets.filter(bet => bet.status === 'WON').length;
  const totalWon = bets
    .filter(bet => bet.status === 'WON')
    .reduce((sum, bet) => sum + (bet.payoutAmount || 0), 0);

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
            <Avatar
              sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}
            >
              {session.user?.name?.charAt(0) || 'U'}
            </Avatar>
            
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h5" gutterBottom>
                {session.user?.name || 'User'}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                iRacing ID: {session.user?.iRacingId || 'Not connected'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {session.user?.email || 'No email'}
              </Typography>
            </Box>
            
            <Box sx={{ ml: 'auto', textAlign: 'right' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Solana Wallet
              </Typography>
              {connected ? (
                <Chip 
                  label={`${walletAddress?.substring(0, 4)}...${walletAddress?.substring(walletAddress.length - 4)}`} 
                  color="success" 
                  size="small" 
                  icon={<AccountBalanceWalletIcon />}
                />
              ) : (
                <WalletMultiButton />
              )}
            </Box>
          </Box>
        </Paper>

        <Box sx={{ width: '100%', mb: 4 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              aria-label="profile tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab 
                label="Account Overview" 
                icon={<AccountCircleIcon />} 
                iconPosition="start"
              />
              <Tab 
                label="Betting History" 
                icon={<HistoryIcon />} 
                iconPosition="start"
              />
            </Tabs>
          </Box>

          {/* Account Overview Tab */}
          <Box role="tabpanel" hidden={activeTab !== 0} sx={{ py: 3 }}>
            {activeTab === 0 && (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    textAlign: 'center',
                  }}
                >
                  <DirectionsCarIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h5" gutterBottom>
                    {totalBets}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Bets
                  </Typography>
                </Paper>
                
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    textAlign: 'center',
                  }}
                >
                  <EmojiEventsIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h5" gutterBottom>
                    {wonBets}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Bets Won
                  </Typography>
                </Paper>
                
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    textAlign: 'center',
                  }}
                >
                  <AccountBalanceWalletIcon color="secondary" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h5" gutterBottom>
                    {totalWon.toFixed(2)} SOL
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Winnings
                  </Typography>
                </Paper>
              </Box>
            )}
          </Box>

          {/* Betting History Tab */}
          <Box role="tabpanel" hidden={activeTab !== 1} sx={{ py: 3 }}>
            {activeTab === 1 && (
              <>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : error ? (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                ) : bets.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <SportsScoreIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      No bets placed yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Place your first bet on an upcoming race!
                    </Typography>
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={() => router.push('/races')}
                    >
                      View Races
                    </Button>
                  </Box>
                ) : (
                  <List 
                    sx={{ 
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}
                  >
                    {bets.map((bet, index) => (
                      <React.Fragment key={bet.id}>
                        <ListItem
                          alignItems="flex-start"
                          sx={{ py: 2 }}
                          secondaryAction={
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {bet.amount.toFixed(2)} SOL
                              </Typography>
                              {bet.status === 'WON' && bet.payoutAmount && (
                                <Typography variant="body2" color="success.main">
                                  +{bet.payoutAmount.toFixed(2)} SOL
                                </Typography>
                              )}
                              <Chip 
                                label={bet.status} 
                                size="small"
                                color={
                                  bet.status === 'WON' 
                                    ? 'success' 
                                    : bet.status === 'LOST' 
                                      ? 'error' 
                                      : 'default'
                                }
                              />
                            </Box>
                          }
                        >
                          <ListItemAvatar>
                            <Avatar>
                              <DirectionsCarIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="subtitle1">
                                {bet.race.name}
                              </Typography>
                            }
                            secondary={
                              <>
                                <Typography variant="body2" color="text.secondary">
                                  {bet.driver.name} | Odds: {bet.odds}x
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {format(new Date(bet.createdAt), 'PP')}
                                </Typography>
                              </>
                            }
                          />
                        </ListItem>
                        {index < bets.length - 1 && <Divider component="li" />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </>
            )}
          </Box>
        </Box>
      </Box>
    </Container>
  );
} 