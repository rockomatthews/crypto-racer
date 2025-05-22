'use client';

import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Slider,
  TextField,
  Button,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Alert,
  CircularProgress,
  InputAdornment,
  Skeleton,
  Tooltip,
} from '@mui/material';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useSolana } from '@/hooks/useSolana';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PersonIcon from '@mui/icons-material/Person';

// Define prop types
interface Driver {
  id: string;
  name: string;
  carNumber?: string;
  teamName?: string;
}

interface BettingFormProps {
  raceId: string;
  raceName: string;
  drivers: Driver[];
}

export default function BettingForm({ raceId, raceName, drivers }: BettingFormProps) {
  // State
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(0.1);
  const [estimatedPayout, setEstimatedPayout] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Wallet state
  const { connected } = useWallet();
  const { placeBet, isSubmitting: isPlacingBet, error: solanaError } = useSolana();

  // Set odds for each driver (in a real app, this would come from the backend)
  const driverOdds: Record<string, number> = {};
  drivers.forEach((driver, index) => {
    // Generate some reasonable mock odds based on index
    // This simulates different drivers having different odds of winning
    const baseOdd = 1.5 + (index * 0.2);
    driverOdds[driver.id] = parseFloat(baseOdd.toFixed(2));
  });

  // Recalculate estimated payout when amount or selected driver changes
  useEffect(() => {
    if (selectedDriverId && amount > 0) {
      const odds = driverOdds[selectedDriverId] || 1;
      setEstimatedPayout(amount * odds);
    } else {
      setEstimatedPayout(0);
    }
  }, [selectedDriverId, amount, driverOdds]);

  // Handle driver selection
  const handleDriverSelect = (driverId: string) => {
    setSelectedDriverId(driverId);
    // Clear any previous errors/success messages
    setError(null);
    setSuccess(null);
  };

  // Handle amount change
  const handleAmountChange = (_event: Event, newValue: number | number[]) => {
    setAmount(newValue as number);
  };

  // Handle custom amount input
  const handleCustomAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value);
    if (!isNaN(value) && value >= 0) {
      setAmount(value);
    }
  };

  // Place bet handler
  const handlePlaceBet = async () => {
    if (!selectedDriverId || amount <= 0) {
      setError('Please select a driver and enter a valid amount');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const selectedDriver = drivers.find(d => d.id === selectedDriverId);
      if (!selectedDriver) throw new Error('Selected driver not found');
      
      const odds = driverOdds[selectedDriverId];
      
      // Place the bet using the Solana hook
      await placeBet({
        raceId,
        driverId: selectedDriverId,
        amount,
        odds,
      });

      setSuccess(`Bet placed successfully on ${selectedDriver.name}!`);
      // Optionally reset the form
      setSelectedDriverId(null);
      setAmount(0.1);
    } catch (err) {
      console.error('Error placing bet:', err);
      setError(err instanceof Error ? err.message : 'Failed to place bet. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      <Typography variant="h6" component="h2" gutterBottom>
        Place a Bet on {raceName}
      </Typography>

      {!connected ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: 'primary.main', width: 56, height: 56 }}>
            <AccountBalanceWalletIcon fontSize="large" />
          </Avatar>
          <Typography variant="body1" paragraph>
            Connect your Solana wallet to place a bet
          </Typography>
          <WalletMultiButton />
        </Box>
      ) : (
        <>
          {/* Step 1: Select Driver */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom fontWeight={600}>
              1. Select a Driver
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Choose the driver you want to bet on. Each driver has different odds.
            </Typography>

            <List 
              sx={{ 
                maxHeight: '300px', 
                overflowY: 'auto',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              {drivers.map((driver) => (
                <React.Fragment key={driver.id}>
                  <ListItem
                    button
                    selected={selectedDriverId === driver.id}
                    onClick={() => handleDriverSelect(driver.id)}
                    sx={{
                      '&.Mui-selected': {
                        backgroundColor: 'primary.light',
                        '&:hover': {
                          backgroundColor: 'primary.light',
                        },
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar>
                        <PersonIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={driver.name}
                      secondary={
                        <>
                          {driver.carNumber && `Car #${driver.carNumber}`}
                          {driver.carNumber && driver.teamName && ' • '}
                          {driver.teamName}
                        </>
                      }
                    />
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography
                        variant="subtitle1"
                        color={selectedDriverId === driver.id ? 'primary.contrastText' : 'text.primary'}
                        fontWeight={600}
                      >
                        {driverOdds[driver.id]}x
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Odds
                      </Typography>
                    </Box>
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          </Box>

          {/* Step 2: Bet Amount */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom fontWeight={600}>
              2. Enter Bet Amount
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Select how much SOL you want to bet.
            </Typography>

            <Slider
              value={amount}
              onChange={handleAmountChange}
              aria-labelledby="bet-amount-slider"
              min={0.01}
              max={5}
              step={0.01}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value} SOL`}
              disabled={!selectedDriverId || isSubmitting}
              sx={{ mb: 2 }}
            />

            <TextField
              label="Custom Amount (SOL)"
              type="number"
              value={amount}
              onChange={handleCustomAmountChange}
              fullWidth
              InputProps={{
                endAdornment: <InputAdornment position="end">SOL</InputAdornment>,
              }}
              inputProps={{
                min: 0.01,
                step: 0.01,
              }}
              disabled={!selectedDriverId || isSubmitting}
            />
          </Box>

          {/* Step 3: Review and Submit */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom fontWeight={600}>
              3. Review and Place Bet
            </Typography>

            <Paper
              variant="outlined"
              sx={{ p: 2, mb: 3, backgroundColor: 'background.default' }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Driver:
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {selectedDriverId
                    ? drivers.find(d => d.id === selectedDriverId)?.name || 'Unknown'
                    : '-'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Bet Amount:
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {amount.toFixed(2)} SOL
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Odds:
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {selectedDriverId ? `${driverOdds[selectedDriverId]}x` : '-'}
                </Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1" color="text.secondary" fontWeight={600}>
                  Potential Payout:
                </Typography>
                <Typography variant="body1" color="secondary.main" fontWeight={600}>
                  {estimatedPayout.toFixed(2)} SOL
                </Typography>
              </Box>
            </Paper>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {solanaError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {solanaError}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            <Button
              variant="contained"
              color="secondary"
              size="large"
              fullWidth
              onClick={handlePlaceBet}
              disabled={!selectedDriverId || amount <= 0 || isSubmitting || isPlacingBet}
              startIcon={
                isSubmitting || isPlacingBet ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <EmojiEventsIcon />
                )
              }
            >
              {isSubmitting || isPlacingBet 
                ? 'Processing...' 
                : `Place ${amount.toFixed(2)} SOL Bet`}
            </Button>
          </Box>

          <Typography variant="caption" color="text.secondary" align="center" display="block">
            All bets are final. By placing a bet, you agree to our terms and conditions.
          </Typography>
        </>
      )}
    </Paper>
  );
} 