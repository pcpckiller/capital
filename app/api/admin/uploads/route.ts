import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authConfig } from '@/lib/auth.server';
import { kv } from '@/lib/kv';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const session = await getServerSession(authConfig);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!kv.enabled) {
    return NextResponse.json({ error: 'KV disabled' }, { status: 503 });
  }
  const form = await request.formData();
  const file = form.get('file');
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'No file' }, { status: 400 });
  }
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  const base64 = Buffer.from(bytes).toString('base64');
  const id = `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  await kv.hmset(`image:${id}`, {
    id,
    mime: file.type || 'application/octet-stream',
    size: String(bytes.length),
    data: base64,
    createdAt: String(Date.now())
  });
  return NextResponse.json({ id, src: `/images/${id}` });
}

