import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getPostBySlug } from '@/lib/mock-db';

export const dynamic = 'force-dynamic';

type Post = {
  id: string;
  slug: string;
  title: string;
  body: string;
  publishedAt: number;
  createdAt: number;
  updatedAt: number;
};

export default async function AnnouncementDetail({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || !post.published) notFound();

  return (
    <main className="min-h-dvh bg-bg px-4 py-8 text-white">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold">基金公告</h1>
          <Link
            href="/announcements"
            className="rounded-2xl border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-white/80 backdrop-blur hover:bg-white/10"
          >
            返回列表
          </Link>
        </div>

        <article className="prose prose-invert max-w-none rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-2 text-xl font-semibold">{post.title}</h2>
          <div className="mb-4 text-[11px] text-white/60">
            发布于 {new Date(post.publishedAt ?? post.updatedAt).toLocaleString()}
          </div>
          <div className="text-sm leading-7 text-white/85">
            {post.body.split(/\n{2,}/).map((block, idx) => {
              const md = /^!\[([^\]]*)\]\((\/images\/[^\s)]+)\)$/i;
              const m1 = block.match(md);
              if (m1) {
                const alt = m1[1] ?? '';
                const url = m1[2];
                return (
                  <div key={idx} className="my-3 flex justify-center">
                    <picture>
                      <source srcSet={url} />
                      <img src={url} alt={alt} className="max-h-[420px] rounded-xl border border-white/10" />
                    </picture>
                  </div>
                );
              }
              const urlOnly = /^(\/images\/[^\s]+)$/i;
              const m2 = block.match(urlOnly);
              if (m2) {
                const url = m2[1];
                return (
                  <div key={idx} className="my-3 flex justify-center">
                    <picture>
                      <source srcSet={url} />
                      <img src={url} alt="" className="max-h-[420px] rounded-xl border border-white/10" />
                    </picture>
                  </div>
                );
              }
              return (
                <p key={idx} className="whitespace-pre-wrap">
                  {block}
                </p>
              );
            })}
          </div>
        </article>
      </div>
    </main>
  );
}
