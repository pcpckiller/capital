'use client';

import {
  useEffect,
  useState,
} from 'react';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

type Post = {
  id: string;
  slug: string;
  title: string;
  body: string;
  published: boolean;
  publishedAt: number;
  createdAt: number;
  updatedAt: number;
};

export default function AdminPostsPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [editing, setEditing] = useState<Post | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const role = (session?.user as { role?: string } | undefined)?.role;

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setMessage(null);
    const res = await fetch('/api/admin/posts', { cache: 'no-store' });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setMessage(data?.error ?? '加载失败');
      return;
    }
    setPosts(data as Post[]);
  }

  async function save(post: { id?: string; slug: string; title: string; body: string; published: boolean; publishedAt?: number }) {
    setMessage(null);
    const res = await fetch('/api/admin/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'upsert', ...post })
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setMessage(data?.error ?? '保存失败');
      return;
    }
    setEditing(null);
    await load();
  }

  async function seedDefaults() {
    setMessage(null);
    const res = await fetch('/api/admin/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'seedDefaults' })
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setMessage(data?.error ?? '操作失败');
      return;
    }
    setPosts(data as Post[]);
  }

  if (role !== 'admin') {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-bg text-white">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-4 text-sm text-white/70">
          仅管理员可访问此页面。
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-bg px-4 py-8 text-white">
      <div className="mx-auto w-full max-w-5xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-white/50">Admin</div>
            <h1 className="mt-1 text-lg font-semibold">发布公告</h1>
          </div>
          <div className="flex gap-2">
            <Link
              href="/announcements"
              className="rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 backdrop-blur hover:bg-white/10"
            >
              查看前台
            </Link>
            <Link
              href="/admin"
              className="rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 backdrop-blur hover:bg-white/10"
            >
              返回 Admin
            </Link>
          </div>
        </div>

        {message && <div className="rounded-2xl border border-red-800/40 bg-red-900/20 p-3 text-sm text-red-300">{message}</div>}

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs uppercase tracking-widest text-white/60">公告列表</div>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setEditing({
                    id: '',
                    slug: '',
                    title: '',
                    body: '',
                    published: true,
                    publishedAt: Date.now(),
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                  })
                }
                className="rounded-2xl border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-white/80 hover:bg-white/10"
              >
                新建
              </button>
              <button
                onClick={seedDefaults}
                className="rounded-2xl border border-electric/40 bg-electric/90 px-3 py-1.5 text-[11px] font-semibold text-white hover:brightness-110"
              >
                一键创建示例
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {posts.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <div>
                  <div className="text-sm font-semibold">{p.title}</div>
                  <div className="text-[11px] text-white/60">
                    /announcements/{p.slug} • {p.published ? '已发布' : '草稿'} • {new Date(p.publishedAt ?? p.updatedAt).toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={() => setEditing(p)}
                  className="rounded-2xl border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-white/80 hover:bg-white/10"
                >
                  编辑
                </button>
              </div>
            ))}
            {posts.length === 0 && <div className="text-sm text-white/60">暂无公告。</div>}
          </div>
        </div>

        {editing && (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur">
            <div className="mb-3 text-xs uppercase tracking-widest text-white/60">{editing.id ? '编辑公告' : '新建公告'}</div>
            <div className="grid gap-3">
              <div className="space-y-1">
                <label className="text-white/70">标题</label>
                <input
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  className="h-9 w-full rounded-2xl border border-white/10 bg-black/40 px-3 text-xs outline-none focus:border-electric focus:shadow-glow"
                />
              </div>
              <div className="space-y-1">
                <label className="text-white/70">Slug（链接别名，仅字母数字和-）</label>
                <input
                  value={editing.slug}
                  onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                  className="h-9 w-full rounded-2xl border border-white/10 bg-black/40 px-3 text-xs outline-none focus:border-electric focus:shadow-glow"
                />
              </div>
              <div className="space-y-1">
                <label className="text-white/70">正文（支持换行）</label>
                <textarea
                  value={editing.body}
                  onChange={(e) => setEditing({ ...editing, body: e.target.value })}
                  rows={10}
                  className="w-full rounded-2xl border border-white/10 bg-black/40 p-3 text-sm outline-none focus:border-electric focus:shadow-glow"
                />
              </div>
              <label className="inline-flex items-center gap-2 text-xs text-white/80">
                <input
                  type="checkbox"
                  checked={editing.published}
                  onChange={(e) => setEditing({ ...editing, published: e.target.checked })}
                />
                发布
              </label>
              <div className="space-y-1">
                <label className="text-white/70">发布时间</label>
                <input
                  type="datetime-local"
                  value={new Date(editing.publishedAt ?? Date.now()).toISOString().slice(0, 16)}
                  onChange={(e) => {
                    const ts = Date.parse(e.target.value);
                    setEditing({ ...editing, publishedAt: isNaN(ts) ? Date.now() : ts });
                  }}
                  className="h-9 w-full rounded-2xl border border-white/10 bg-black/40 px-3 text-xs outline-none focus:border-electric focus:shadow-glow"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    save({
                      id: editing.id || undefined,
                      slug: editing.slug.trim(),
                      title: editing.title.trim(),
                      body: editing.body,
                      published: editing.published,
                      publishedAt: editing.publishedAt
                    })
                  }
                  className="inline-flex h-9 items-center justify-center rounded-2xl bg-electric px-4 text-xs font-semibold text-white shadow-glowStrong hover:brightness-110"
                >
                  保存
                </button>
                <button
                  onClick={() => setEditing(null)}
                  className="inline-flex h-9 items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-4 text-xs font-semibold text-white/80 hover:bg-white/10"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
