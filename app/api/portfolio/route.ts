import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authConfig } from '@/lib/auth.server';
import {
  getEffectiveBalanceByUserId,
  getPortfolioByUserId,
} from '@/lib/mock-db';

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
  const eff = await getEffectiveBalanceByUserId(String(userWithId.id));
  const patched = eff !== null ? { ...portfolio, totalBalance: eff } : portfolio;
  return NextResponse.json(patched);
}
