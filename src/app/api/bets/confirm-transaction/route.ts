import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { Transaction, sendAndConfirmTransaction, Connection } from "@solana/web3.js";

const prisma = new PrismaClient();

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
    if (!data.signedTransaction || !data.raceId || !data.driverId || !data.amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Recreate the transaction from the serialized data
    const signedTransaction = Transaction.from(
      Buffer.from(Uint8Array.from(data.signedTransaction))
    );
    
    // Get Solana connection
    const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_HOST || 'https://api.devnet.solana.com';
    const connection = new Connection(endpoint, 'confirmed');
    
    // Send the transaction to the Solana network
    let txSignature: string;
    try {
      // Note: In a production environment, you would need special handling for the wallet keypair
      // This is a simplification for the demo
      txSignature = await connection.sendRawTransaction(
        signedTransaction.serialize()
      );
      
      // Wait for confirmation
      await connection.confirmTransaction(txSignature);
    } catch (error) {
      console.error('Error sending transaction to Solana:', error);
      return NextResponse.json(
        { error: "Failed to send transaction to Solana" },
        { status: 500 }
      );
    }
    
    // Create the bet in the database
    const bet = await prisma.bet.create({
      data: {
        amount: data.amount,
        odds: data.odds || 1.0, // Default odds if not specified
        status: 'CONFIRMED',
        txSignature,
        userId: session.user.id,
        raceId: data.raceId,
        driverId: data.driverId,
      },
      include: {
        race: true,
        driver: true,
      },
    });
    
    return NextResponse.json({ bet, txSignature });
  } catch (error) {
    console.error("Error confirming transaction:", error);
    return NextResponse.json(
      { error: "Failed to confirm transaction" },
      { status: 500 }
    );
  }
} 