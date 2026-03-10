import { kv } from '@/lib/kv';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  if (!kv.enabled) return new NextResponse('Service Unavailable', { status: 503 });
  const data = await kv.hgetall(`image:${id}`);
  if (!data?.data) return new NextResponse('Not Found', { status: 404 });
  const mime = data.mime || 'application/octet-stream';
  const buf = Buffer.from(data.data, 'base64');
  return new NextResponse(buf, {
    headers: {
      'Content-Type': mime,
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  });
}

