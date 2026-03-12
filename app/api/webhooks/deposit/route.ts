import {
  createHmac,
  timingSafeEqual,
} from 'crypto';
import { NextResponse } from 'next/server';

import {
  addTransaction,
  findUserIdByDepositAddress,
  incrementAutoAmountByUserId,
} from '@/lib/mock-db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function verifyHmac(raw: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const mac = createHmac('sha256', secret).update(raw, 'utf8').digest('hex');
  try {
    const a = Buffer.from(mac);
    const b = Buffer.from(signature);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return mac === signature;
  }
}

export async function POST(request: Request) {
  const secret = process.env.TATUM_WEBHOOK_SECRET || process.env.WEBHOOK_SECRET || '';
  const raw = await request.text();
  if (secret) {
    const sig = request.headers.get('x-tatum-signature') || request.headers.get('x-signature') || null;
    const ok = verifyHmac(raw, sig, secret);
    if (!ok) return NextResponse.json({ error: 'invalid signature' }, { status: 401 });
  }
  let body: unknown;
  try {
    body = JSON.parse(raw) as unknown;
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const tx = (b?.tx || b?.transaction) as Record<string, unknown> | undefined;
  const toAddress =
    (b?.to as string | undefined) ||
    (b?.toAddress as string | undefined) ||
    (b?.address as string | undefined) ||
    (tx?.to as string | undefined);
  const amountRaw =
    (b?.amount as unknown) ||
    b?.value ||
    tx?.amount ||
    (b?.data as Record<string, unknown> | undefined)?.amount;
  const txHash =
    (b?.hash as string | undefined) ||
    (b?.txHash as string | undefined) ||
    (tx?.hash as string | undefined);
  const network = (b?.chain as string | undefined) || (b?.network as string | undefined);

  if (!toAddress || amountRaw === undefined) {
    return NextResponse.json({ error: 'missing address or amount' }, { status: 400 });
  }
  const amount = Number(amountRaw);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: 'invalid amount' }, { status: 400 });
  }

  const userId = await findUserIdByDepositAddress(String(toAddress));
  if (!userId) {
    // Ignore unknown addresses to avoid leaking information
    return NextResponse.json({ ok: true, ignored: true });
  }

  // Increase auto-amount (does not override manual priority)
  await incrementAutoAmountByUserId(userId, amount);

  // Record transaction
  const txId = `dep-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  await addTransaction({
    id: txId,
    userId,
    type: 'deposit',
    amount,
    address: String(toAddress),
    hash: txHash,
    network,
    timestamp: Date.now()
  });

  return NextResponse.json({ ok: true });
}
