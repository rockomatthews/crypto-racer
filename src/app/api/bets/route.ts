import { NextRequest, NextResponse } from "next/server";
import prisma from '@/lib/prisma';

// GET /api/bets
export async function GET() {
  try {
    const bets = await prisma.bet.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        race: true,
        driver: true
      }
    });
    
    return NextResponse.json(bets);
  } catch (error) {
    console.error('Error fetching bets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bets' },
      { status: 500 }
    );
  }
}

// POST /api/bets - Create a new bet
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, raceId, driverId, amount, odds } = body;
    
    // Simple validation
    if (!userId || !raceId || !driverId || !amount || !odds) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const bet = await prisma.bet.create({
      data: {
        amount: parseFloat(amount),
        odds: parseFloat(odds),
        userId,
        raceId,
        driverId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        },
        race: true,
        driver: true
      }
    });
    
    return NextResponse.json(bet, { status: 201 });
  } catch (error) {
    console.error('Error creating bet:', error);
    return NextResponse.json(
      { error: 'Failed to create bet' },
      { status: 500 }
    );
  }
} 