"use client";

import React, { ReactNode, useMemo } from 'react';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';

// Import the wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

interface SolanaWalletProviderProps {
  children: ReactNode;
}

export default function SolanaWalletProvider({ children }: SolanaWalletProviderProps) {
  // You can also provide a custom RPC endpoint
  const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_HOST || 'https://api.devnet.solana.com';

  // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking
  // so only the wallets you configure here will be compiled into your application
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    [] // Empty dependency array as these adapters don't change
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
} 