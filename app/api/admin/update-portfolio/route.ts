import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth.server';
import { findUserByEmail, getPortfolioByUserId, updatePortfolio } from '@/lib/mock-db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const session = await getServerSession(authConfig);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.email !== 'string') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const user = await findUserByEmail(body.email);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const portfolio = await getPortfolioByUserId(user.id);
  if (!portfolio) {
    return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
  }

  const updated = await updatePortfolio({
    userId: user.id,
    totalBalance: body.totalBalance ?? portfolio.totalBalance,
    cumulativePnl: body.cumulativePnl ?? portfolio.cumulativePnl,
    nav: body.nav ?? portfolio.nav,
    lockupEnd: body.lockupEnd ?? portfolio.lockupEnd
  });

  return NextResponse.json(updated);
}
