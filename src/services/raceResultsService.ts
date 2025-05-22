import { PrismaClient, Bet, Race, Driver } from "@prisma/client";
import { iRacingService } from "./iRacingService";
import { solanaService } from "./solanaService";

const prisma = new PrismaClient();

/**
 * Service to process race results and settle bets
 */
export class RaceResultsService {
  /**
   * Update race status for races that have completed
   */
  async updateRaceStatuses(): Promise<void> {
    try {
      // Find races that should have started but aren't marked as completed
      const races = await prisma.race.findMany({
        where: {
          startTime: {
            lt: new Date(),
          },
          status: {
            not: 'COMPLETED',
          },
        },
      });

      for (const race of races) {
        await this.processRaceResults(race.id, race.subsessionId);
      }
    } catch (error) {
      console.error("Error updating race statuses:", error);
    }
  }

  /**
   * Process results for a specific race
   */
  async processRaceResults(raceId: string, subsessionId: number): Promise<void> {
    try {
      // Fetch race results from iRacing API
      const raceResults = await iRacingService.getRaceResults(subsessionId);
      
      if (!raceResults) {
        console.log(`No results available yet for race ${raceId} (subsession ${subsessionId})`);
        return;
      }
      
      // Update race status to COMPLETED
      await prisma.race.update({
        where: { id: raceId },
        data: { 
          status: 'COMPLETED',
          endTime: new Date(raceResults.session_end_time)
        },
      });
      
      // Update driver positions
      for (const result of raceResults.results) {
        const driver = await prisma.driver.findFirst({
          where: {
            raceId,
            iRacingId: result.cust_id,
          },
        });
        
        if (driver) {
          await prisma.driver.update({
            where: { id: driver.id },
            data: {
              finishPosition: result.finish_position,
              status: this.getDriverStatus(result),
            },
          });
        }
      }
      
      // Process bets for this race
      await this.processBetsForRace(raceId);
    } catch (error) {
      console.error(`Error processing results for race ${raceId}:`, error);
    }
  }
  
  /**
   * Determine driver status based on race result
   */
  private getDriverStatus(result: any): 'FINISHED' | 'DNF' | 'DSQ' {
    // This is a simplified example - in reality, you'd need to check for DNF/DSQ status in the API response
    if (result.laps_completed === 0) {
      return 'DSQ';
    } else if (result.finish_position === -1) {
      return 'DNF';
    } else {
      return 'FINISHED';
    }
  }
  
  /**
   * Process all bets for a specific race
   */
  async processBetsForRace(raceId: string): Promise<void> {
    try {
      const race = await prisma.race.findUnique({
        where: { id: raceId },
        include: {
          participants: true,
          bets: {
            include: {
              driver: true,
              user: true,
            },
          },
        },
      });
      
      if (!race) {
        console.error(`Race ${raceId} not found`);
        return;
      }
      
      for (const bet of race.bets) {
        await this.settleBet(bet, race);
      }
    } catch (error) {
      console.error(`Error processing bets for race ${raceId}:`, error);
    }
  }
  
  /**
   * Settle an individual bet based on race results
   */
  async settleBet(
    bet: Bet & { driver: Driver; user: { walletAddress: string | null } },
    race: Race & { participants: Driver[] }
  ): Promise<void> {
    try {
      // Skip bets that have already been processed
      if (bet.status !== 'CONFIRMED') {
        return;
      }
      
      const driver = bet.driver;
      
      // Check if driver has a finish position
      if (driver.finishPosition === null) {
        console.log(`Driver ${driver.id} has no finish position yet for race ${race.id}`);
        return;
      }
      
      const won = driver.finishPosition === 1; // Winner is position 1
      const newStatus = won ? 'WON' : 'LOST';
      
      // Update bet status
      await prisma.bet.update({
        where: { id: bet.id },
        data: { status: newStatus },
      });
      
      // Process payout if the bet won and user has a wallet address
      if (won && bet.user.walletAddress) {
        await this.processPayout(bet, bet.user.walletAddress);
      }
    } catch (error) {
      console.error(`Error settling bet ${bet.id}:`, error);
    }
  }
  
  /**
   * Process payout for a winning bet
   */
  async processPayout(bet: Bet, walletAddress: string): Promise<void> {
    try {
      // Calculate payout amount (bet amount * odds)
      const payoutAmount = bet.amount * bet.odds;
      
      // House wallet address (in a real app, this would be stored securely)
      const houseWallet = process.env.HOUSE_WALLET_ADDRESS;
      
      if (!houseWallet) {
        console.error("House wallet address not configured");
        return;
      }
      
      // Create metadata for the transaction
      const metadata = JSON.stringify({
        type: 'payout',
        betId: bet.id,
        raceId: bet.raceId,
        driverId: bet.driverId,
      });
      
      // Create payout transaction
      // Note: In a production environment, this would need to use a secure private key
      // and would likely be processed through a separate, secure service
      const transaction = await solanaService.createPayoutTransaction(
        houseWallet,
        walletAddress,
        payoutAmount,
        metadata
      );
      
      console.log(`Created payout transaction for bet ${bet.id}, amount ${payoutAmount} SOL`);
      
      // In a real application, you would sign and send this transaction
      // For now, we'll just mark it as paid out for demo purposes
      await prisma.bet.update({
        where: { id: bet.id },
        data: {
          status: 'PAID_OUT',
          payoutTxSignature: 'simulated_tx_signature',
        },
      });
    } catch (error) {
      console.error(`Error processing payout for bet ${bet.id}:`, error);
    }
  }
}

// Export an instance for use in API routes or cron jobs
export const raceResultsService = new RaceResultsService(); 