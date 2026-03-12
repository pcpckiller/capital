'use client';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  AlertTriangle,
  Copy,
  LogOut,
  Wallet,
} from 'lucide-react';
import {
  signOut,
  useSession,
} from 'next-auth/react';
import dynamic from 'next/dynamic';
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const QRCode = dynamic(() => import('qrcode.react').then((m) => m.QRCodeCanvas), { ssr: false });

type Portfolio = {
  totalBalance: number;
  cumulativePnl: number;
  nav: number;
  lockupEnd: string;
};

type Network = 'USDT-ERC20' | 'USDT-TRC20';

const DEFAULT_USDT_ADDRESSES: Record<Network, string> = {
  'USDT-ERC20': '0xc76f21B6E119E2295DDC1E509fb31badfe0eA5F3',
  'USDT-TRC20': 'TCKHSD6B3mL79z7zq2srsiMErUk77GbHa2'
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [curve, setCurve] = useState<Array<{ label: string; value: number }>>([]);
  const [network, setNetwork] = useState<Network>('USDT-ERC20');
  const [copied, setCopied] = useState(false);
  const [showRisk, setShowRisk] = useState(false);
  const [fundraising, setFundraising] = useState<{ progress: number; updatedAt: number } | null>(null);
  const [depositAddr, setDepositAddr] = useState<{ erc20?: string; trc20?: string }>({});
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [wdAmount, setWdAmount] = useState('');
  const [wdAddress, setWdAddress] = useState('');
  const [wdMsg, setWdMsg] = useState<string | null>(null);
  const [wdRows, setWdRows] = useState<Array<{ id: string; amount: number; address: string; status: 'pending' | 'approved' | 'rejected'; timestamp: number }>>([]);
  const [txRows, setTxRows] = useState<Array<{ id: string; type: 'deposit' | 'withdrawal'; amount: number; address: string; hash?: string; network?: string; timestamp: number }>>([]);


  useEffect(() => {
    const key = 'cc-risk-accepted';
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(key)) {
      setShowRisk(true);
    }
  }, []);

  useEffect(() => {
    async function loadMyTransactions() {
      try {
        const res = await fetch('/api/user/transactions', { cache: 'no-store' });
        if (!res.ok) return;
        const data = (await res.json()) as Array<{ id: string; type: 'deposit' | 'withdrawal'; amount: number; address: string; hash?: string; network?: string; timestamp: number }>;
        setTxRows(Array.isArray(data) ? data : []);
      } catch {}
    }
    loadMyTransactions();
  }, []);
  useEffect(() => {
    async function loadFundraising() {
      const res = await fetch('/api/fundraising', { cache: 'no-store' });
      if (!res.ok) return;
      const data = (await res.json()) as { progress: number; updatedAt: number };
      setFundraising(data);
    }
    loadFundraising();
  }, []);

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/portfolio');
      if (!res.ok) return;
      const data = (await res.json()) as Portfolio;
      setPortfolio(data);
    }
    load();
  }, []);

  useEffect(() => {
    async function loadCurve() {
      const res = await fetch('/api/portfolio/curve', { cache: 'no-store' });
      if (!res.ok) return;
      const data = (await res.json()) as Array<{ label: string; value: number }>;
      setCurve(data);
    }
    loadCurve();
  }, []);

  useEffect(() => {
    async function loadDeposit() {
      try {
        const res = await fetch('/api/deposit-address', { cache: 'no-store' });
        if (!res.ok) return;
        const data = (await res.json()) as { erc20?: string; trc20?: string };
        setDepositAddr(data);
      } catch {}
    }
    loadDeposit();
  }, []);

  useEffect(() => {
    // 当会话准备好后再拉取一次，避免初次 401 导致未赋值
    const userId = (session?.user as { id?: string } | undefined)?.id;
    if (!userId) return;
    let cancelled = false;
    async function refetch() {
      try {
        const res = await fetch('/api/deposit-address', { cache: 'no-store' });
        if (!res.ok) return;
        const data = (await res.json()) as { erc20?: string; trc20?: string };
        if (!cancelled) setDepositAddr(data);
      } catch {}
    }
    refetch();
    return () => {
      cancelled = true;
    };
  }, [(session?.user as { id?: string } | undefined)?.id]);

  useEffect(() => {
    async function loadMyWithdrawals() {
      try {
        const res = await fetch('/api/user/withdrawals', { cache: 'no-store' });
        if (!res.ok) return;
        const data = (await res.json()) as Array<{ id: string; amount: number; address: string; status: 'pending' | 'approved' | 'rejected'; timestamp: number }>;
        setWdRows(Array.isArray(data) ? data : []);
      } catch {}
    }
    loadMyWithdrawals();
  }, []);

  const chartData = useMemo(() => {
    if (!portfolio) return [];
    const nav = Number(portfolio.nav);
    if (!Number.isFinite(nav) || nav <= 1.0000001) {
      return Array.from({ length: 12 }).map((_, i) => ({
        label: `M${i + 1}`,
        value: 1
      }));
    }
    if (curve.length > 0) return curve;
    const base = Math.max(nav - 0.2, 0.8);
    return Array.from({ length: 12 }).map((_, i) => ({
      label: `M${i + 1}`,
      value: base + ((nav - base) * (i + 1)) / 12
    }));
  }, [portfolio, curve]);

  const address =
    network === 'USDT-ERC20'
      ? depositAddr.erc20 || DEFAULT_USDT_ADDRESSES['USDT-ERC20']
      : depositAddr.trc20 || DEFAULT_USDT_ADDRESSES['USDT-TRC20'];

  async function handleCopy() {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function acceptRisk() {
    const key = 'cc-risk-accepted';
    localStorage.setItem(key, '1');
    setShowRisk(false);
  }

  return (
    <>
    <main className="min-h-dvh bg-bg px-4 py-6 text-white">
      {showRisk && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 px-4">
          <div className="max-w-lg rounded-3xl border border-white/15 bg-[#07070a]/95 p-6 shadow-glowStrong">
            <div className="flex items-start gap-3">
              <div className="mt-1 text-yellow-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold">风险披露 / Risk Disclosure</h2>
                <p className="mt-3 text-xs leading-relaxed text-white/70">
                  本系统展示的数据仅供合格投资者参考，不构成任何形式的公开募集或投资建议。过往业绩不代表未来表现，数字可能经过汇总或四舍五入处理。点击“我已理解并接受”后方可查看充值地址与资金信息。
                </p>
                <button
                  onClick={acceptRisk}
                  className="mt-4 inline-flex h-10 items-center justify-center rounded-2xl bg-electric px-5 text-xs font-semibold text-white shadow-glowStrong hover:brightness-110"
                >
                  我已理解并接受 / I Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-white/50">Investor Dashboard</div>
          <h1 className="mt-1 text-lg font-semibold">
            欢迎回来，{session?.user?.name ?? 'Investor'}
          </h1>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 backdrop-blur hover:bg-white/10"
        >
          <LogOut className="h-3.5 w-3.5" />
          退出登录
        </button>
      </header>

      <section className="mx-auto mt-8 grid max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur">
            <div className="text-xs uppercase tracking-widest text-white/60">Portfolio Summary</div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <SummaryTile
                label="总资产 / Total Balance"
                value={portfolio ? `${portfolio.totalBalance.toLocaleString()} USDT` : '—'}
              />
              <SummaryTile
                label="累计盈亏 / Cumulative PnL"
                value={
                  portfolio
                    ? `${portfolio.cumulativePnl >= 0 ? '+' : ''}${portfolio.cumulativePnl.toLocaleString()} USDT`
                    : '—'
                }
              />
              <SummaryTile
                label="当前净值 / NAV"
                value={portfolio ? portfolio.nav.toFixed(3) : '—'}
              />
            </div>
            {portfolio && (
              <p className="mt-3 text-[11px] text-white/55">
                封闭期结束时间 / Lockup end:{' '}
                <span className="text-white/80">
                  {new Date(portfolio.lockupEnd).toLocaleString()}
                </span>
              </p>
            )}
          </div>
          
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-widest text-white/60">Fundraising Progress</div>
              {fundraising && (
                <div className="text-[11px] text-white/50">更新于 {new Date(fundraising.updatedAt || Date.now()).toLocaleString()}</div>
              )}
            </div>
            <div className="mt-3 h-4 w-full overflow-hidden rounded-full border border-white/10 bg-white/[0.08]">
              <div
                className="h-full rounded-full shadow-glowStrong transition-all"
                style={{
                  width: `${Math.max(0, Math.min(100, fundraising?.progress ?? 0))}%`,
                  background: 'linear-gradient(90deg, #0070f3 0%, #7c3aed 60%, #22c55e 100%)'
                }}
              />
            </div>
            <div className="mt-2 text-right text-xs text-white/70">
              {Math.max(0, Math.min(100, fundraising?.progress ?? 0))}%
            </div>
            <div className="mt-1 text-[11px] text-white/55">
              募资规模上限（Hard Cap）：<span className="font-semibold">2,000万 USDT</span>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest text-white/60">
                  Personal Growth
                </div>
                <div className="mt-1 text-xs text-white/60">
                  模拟个体权益曲线，用于展示账户净值变化节奏。
                </div>
              </div>
            </div>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 11 }} />
                  <YAxis
                    tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }}
                    domain={['dataMin - 0.02', 'dataMax + 0.02']}
                    width={40}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(10,10,10,0.9)',
                      borderRadius: 12,
                      border: '1px solid rgba(255,255,255,0.16)'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#0070f3"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-electric/40 bg-gradient-to-b from-electric/20 via-[#050509] to-[#050505] p-5 shadow-glowStrong">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-2xl bg-black/40">
                <Wallet className="h-4 w-4 text-electric" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-white/70">
                  Deposit Funds
                </div>
                <div className="text-xs text-white/60">USDT 充值入口（稳定币入金）</div>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="space-y-1">
                <div className="text-[11px] text-white/60">选择网络 / Network</div>
                <select
                  value={network}
                  onChange={(e) => setNetwork(e.target.value as Network)}
                  className="h-10 w-full rounded-2xl border border-white/15 bg-black/40 px-3 text-xs text-white outline-none focus:border-electric focus:shadow-glow"
                >
                  <option value="USDT-ERC20">USDT-ERC20 (Ethereum)</option>
                  <option value="USDT-TRC20">USDT-TRC20 (TRON)</option>
                </select>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-white/60">
                  <span>充值地址 / Deposit Address</span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 rounded-xl border border-white/15 bg-white/5 px-2 py-1 text-[10px] text-white/70 hover:bg-white/10"
                  >
                    <Copy className="h-3 w-3" />
                    {copied ? '已复制' : '复制'}
                  </button>
                </div>
                <div className="rounded-2xl border border-white/15 bg-black/60 px-3 py-2 text-[11px] font-mono text-white/90">
                  {address}
                </div>
              </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-widest text-white/70">Redemption</div>
              <button
                onClick={() => {
                  setWdAmount('');
                  setWdAddress('');
                  setWdMsg(null);
                  setShowWithdraw(true);
                }}
                className="rounded-2xl border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-white/80 backdrop-blur hover:bg-white/10"
              >
                提交提现申请
              </button>
            </div>
            <div className="mt-1 text-xs text-white/60">提交后进入清算序列，按 NAV 周期审核与执行。</div>

            <div className="mt-3 rounded-2xl border border-white/10 bg-black/40">
              <div className="grid grid-cols-4 gap-0 border-b border-white/10 px-3 py-2 text-[11px] uppercase tracking-widest text-white/55">
                <div>时间</div>
                <div>金额</div>
                <div>地址</div>
                <div className="text-right">状态</div>
              </div>
              <div className="divide-y divide-white/10">
                {wdRows.length === 0 ? (
                  <div className="px-3 py-2 text-[11px] text-white/60">暂无提现记录</div>
                ) : (
                  wdRows.map((r) => (
                    <div key={r.id} className="grid grid-cols-4 items-center gap-2 px-3 py-2 text-xs">
                      <div className="text-white/70">{new Date(r.timestamp).toLocaleString()}</div>
                      <div className="text-white">{r.amount.toLocaleString()} USDT</div>
                      <div className="truncate font-mono text-white/80">{r.address}</div>
                      <div className="text-right">
                        <span className={r.status === 'pending' ? 'text-amber-300' : r.status === 'approved' ? 'text-emerald-300' : 'text-red-300'}>
                          {r.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>


                <div className="rounded-2xl border border-yellow-500/40 bg-yellow-500/5 p-3 text-[11px] text-yellow-100">
                  <div className="font-semibold text-xs">重要提示 / Warning</div>
                  <p className="mt-1 leading-relaxed">
                    请仅向上述地址<span className="font-semibold">充值 USDT</span>。单笔最低充值金额为{' '}
                    <span className="font-semibold">10,000 USDT</span>，为确保财务分账准确，请以<span className="font-semibold">整数金额</span>投入。
                  </p>
                  <div className="mt-2 h-px w-full bg-yellow-500/20" />
                  <div className="mt-2 space-y-1 leading-relaxed">
                    <div>
                      管理费 / Management Fee：<span className="font-semibold">0.5% / Year</span>{' '}
                      <span className="text-yellow-200/90">(Accrued Monthly)</span>
                    </div>
                    <div>
                      业绩报酬 / Performance Fee：<span className="font-semibold">20% of Profits</span>{' '}
                      <span className="text-yellow-200/90">(High Water Mark applied)</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center rounded-2xl border border-white/15 bg-black/60 p-2">
                  {!showRisk && (
                    <QRCode
                      value={address}
                      size={96}
                      bgColor="#050505"
                      fgColor="#ffffff"
                      level="M"
                      includeMargin={false}
                    />
                  )}
                  {showRisk && (
                    <div className="text-[10px] text-white/50">接受风险披露后可见二维码</div>
                  )}
                </div>
              </div>

              <div className="mt-3 rounded-2xl border border-white/10 bg-black/40">
                <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
                  <div className="text-[11px] uppercase tracking-widest text-white/55">充值记录 / Deposit History</div>
                </div>
                <div className="grid grid-cols-4 gap-0 border-b border-white/10 px-3 py-2 text-[11px] uppercase tracking-widest text-white/55">
                  <div>时间</div>
                  <div>金额</div>
                  <div>地址</div>
                  <div className="text-right">Tx</div>
                </div>
                <div className="divide-y divide-white/10">
                  {txRows.filter((t) => t.type === 'deposit').length === 0 ? (
                    <div className="px-3 py-2 text-[11px] text-white/60">暂无充值记录</div>
                  ) : (
                    txRows
                      .filter((t) => t.type === 'deposit')
                      .map((t) => (
                        <div key={t.id} className="grid grid-cols-4 items-center gap-2 px-3 py-2 text-xs">
                          <div className="text-white/70">{new Date(t.timestamp).toLocaleString()}</div>
                          <div className="text-white">{t.amount.toLocaleString()} USDT</div>
                          <div className="truncate font-mono text-white/80">{t.address}</div>
                          <div className="truncate text-right font-mono text-white/60">
                            {t.hash ? t.hash.slice(0, 10) + '…' : '—'}
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>

            <div className="mt-3 text-[10px] text-white/55">
              充值到账后，资金将被分配至策略组合对应的经纪子账户。净值（NAV）将于每日 00:00 (UTC+8) 更新。期间可能存在链上确认与风控检查延迟。
            </div>
          </div>

          {/* 去掉重复的右下角提现标签，避免与上方 Redemption 卡片重复 */}
        </div>
      </section>
    </main>
      {showWithdraw && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 px-4">
          <div className="w-full max-w-md rounded-3xl border border-white/15 bg-[#07070a]/95 p-6 shadow-glowStrong">
            <div className="mb-3 text-sm font-semibold">提交提现申请</div>
            {wdMsg && <div className="mb-3 rounded-xl border border-amber-800/40 bg-amber-900/20 p-2 text-xs text-amber-200">{wdMsg}</div>}
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <div className="text-white/60">Amount (USDT)</div>
                <input
                  value={wdAmount}
                  onChange={(e) => setWdAmount(e.target.value)}
                  type="number"
                  min={0}
                  step="0.01"
                  className="h-9 w-full rounded-2xl border border-white/10 bg-black/40 px-3 text-xs outline-none focus:border-electric focus:shadow-glow"
                />
              </div>
              <div className="space-y-1">
                <div className="text-white/60">Withdrawal Address (ERC20/TRC20)</div>
                <input
                  value={wdAddress}
                  onChange={(e) => setWdAddress(e.target.value)}
                  className="h-9 w-full rounded-2xl border border-white/10 bg-black/40 px-3 text-xs outline-none focus:border-electric focus:shadow-glow"
                  placeholder="0x... 或 T..."
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={async () => {
                    setWdMsg(null);
                    const amount = Number(wdAmount);
                    if (!Number.isFinite(amount) || amount <= 0) {
                      setWdMsg('请输入有效的金额');
                      return;
                    }
                    if (!wdAddress.trim()) {
                      setWdMsg('请输入提现地址');
                      return;
                    }
                    const res = await fetch('/api/user/withdraw', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ amount, address: wdAddress.trim() })
                    });
                    const data = await res.json().catch(() => null);
                    if (!res.ok) {
                      setWdMsg(data?.error ?? '提交失败');
                      return;
                    }
                    setWdMsg('您的提现申请已进入结算序列。系统将根据资产净值(NAV)清算周期进行审核，处理结果将同步至您的账户账单及注册邮箱。 / Your redemption request has entered the settlement queue. Processing status will be updated via your portal and registered email according to the NAV liquidation cycle.');
                    // 刷新历史列表
                    try {
                      const rr = await fetch('/api/user/withdrawals', { cache: 'no-store' });
                      if (rr.ok) {
                        const arr = (await rr.json()) as Array<{ id: string; amount: number; address: string; status: 'pending' | 'approved' | 'rejected'; timestamp: number }>;
                        setWdRows(Array.isArray(arr) ? arr : []);
                      }
                    } catch {}
                    setTimeout(() => setShowWithdraw(false), 1800);
                  }}
                  className="inline-flex h-9 items-center justify-center rounded-2xl bg-electric px-4 text-xs font-semibold text-white shadow-glowStrong hover:brightness-110"
                >
                  提交
                </button>
                <button
                  onClick={() => setShowWithdraw(false)}
                  className="inline-flex h-9 items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-4 text-xs font-semibold text-white/80 hover:bg-white/10"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
      <div className="text-[11px] text-white/60">{label}</div>
      <div className="mt-1 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}
