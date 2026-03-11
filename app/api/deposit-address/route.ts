import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authConfig } from '@/lib/auth.server';
import { assignDepositAddresses, getDepositAddresses } from '@/lib/mock-db';

export async function GET() {
  const session = await getServerSession(authConfig);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let addr = await getDepositAddresses(userId);
  if (!addr || (!addr.erc20 && !addr.trc20)) {
    try {
      addr = await assignDepositAddresses(userId);
    } catch {}
  }
  return NextResponse.json(addr ?? {});
}

