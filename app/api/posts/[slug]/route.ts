import { NextResponse } from 'next/server';

import { getPostBySlug } from '@/lib/mock-db';

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;
  const post = await getPostBySlug(slug);
  if (!post || !post.published) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(post);
}
