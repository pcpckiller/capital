import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authConfig } from '@/lib/auth.server';
import { kv } from '@/lib/kv';
import {
  getDepositAddressPools,
  setDepositAddressPools,
} from '@/lib/mock-db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const session = await getServerSession(authConfig);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const body = (await request.json().catch(() => null)) as { erc20?: string[]; trc20?: string[] } | null;
  if (!body || (!Array.isArray(body.erc20) && !Array.isArray(body.trc20))) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
  await setDepositAddressPools({
    erc20: Array.isArray(body.erc20) ? body.erc20 : undefined,
    trc20: Array.isArray(body.trc20) ? body.trc20 : undefined
  });
  let persistent = false;
  if (kv.enabled) {
    try {
      const pools = await kv.hgetall('deposit:pools');
      persistent = Boolean(pools && (pools.erc20 || pools.trc20));
    } catch {
      persistent = false;
    }
  }
  return NextResponse.json({ ok: true, persistent, enabled: kv.enabled });
}

export async function GET() {
  const pools = await getDepositAddressPools();
  return NextResponse.json(pools);
}
