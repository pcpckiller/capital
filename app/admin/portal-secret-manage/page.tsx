'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

type Withdrawal = {
  id: string;
  userEmail: string;
  amount: number;
  address: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: number;
};

export default function AdminWithdrawalsPage() {
  const { data: session } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const [rows, setRows] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch('/api/admin/withdrawals', { cache: 'no-store' });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setMessage(data?.error ?? '加载失败');
      } else {
        setRows(Array.isArray(data) ? data : []);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function mark(id: string, status: 'approved' | 'rejected') {
    const res = await fetch('/api/admin/withdrawals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setMessage(data?.error ?? '更新失败');
      return;
    }
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
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
      <div className="mx-auto w-full max-w-6xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-white/50">Admin</div>
            <h1 className="mt-1 text-lg font-semibold">提现申请管理</h1>
          </div>
          <div className="flex gap-2">
            <Link href="/admin" className="rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 backdrop-blur hover:bg-white/10">
              返回 Admin
            </Link>
          </div>
        </div>

        {message && <div className="rounded-2xl border border-red-800/40 bg-red-900/20 p-3 text-sm text-red-300">{message}</div>}

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
          <div className="grid grid-cols-6 gap-0 border-b border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] uppercase tracking-widest text-white/60">
            <div>时间</div>
            <div>邮箱</div>
            <div>金额</div>
            <div>地址</div>
            <div>状态</div>
            <div className="text-right">操作</div>
          </div>
          <div className="divide-y divide-white/10">
            {loading ? (
              <div className="px-4 py-3 text-sm text-white/60">加载中…</div>
            ) : rows.length === 0 ? (
              <div className="px-4 py-3 text-sm text-white/60">暂无数据</div>
            ) : (
              rows.map((r) => (
                <div key={r.id} className="grid grid-cols-6 items-center gap-2 px-4 py-3 text-xs">
                  <div className="text-white/70">{new Date(r.timestamp).toLocaleString()}</div>
                  <div className="truncate text-white/80">{r.userEmail}</div>
                  <div className="text-white">{r.amount.toLocaleString()} USDT</div>
                  <div className="truncate font-mono text-white/80">{r.address}</div>
                  <div className={r.status === 'pending' ? 'text-amber-300' : r.status === 'approved' ? 'text-emerald-300' : 'text-red-300'}>
                    {r.status}
                  </div>
                  <div className="flex justify-end gap-2">
                    {r.status === 'pending' && (
                      <>
                        <button
                          onClick={() => mark(r.id, 'approved')}
                          className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[11px] text-emerald-300 hover:bg-emerald-500/20"
                        >
                          Mark as Processed
                        </button>
                        <button
                          onClick={() => mark(r.id, 'rejected')}
                          className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-1 text-[11px] text-red-300 hover:bg-red-500/20"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

