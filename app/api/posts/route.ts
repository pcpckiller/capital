import { NextResponse } from 'next/server';

import { listPublishedPosts } from '@/lib/mock-db';

export async function GET() {
  const posts = await listPublishedPosts();
  return NextResponse.json(posts.map((p) => ({ id: p.id, slug: p.slug, title: p.title, createdAt: p.createdAt, updatedAt: p.updatedAt })));
}
