import { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';

interface PlaceBetParams {
  raceId: string;
  driverId: string;
  amount: number;
  odds: number;
}

/**
 * Hook for interacting with Solana
 */
export function useSolana() {
  const { publicKey, signTransaction, connected } = useWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Place a bet using Solana
   */
  const placeBet = useCallback(
    async ({ raceId, driverId, amount, odds }: PlaceBetParams) => {
      if (!publicKey || !signTransaction) {
        throw new WalletNotConnectedError();
      }
      
      setIsSubmitting(true);
      setError(null);
      
      try {
        // Create the transaction
        const response = await fetch('/api/bets/create-transaction', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            walletAddress: publicKey.toString(),
            amount,
            raceId,
            driverId,
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create transaction');
        }
        
        const { transaction: serializedTransaction } = await response.json();
        
        // Deserialize the transaction
        const transaction = Transaction.from(
          Buffer.from(serializedTransaction, 'base64')
        );
        
        // Sign the transaction
        const signedTransaction = await signTransaction(transaction);
        
        // Send the signed transaction to the server to be confirmed
        const confirmResponse = await fetch('/api/bets/confirm-transaction', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            signedTransaction: Array.from(signedTransaction.serialize()),
            raceId,
            driverId,
            amount,
            odds,
          }),
        });
        
        if (!confirmResponse.ok) {
          const errorData = await confirmResponse.json();
          throw new Error(errorData.error || 'Failed to confirm transaction');
        }
        
        const result = await confirmResponse.json();
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [publicKey, signTransaction]
  );
  
  return {
    connected,
    walletAddress: publicKey?.toString(),
    placeBet,
    isSubmitting,
    error,
  };
} 