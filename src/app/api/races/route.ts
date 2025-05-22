import { NextRequest, NextResponse } from "next/server";
import prisma from '@/lib/prisma';

// GET /api/races
export async function GET() {
  try {
    const races = await prisma.race.findMany({
      include: {
        participants: true,
        _count: {
          select: { bets: true }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    });
    
    return NextResponse.json(races);
  } catch (error) {
    console.error('Error fetching races:', error);
    return NextResponse.json(
      { error: 'Failed to fetch races' },
      { status: 500 }
    );
  }
}

// POST /api/races - Admin endpoint to manually add a race
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subsessionId, name, track, category, startTime, participants } = body;
    
    const race = await prisma.race.create({
      data: {
        subsessionId,
        name,
        track,
        category,
        startTime: new Date(startTime),
        participants: {
          create: participants || []
        }
      },
      include: {
        participants: true
      }
    });
    
    return NextResponse.json(race, { status: 201 });
  } catch (error) {
    console.error('Error creating race:', error);
    return NextResponse.json(
      { error: 'Failed to create race' },
      { status: 500 }
    );
  }
} 