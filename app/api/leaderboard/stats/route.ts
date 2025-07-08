import { NextResponse } from 'next/server';
let prisma: any;
function getPrisma() {
  if (!prisma) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PrismaClient } = require('@prisma/client');
    prisma = new PrismaClient();
  }
  return prisma;
}

export async function GET() {
  try {
    const prisma = getPrisma();
    const totalUsers = await prisma.leaderboardEntry.count();
    // Count users with badges > 0 (i.e., achieved any milestone)
    const totalMilestones = await prisma.leaderboardEntry.count({ where: { badges: { gt: 0 } } });
    const accuracyRate = 99.9;
    // Get calculation count
    const calcStat = await prisma.calculationStat.findUnique({ where: { id: 1 } });
    const pointsCalculated = calcStat?.count || 0;
    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        pointsCalculated,
        totalMilestones,
        accuracyRate
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
} 