'use client';

import React, {
  FormEvent,
  useEffect,
  useState,
} from 'react';

import {
  History,
  Mail,
  ShieldCheck,
  Trash2,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default function AdminPage() {
  const { data: session } = useSession();
  const [email, setEmail] = useState('');
  const [totalBalance, setTotalBalance] = useState('');
  const [cumulativePnl, setCumulativePnl] = useState('');
  const [nav, setNav] = useState('');
  const [lockupEnd, setLockupEnd] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    const res = await fetch('/api/admin/update-portfolio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        totalBalance: totalBalance ? Number(totalBalance) : undefined,
        cumulativePnl: cumulativePnl ? Number(cumulativePnl) : undefined,
        nav: nav ? Number(nav) : undefined,
        lockupEnd: lockupEnd || undefined
      })
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setMessage(data?.error ?? '更新失败');
    } else {
      setMessage('已更新投资人账户信息。');
    }
  }

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

  return (
    <main className="flex min-h-dvh items-center justify-center bg-bg px-4 text-white py-12">
      <div className="w-full max-w-xl space-y-5">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-glow backdrop-blur">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs uppercase tracking-[0.18em] text-white/50">Admin</div>
            <div className="flex gap-2">
              <Link
                href="/admin/users"
                className="rounded-2xl border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-white/80 backdrop-blur hover:bg-white/10"
              >
                查看注册用户
              </Link>
              <Link
                href="/admin/posts"
                className="rounded-2xl border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-white/80 backdrop-blur hover:bg-white/10"
              >
                发布公告
              </Link>
              <Link
                href="/admin/curve"
                className="rounded-2xl border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-white/80 backdrop-blur hover:bg-white/10"
              >
                调整收益曲线
              </Link>
              <Link
                href="/api/admin/diagnostics"
                className="rounded-2xl border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-white/80 backdrop-blur hover:bg-white/10"
              >
                环境诊断
              </Link>
            </div>
          </div>
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-electric" />
            <div>
              <div className="text-sm font-semibold">Admin: 更新投资人账户</div>
              <div className="text-[11px] text-white/60">
                通过邮箱定位用户，并更新余额、净值、累计盈亏与封闭期。
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-white/70">投资人邮箱 / Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                type="email"
                className="h-9 w-full rounded-2xl border border-white/10 bg-black/40 px-3 text-xs outline-none focus:border-electric focus:shadow-glow"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-white/70">总资产 / Total Balance (USDT)</label>
                <input
                  value={totalBalance}
                  onChange={(e) => setTotalBalance(e.target.value)}
                  type="number"
                  className="h-9 w-full rounded-2xl border border-white/10 bg-black/40 px-3 text-xs outline-none focus:border-electric focus:shadow-glow"
                />
              </div>
              <div className="space-y-1">
                <label className="text-white/70">累计盈亏 / Cumulative PnL (USDT)</label>
                <input
                  value={cumulativePnl}
                  onChange={(e) => setCumulativePnl(e.target.value)}
                  type="number"
                  className="h-9 w-full rounded-2xl border border-white/10 bg-black/40 px-3 text-xs outline-none focus:border-electric focus:shadow-glow"
                />
              </div>
              <div className="space-y-1">
                <label className="text-white/70">净值 / NAV</label>
                <input
                  value={nav}
                  onChange={(e) => setNav(e.target.value)}
                  type="number"
                  step="0.001"
                  className="h-9 w-full rounded-2xl border border-white/10 bg-black/40 px-3 text-xs outline-none focus:border-electric focus:shadow-glow"
                />
              </div>
              <div className="space-y-1">
                <label className="text-white/70">封闭期结束时间 / Lockup End (ISO)</label>
                <input
                  value={lockupEnd}
                  onChange={(e) => setLockupEnd(e.target.value)}
                  type="datetime-local"
                  className="h-9 w-full rounded-2xl border border-white/10 bg-black/40 px-3 text-xs outline-none focus:border-electric focus:shadow-glow"
                />
              </div>
            </div>
            <button
              type="submit"
              className="mt-2 inline-flex h-9 items-center justify-center rounded-2xl bg-electric px-4 text-xs font-semibold text-white shadow-glowStrong hover:brightness-110"
            >
              保存更新
            </button>
            {message && <div className="mt-2 text-[11px] text-white/65">{message}</div>}
          </form>
        </div>

        <PendingSubscriptionsCard />
        <ProductNavCard />
        <HoldingsAdjustCard />
        <ManualAssetsCard />
        <EmailConfigCard />
        <FundraisingCard />
        <DepositPoolCard />
        <DeleteUserCard />
      </div>
    </main>
  );
}

function PendingSubscriptionsCard() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch('/api/admin/subscriptions');
    const data = await res.json();
    setRows(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function confirm(id: string) {
    if (!confirm('确认该笔申购？')) return;
    await fetch('/api/admin/subscriptions', {
      method: 'POST',
      body: JSON.stringify({ id })
    });
    load();
  }

  if (loading) return null;
  if (rows.length === 0) return null;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-glow backdrop-blur">
      <div className="mb-4 flex items-center gap-2 text-white/50">
        <History className="h-4 w-4" />
        <div className="text-xs uppercase tracking-[0.18em]">待审批申购 / Subscriptions</div>
      </div>
      <div className="space-y-3">
        {rows.map(r => (
          <div key={r.id} className="flex items-center justify-between rounded-2xl bg-black/40 p-3 text-xs">
            <div>
              <div className="text-white/80">{r.userEmail}</div>
              <div className="mt-1 text-white/50">{r.productId} • {r.amount.toLocaleString()} USDT</div>
            </div>
            <button onClick={() => confirm(r.id)} className="rounded-xl bg-emerald-500/10 px-3 py-1 text-emerald-400 hover:bg-emerald-500/20">确认</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductNavCard() {
  const [configs, setConfigs] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch('/api/admin/products');
    const data = await res.json();
    setConfigs(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function update(id: string, nav: number) {
    await fetch('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify({ productId: id, nav })
    });
    load();
  }

  if (loading || !configs) return null;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-glow backdrop-blur">
      <div className="mb-4 flex items-center gap-2 text-white/50">
        <TrendingUp className="h-4 w-4" />
        <div className="text-xs uppercase tracking-[0.18em]">产品净值 / Product NAV</div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {['master1', 'master2'].map(id => (
          <div key={id} className="space-y-2 rounded-2xl bg-black/40 p-3">
            <div className="text-[10px] uppercase text-white/50">{configs[id]?.name || id}</div>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.001"
                defaultValue={configs[id]?.nav}
                onBlur={(e) => update(id, Number(e.target.value))}
                className="h-8 w-full rounded-xl border border-white/10 bg-black/20 px-2 text-xs text-white outline-none focus:border-electric"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HoldingsAdjustCard() {
  const [email, setEmail] = useState('');
  const [holdings, setHoldings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/admin/holdings?email=${email}`);
    const data = await res.json();
    setHoldings(data.holdings || []);
    setLoading(false);
  }

  async function update(pid: string, units: number) {
    await fetch('/api/admin/holdings', {
      method: 'POST',
      body: JSON.stringify({ email, productId: pid, units })
    });
    load();
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-glow backdrop-blur">
      <div className="mb-4 flex items-center gap-2 text-white/50">
        <Users className="h-4 w-4" />
        <div className="text-xs uppercase tracking-[0.18em]">持仓调整 / Holdings Adjustment</div>
      </div>
      <div className="flex gap-2">
        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="投资人邮箱"
          className="h-9 flex-1 rounded-2xl border border-white/10 bg-black/40 px-3 text-xs text-white outline-none focus:border-electric"
        />
        <button onClick={load} className="rounded-2xl bg-white/10 px-4 text-xs">查询</button>
      </div>
      {holdings.length > 0 && (
        <div className="mt-4 space-y-2">
          {holdings.map(h => (
            <div key={h.productId} className="flex items-center justify-between rounded-2xl bg-black/40 p-3 text-xs">
              <div className="text-white/70">{h.fundName}</div>
              <input
                type="number"
                step="0.0001"
                defaultValue={h.units}
                onBlur={e => update(h.productId, Number(e.target.value))}
                className="h-8 w-24 rounded-xl border border-white/10 bg-black/20 px-2 text-right text-white outline-none focus:border-electric"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ManualAssetsCard() {
  const [email, setEmail] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/admin/user-assets?email=${email}`);
    const d = await res.json();
    setData(d);
    setLoading(false);
  }

  async function save(manualAmount: number, isManualPriority: boolean) {
    await fetch('/api/admin/user-assets', {
      method: 'POST',
      body: JSON.stringify({ email, manualAmount, isManualPriority })
    });
    load();
  }

  const isManual = data?.isManualPriority;

  return (
    <div className={`rounded-3xl border p-6 shadow-glow backdrop-blur transition-colors ${isManual ? 'border-red-500/40 bg-red-500/5' : 'border-white/10 bg-white/[0.03]'}`}>
      <div className="mb-4 flex items-center gap-2 text-white/50">
        <TrendingUp className="h-4 w-4" />
        <div className="text-xs uppercase tracking-[0.18em]">资产手动覆盖 / Manual Asset Override</div>
      </div>
      {isManual && <div className="mb-3 text-[10px] font-bold uppercase text-red-400">手动覆盖已开启 / Manual Override Active</div>}
      <div className="flex gap-2">
        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="投资人邮箱"
          className="h-9 flex-1 rounded-2xl border border-white/10 bg-black/40 px-3 text-xs text-white outline-none focus:border-electric"
        />
        <button onClick={load} className="rounded-2xl bg-white/10 px-4 text-xs">读取</button>
      </div>
      {data && (
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/70">Enable Manual Override</span>
            <button
              onClick={() => save(data.manualAmount, !data.isManualPriority)}
              className={`relative h-6 w-11 rounded-full transition-colors ${data.isManualPriority ? 'bg-red-500' : 'bg-white/10'}`}
            >
              <div className={`absolute top-1 h-4 w-4 transform rounded-full bg-white transition-transform ${data.isManualPriority ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-white/50">Manual Amount (USDT)</label>
            <input
              type="number"
              defaultValue={data.manualAmount}
              onBlur={e => save(Number(e.target.value), data.isManualPriority)}
              className="h-9 w-full rounded-2xl border border-white/10 bg-black/40 px-3 text-xs text-white outline-none focus:border-electric"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function EmailConfigCard() {
  const [config, setConfig] = useState({
    host: '',
    port: 465,
    user: '',
    pass: '',
    from: '',
    enabled: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/admin/config/email');
      const data = await res.json().catch(() => null);
      if (res.ok && data) {
        setConfig(data);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function save() {
    setSaving(true);
    setMessage(null);
    const res = await fetch('/api/admin/config/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    if (res.ok) {
      setMessage('配置已保存。');
    } else {
      setMessage('保存失败，请重试。');
    }
    setSaving(false);
  }

  if (loading) return null;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-glow backdrop-blur">
      <div className="mb-4 flex items-center gap-2 text-white/50">
        <Mail className="h-4 w-4" />
        <div className="text-xs uppercase tracking-[0.18em]">邮箱配置 / Email Configuration</div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/70">开启邮箱验证 / Enable OTP</span>
          <button
            onClick={() => setConfig({ ...config, enabled: !config.enabled })}
            className={`relative h-6 w-11 rounded-full transition-colors ${config.enabled ? 'bg-electric' : 'bg-white/10'}`}
          >
            <div className={`absolute top-1 h-4 w-4 transform rounded-full bg-white transition-transform ${config.enabled ? 'left-6' : 'left-1'}`} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] text-white/50">SMTP Host</label>
            <input
              value={config.host}
              onChange={(e) => setConfig({ ...config, host: e.target.value })}
              className="h-9 w-full rounded-2xl border border-white/10 bg-black/40 px-3 text-xs text-white outline-none focus:border-electric"
              placeholder="smtp.example.com"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-white/50">Port</label>
            <input
              type="number"
              value={config.port}
              onChange={(e) => setConfig({ ...config, port: Number(e.target.value) })}
              className="h-9 w-full rounded-2xl border border-white/10 bg-black/40 px-3 text-xs text-white outline-none focus:border-electric"
              placeholder="465"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-white/50">User / Username</label>
            <input
              value={config.user}
              onChange={(e) => setConfig({ ...config, user: e.target.value })}
              className="h-9 w-full rounded-2xl border border-white/10 bg-black/40 px-3 text-xs text-white outline-none focus:border-electric"
              placeholder="user@example.com"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-white/50">Password</label>
            <input
              type="password"
              value={config.pass}
              onChange={(e) => setConfig({ ...config, pass: e.target.value })}
              className="h-9 w-full rounded-2xl border border-white/10 bg-black/40 px-3 text-xs text-white outline-none focus:border-electric"
              placeholder="••••••••"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-white/50">Sender Name / From</label>
          <input
            value={config.from}
            onChange={(e) => setConfig({ ...config, from: e.target.value })}
            className="h-9 w-full rounded-2xl border border-white/10 bg-black/40 px-3 text-xs text-white outline-none focus:border-electric"
            placeholder="Cartoon Capital IR"
          />
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="mt-2 inline-flex h-9 w-full items-center justify-center rounded-2xl bg-electric px-4 text-xs font-semibold text-white shadow-glowStrong hover:brightness-110 disabled:opacity-50"
        >
          {saving ? '保存中…' : '保存配置'}
        </button>
        {message && <div className="text-[10px] text-white/60">{message}</div>}
      </div>
    </div>
  );
}

function FundraisingCard() {
  const [progress, setProgress] = useState('');
  const [updatedAt, setUpdatedAt] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/fundraising');
      const data = await res.json();
      setProgress(data.progress.toString());
      if (data.updatedAt) {
        const d = new Date(data.updatedAt);
        const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        setUpdatedAt(iso);
      }
    }
    load();
  }, []);

  async function save() {
    const res = await fetch('/api/admin/fundraising', {
      method: 'POST',
      body: JSON.stringify({ progress: Number(progress), updatedAt: updatedAt ? new Date(updatedAt).getTime() : undefined })
    });
    if (res.ok) setMessage('已更新募资进度。');
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-glow backdrop-blur">
      <div className="mb-4 flex items-center gap-2 text-white/50">
        <TrendingUp className="h-4 w-4" />
        <div className="text-xs uppercase tracking-[0.18em]">募资进度 / Fundraising</div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] text-white/50">Progress (%)</label>
          <input value={progress} onChange={e => setProgress(e.target.value)} type="number" className="h-9 w-full rounded-2xl border border-white/10 bg-black/40 px-3 text-xs text-white outline-none focus:border-electric" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-white/50">Updated At</label>
          <input value={updatedAt} onChange={e => setUpdatedAt(e.target.value)} type="datetime-local" className="h-9 w-full rounded-2xl border border-white/10 bg-black/40 px-3 text-xs text-white outline-none focus:border-electric" />
        </div>
      </div>
      <button onClick={save} className="mt-3 w-full rounded-2xl bg-white/10 py-2 text-xs">保存</button>
      {message && <div className="mt-2 text-[10px] text-white/50">{message}</div>}
    </div>
  );
}

function DepositPoolCard() {
  const [pools, setPools] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/admin/deposit-addresses');
      const d = await res.json();
      setPools(d);
    }
    load();
  }, []);

  if (!pools) return null;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-glow backdrop-blur">
      <div className="mb-4 flex items-center gap-2 text-white/50">
        <Wallet className="h-4 w-4" />
        <div className="text-xs uppercase tracking-[0.18em]">地址池状态 / Deposit Pool</div>
      </div>
      <div className="space-y-2 text-[11px]">
        <div className="flex justify-between"><span>ERC20 Pool:</span> <span className="text-white/80">{pools.erc20.length} addrs</span></div>
        <div className="flex justify-between"><span>TRC20 Pool:</span> <span className="text-white/80">{pools.trc20.length} addrs</span></div>
        <div className="flex justify-between"><span>Next Index:</span> <span className="text-electric">ERC20:{pools.idx.erc20} / TRC20:{pools.idx.trc20}</span></div>
      </div>
    </div>
  );
}

function DeleteUserCard() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirm(`确定要删除用户 ${email} 吗？此操作不可逆。`)) return;
    const res = await fetch('/api/admin/users/delete', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
    const d = await res.json();
    setMessage(res.ok ? '用户已删除' : d.error);
  }

  return (
    <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-6 shadow-glow backdrop-blur">
      <div className="mb-4 flex items-center gap-2 text-red-400/60">
        <Trash2 className="h-4 w-4" />
        <div className="text-xs uppercase tracking-[0.18em]">危险操作 / Danger Zone</div>
      </div>
      <div className="flex gap-2">
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="要删除的用户邮箱" className="h-9 flex-1 rounded-2xl border border-white/10 bg-black/40 px-3 text-xs text-white outline-none focus:border-red-500/50" />
        <button onClick={handleDelete} className="rounded-2xl bg-red-500/20 px-4 text-xs text-red-300">删除用户</button>
      </div>
      {message && <div className="mt-2 text-[10px] text-red-400/80">{message}</div>}
    </div>
  );
}
