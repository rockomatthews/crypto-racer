'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Container, 
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import { useSearchParams, useRouter } from 'next/navigation';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LockIcon from '@mui/icons-material/Lock';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') || '/';
  const error = searchParams?.get('error');
  const [isLoading, setIsLoading] = useState(false);

  const handleIRacingSignIn = async () => {
    setIsLoading(true);
    try {
      // Mock sign in process with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, we would redirect to iRacing OAuth
      // For now, we'll simulate a successful login by redirecting to callback
      router.push(callbackUrl);
    } catch (error) {
      console.error('Error signing in:', error);
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 8 }}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
              Sign in to iRacing Crypto Bets
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Connect your iRacing account to place bets on races
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error === 'OAuthCallback' 
                ? 'There was a problem with the iRacing authentication. Please try again.' 
                : 'An error occurred during sign in. Please try again.'}
            </Alert>
          )}

          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            startIcon={<DirectionsCarIcon />}
            endIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <ArrowForwardIcon />}
            onClick={handleIRacingSignIn}
            disabled={isLoading}
            sx={{ 
              py: 1.5,
              fontSize: '1rem',
              boxShadow: 2,
            }}
          >
            Sign in with iRacing
          </Button>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
              <LockIcon fontSize="inherit" /> Secure authentication via iRacing
            </Typography>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" paragraph>
              Don&apos;t have an iRacing account?
            </Typography>
            <Button 
              variant="outlined" 
              color="primary"
              href="https://www.iracing.com/membership/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Join iRacing
            </Button>
          </Box>
        </Paper>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
} 