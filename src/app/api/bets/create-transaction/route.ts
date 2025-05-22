import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { solanaService } from "@/services/solanaService";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const data = await request.json();
    
    // Validate required fields
    if (!data.walletAddress || !data.amount || !data.raceId || !data.driverId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Get the house wallet address from environment variables
    const houseWallet = process.env.HOUSE_WALLET_ADDRESS;
    
    if (!houseWallet) {
      return NextResponse.json(
        { error: "House wallet not configured" },
        { status: 500 }
      );
    }
    
    // Create metadata for the transaction
    const metadata = JSON.stringify({
      type: 'bet',
      userId: session.user.id,
      raceId: data.raceId,
      driverId: data.driverId,
      timestamp: new Date().toISOString(),
    });
    
    // Create a Solana transaction
    const transaction = await solanaService.createBetTransaction(
      data.walletAddress,
      houseWallet,
      data.amount,
      metadata
    );
    
    // Serialize the transaction to send to the client
    const serializedTransaction = transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });
    
    return NextResponse.json({
      transaction: Buffer.from(serializedTransaction).toString('base64'),
    });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
} 