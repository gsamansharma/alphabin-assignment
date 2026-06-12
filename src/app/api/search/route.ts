import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface DBUser {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');

    const limit = Math.min(Math.max(parseInt(limitParam || '20', 10), 1), 100);
    const offset = Math.max(parseInt(offsetParam || '0', 10), 0);

    const terms = q.trim().split(/\s+/).filter(Boolean);

    // Measure query execution time
    const start = performance.now();

    let dbUsers: DBUser[] = [];
    let total = 0;

    if (terms.length > 0) {
      const conditions = terms.map(term => ({
        name: {
          contains: term,
          mode: 'insensitive' as const, 
        },
      }));

      const [matchedUsers, matchedTotal] = await Promise.all([
        prisma.user.findMany({
          where: {
            AND: conditions,
          },
          orderBy: { name: 'asc' },
          take: limit,
          skip: offset,
        }),
        prisma.user.count({
          where: {
            AND: conditions,
          },
        }),
      ]);

      dbUsers = matchedUsers;
      total = matchedTotal;
    } else {
      // For empty queries, load all users ordered alphabetically
      const [allUsers, allTotal] = await Promise.all([
        prisma.user.findMany({
          orderBy: { name: 'asc' },
          take: limit,
          skip: offset,
        }),
        prisma.user.count(),
      ]);

      dbUsers = allUsers;
      total = allTotal;
    }

    const end = performance.now();
    const queryTimeMs = parseFloat((end - start).toFixed(2));

    const users = dbUsers.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      created_at: u.createdAt.toISOString(),
    }));

    return NextResponse.json({
      users,
      total,
      queryTimeMs,
    });
  } catch (error: any) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
