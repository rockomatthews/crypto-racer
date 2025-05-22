import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Clean up existing data if needed
  await prisma.bet.deleteMany({});
  await prisma.driver.deleteMany({});
  await prisma.race.deleteMany({});
  await prisma.user.deleteMany({});

  // Create users
  const user1 = await prisma.user.create({
    data: {
      email: 'john@example.com',
      name: 'John Doe',
      iRacingId: 123456,
      walletAddress: '5FHwkrdxbtjJzZKZhNCvq7C2WmwYPRtYu1pzgzKvEeMj',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'jane@example.com',
      name: 'Jane Smith',
      iRacingId: 654321,
      walletAddress: '5FGfbZdEaH12ZzF1jV8jMqbsWsfRVyeHHnxzr9zXs1Wi',
    },
  });

  console.log('Created users:', { user1, user2 });

  // Create races
  const upcomingRace = await prisma.race.create({
    data: {
      subsessionId: 12345,
      name: 'Daytona 500',
      track: 'Daytona International Speedway',
      category: 'Oval',
      startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: 'UPCOMING',
      participants: {
        create: [
          {
            iRacingId: 100001,
            name: 'Driver 1',
            carNumber: '1',
            teamName: 'Team A',
            status: 'REGISTERED',
          },
          {
            iRacingId: 100002,
            name: 'Driver 2',
            carNumber: '2',
            teamName: 'Team B',
            status: 'REGISTERED',
          },
          {
            iRacingId: 100003,
            name: 'Driver 3',
            carNumber: '3',
            teamName: 'Team C',
            status: 'REGISTERED',
          },
        ],
      },
    },
    include: {
      participants: true,
    },
  });

  const liveRace = await prisma.race.create({
    data: {
      subsessionId: 23456,
      name: 'Monaco Grand Prix',
      track: 'Circuit de Monaco',
      category: 'Road',
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      status: 'LIVE',
      participants: {
        create: [
          {
            iRacingId: 200001,
            name: 'Driver A',
            carNumber: '10',
            teamName: 'Team X',
            status: 'RACING',
          },
          {
            iRacingId: 200002,
            name: 'Driver B',
            carNumber: '20',
            teamName: 'Team Y',
            status: 'RACING',
          },
          {
            iRacingId: 200003,
            name: 'Driver C',
            carNumber: '30',
            teamName: 'Team Z',
            status: 'DNF',
          },
        ],
      },
    },
    include: {
      participants: true,
    },
  });

  const completedRace = await prisma.race.create({
    data: {
      subsessionId: 34567,
      name: 'Nürburgring 24h',
      track: 'Nürburgring',
      category: 'Road',
      startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      status: 'COMPLETED',
      participants: {
        create: [
          {
            iRacingId: 300001,
            name: 'Driver Alpha',
            carNumber: '100',
            teamName: 'Team Alpha',
            status: 'FINISHED',
            finishPosition: 0, // 1st place (0-indexed)
          },
          {
            iRacingId: 300002,
            name: 'Driver Beta',
            carNumber: '200',
            teamName: 'Team Beta',
            status: 'FINISHED',
            finishPosition: 1, // 2nd place
          },
          {
            iRacingId: 300003,
            name: 'Driver Gamma',
            carNumber: '300',
            teamName: 'Team Gamma',
            status: 'FINISHED',
            finishPosition: 2, // 3rd place
          },
        ],
      },
    },
    include: {
      participants: true,
    },
  });

  console.log('Created races:', {
    upcomingRace: upcomingRace.name,
    liveRace: liveRace.name,
    completedRace: completedRace.name,
  });

  // Create bets
  const firstBet = await prisma.bet.create({
    data: {
      amount: 0.5,
      odds: 2.5,
      status: 'CONFIRMED',
      txSignature: 'tx_sig_123456789',
      userId: user1.id,
      raceId: upcomingRace.id,
      driverId: upcomingRace.participants[0].id,
    },
  });

  const secondBet = await prisma.bet.create({
    data: {
      amount: 1.0,
      odds: 3.0,
      status: 'WON',
      txSignature: 'tx_sig_987654321',
      payoutTxSignature: 'payout_tx_123',
      userId: user2.id,
      raceId: completedRace.id,
      driverId: completedRace.participants[0].id,
    },
  });

  console.log('Created bets:', { firstBet, secondBet });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 