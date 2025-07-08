import { NextRequest, NextResponse } from 'next/server';
// Use dynamic import for PrismaClient to avoid issues in Next.js app directory
let prisma: any;
function getPrisma() {
  if (!prisma) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PrismaClient } = require('@prisma/client');
    prisma = new PrismaClient();
  }
  return prisma;
}

// GET: Return top 20 leaderboard entries, sorted by points desc
export async function GET() {
  try {
    const entries = await getPrisma().leaderboardEntry.findMany({
      orderBy: [
        { points: 'desc' },
        { createdAt: 'asc' },
      ],
      take: 20,
    });
    return NextResponse.json({ success: true, data: entries });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

// POST: Add or update a leaderboard entry
export async function POST(req: NextRequest) {
  try {
    const { name, avatar, points, tier, badges } = await req.json();
    if (!name || typeof points !== 'number' || !tier || typeof badges !== 'number') {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    // Upsert by name (or you can use another unique field)
    const entry = await getPrisma().leaderboardEntry.upsert({
      where: { name },
      update: { avatar, points, tier, badges },
      create: { name, avatar, points, tier, badges },
    });
    return NextResponse.json({ success: true, data: entry });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
} 