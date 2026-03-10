'use client';

import {
  FormEvent,
  useState,
} from 'react';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

type Point = { label: string; value: number };

export default function AdminCurvePage() {
  const { data: session } = useSession();
  const [email, setEmail] = useState('');
  const [points, setPoints] = useState<Point[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== 'admin') {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-bg text-white">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-4 text-sm text-white/70">
          仅管理员可访问此页面。
        </div>
      </main>
    );
  }

  async function loadCurve(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!email) return;
    setLoading(true);
    const res = await fetch(`/api/admin/curve?email=${encodeURIComponent(email)}`, {
      cache: 'no-store'
    });
    const data = await res.json().catch(() => null);
    setLoading(false);
    if (!res.ok) {
      setMessage(data?.error ?? '加载失败');
      return;
    }
    setPoints(Array.isArray(data) ? data : []);
  }

  async function saveCurve() {
    setMessage(null);
    setLoading(true);
    const res = await fetch('/api/admin/curve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, points })
    });
    const data = await res.json().catch(() => null);
    setLoading(false);
    if (!res.ok) {
      setMessage(data?.error ?? '保存失败');
      return;
    }
    setMessage('已保存收益曲线。');
  }

  return (
    <main className="min-h-dvh bg-bg px-4 py-8 text-white">
      <div className="mx-auto w-full max-w-5xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-white/50">Admin</div>
            <h1 className="mt-1 text-lg font-semibold">调整用户收益曲线</h1>
          </div>
          <div className="flex gap-2">
            <Link
              href="/admin"
              className="rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 backdrop-blur hover:bg-white/10"
            >
              返回 Admin
            </Link>
            <Link
              href="/admin/users"
              className="rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 backdrop-blur hover:bg-white/10"
            >
              用户列表
            </Link>
          </div>
        </div>

        <form onSubmit={loadCurve} className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
              placeholder="投资人邮箱 / Email"
              className="h-9 w-full rounded-2xl border border-white/10 bg-black/40 px-3 text-xs outline-none focus:border-electric focus:shadow-glow"
            />
            <button
              type="submit"
              className="h-9 rounded-2xl bg-electric px-4 text-xs font-semibold text-white shadow-glowStrong hover:brightness-110"
            >
              加载曲线
            </button>
          </div>
          {message && <div className="mt-2 text-[11px] text-white/65">{message}</div>}
        </form>

        {points.length > 0 && (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur">
            <div className="mb-3 text-xs uppercase tracking-widest text-white/60">编辑节点</div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {points.map((p, idx) => (
                <div key={`${p.label}-${idx}`} className="space-y-1">
                  <label className="text-[11px] text-white/70">{p.label}</label>
                  <input
                    type="number"
                    step="0.001"
                    value={p.value}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setPoints((prev) => {
                        const next = [...prev];
                        next[idx] = { ...next[idx], value: v };
                        return next;
                      });
                    }}
                    className="h-9 w-full rounded-2xl border border-white/10 bg-black/40 px-3 text-xs outline-none focus:border-electric focus:shadow-glow"
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={saveCurve}
                disabled={loading}
                className="inline-flex h-9 items-center justify-center rounded-2xl bg-electric px-4 text-xs font-semibold text-white shadow-glowStrong hover:brightness-110 disabled:opacity-60"
              >
                保存
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
