import { NextResponse } from 'next/server';
import { getPostBySlug } from '@/lib/mock-db';

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const post = await getPostBySlug(params.slug);
  if (!post || !post.published) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(post);
}

