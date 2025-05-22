import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  TransactionInstruction,
} from '@solana/web3.js';

// Define MemoProgram programId since direct import isn't working
const MEMO_PROGRAM_ID = new PublicKey('Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo');

/**
 * Service to handle Solana blockchain interactions
 */
class SolanaService {
  private connection: Connection;
  
  constructor() {
    // Initialize connection to Solana network
    const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_HOST || 'https://api.devnet.solana.com';
    this.connection = new Connection(endpoint, 'confirmed');
  }

  /**
   * Get the current SOL balance for a wallet
   */
  async getBalance(walletAddress: string): Promise<number> {
    try {
      const publicKey = new PublicKey(walletAddress);
      const balance = await this.connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL; // Convert lamports to SOL
    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
  }

  /**
   * Create a transaction for placing a bet
   * This creates a simple SOL transfer transaction from user to the house account
   */
  async createBetTransaction(
    fromWallet: string, 
    houseWallet: string, 
    amount: number, 
    metadata?: string // optional metadata for the transaction (e.g., bet details)
  ): Promise<Transaction> {
    try {
      const fromPubkey = new PublicKey(fromWallet);
      const toPubkey = new PublicKey(houseWallet);
      
      // Convert SOL to lamports
      const lamports = amount * LAMPORTS_PER_SOL;
      
      // Create a simple transfer transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey,
          toPubkey,
          lamports,
        })
      );

      // Add metadata as a memo if provided
      if (metadata) {
        transaction.add(
          new TransactionInstruction({
            keys: [],
            programId: MEMO_PROGRAM_ID,
            data: Buffer.from(metadata),
          })
        );
      }

      // Get recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = fromPubkey;

      return transaction;
    } catch (error) {
      console.error('Error creating bet transaction:', error);
      throw error;
    }
  }

  /**
   * Create a transaction for paying out winnings
   */
  async createPayoutTransaction(
    houseWallet: string,
    winnerWallet: string,
    amount: number,
    metadata?: string // optional metadata for the transaction (e.g., payout details)
  ): Promise<Transaction> {
    try {
      const fromPubkey = new PublicKey(houseWallet);
      const toPubkey = new PublicKey(winnerWallet);
      
      // Convert SOL to lamports
      const lamports = amount * LAMPORTS_PER_SOL;
      
      // Create a simple transfer transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey,
          toPubkey,
          lamports,
        })
      );

      // Add metadata as a memo if provided
      if (metadata) {
        transaction.add(
          new TransactionInstruction({
            keys: [],
            programId: MEMO_PROGRAM_ID,
            data: Buffer.from(metadata),
          })
        );
      }

      // Get recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = fromPubkey;

      return transaction;
    } catch (error) {
      console.error('Error creating payout transaction:', error);
      throw error;
    }
  }

  /**
   * Verify a transaction on the blockchain
   */
  async verifyTransaction(signature: string): Promise<boolean> {
    try {
      const tx = await this.connection.getTransaction(signature);
      return tx !== null;
    } catch (error) {
      console.error('Error verifying transaction:', error);
      return false;
    }
  }

  /**
   * Get transaction details
   */
  async getTransactionDetails(signature: string): Promise<Record<string, unknown>> {
    try {
      return await this.connection.getTransaction(signature) as Record<string, unknown>;
    } catch (error) {
      console.error('Error getting transaction details:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const solanaService = new SolanaService(); 