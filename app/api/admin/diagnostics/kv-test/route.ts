import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth.server';
import { kv } from '@/lib/kv';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession(authConfig);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!kv.enabled) {
    return NextResponse.json({ enabled: false, ok: false, message: 'KV disabled by env' });
  }
  const key = `kv:test:write`;
  const ts = Date.now().toString();
  try {
    await kv.hmset(key, { t: ts });
    const out = await kv.hgetall(key);
    const ok = out?.t === ts;
    return NextResponse.json({
      enabled: true,
      ok,
      message: ok ? 'write/read ok' : 'mismatch',
    });
  } catch (e) {
    return NextResponse.json({
      enabled: true,
      ok: false,
      message: e instanceof Error ? e.message : 'unknown error',
    });
  }
}

