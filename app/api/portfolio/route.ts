import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth.server';
import { getPortfolioByUserId } from '@/lib/mock-db';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession(authConfig);
  const userWithId = session?.user as { id?: string } | undefined;
  if (!userWithId?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const portfolio = await getPortfolioByUserId(String(userWithId.id));
  if (!portfolio) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(portfolio);
}
