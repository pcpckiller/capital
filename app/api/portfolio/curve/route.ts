import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authConfig } from '@/lib/auth.server';
import {
  getCurveByUserId,
  getPortfolioByUserId,
} from '@/lib/mock-db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authConfig);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const curve = await getCurveByUserId(userId);
  if (curve && curve.length > 0) {
    return NextResponse.json(curve);
  }

  const portfolio = await getPortfolioByUserId(userId);
  const nav = portfolio?.nav ?? 1;
  if (!Number.isFinite(nav) || nav <= 1.0000001) {
    const flat = Array.from({ length: 12 }).map((_, i) => ({
      label: `M${i + 1}`,
      value: 1
    }));
    return NextResponse.json(flat);
  }
  const base = Math.max(nav - 0.2, 0.8);
  const fallback = Array.from({ length: 12 }).map((_, i) => ({
    label: `M${i + 1}`,
    value: base + ((nav - base) * (i + 1)) / 12
  }));
  return NextResponse.json(fallback);
}
