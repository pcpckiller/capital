'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion';
import {
  BrainCircuit,
  Shield,
  X,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Area,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type EquityPoint = { date: string; equity: number; roi: number; dd: number; monthKey: string };
type Lang = 'en' | 'zh';

const content = {
  en: {
    brand: {
      primary: 'Cartoon Capital',
      secondary: 'Market-neutral fund'
    },
    hero: {
      pill: 'Live • Market-neutral systems',
      headline: 'Where Logic Meets Alpha.',
      headlineSub: '当逻辑遇见超额收益',
      sub:
        'Cartoon Capital leverages proprietary ML models and high-frequency execution to deliver market-neutral returns.',
      cta: 'Request Access',
      footnote: 'For qualified investors only • Market-neutral focus'
    },
    alphaHighlight: {
      label: 'Alpha Highlight',
      sub: 'Make the signal obvious. Ignore the noise.',
      cardTitle: 'Phase I Fund Average Monthly Return',
      cardMetricLabel: 'Avg / month',
      cardCopy:
        'Disciplined execution and liquidity-aware scaling deliver compounding cadence calibrated to ~5× capital growth over a full year under stable conditions.',
      metrics: [
        { label: 'Sharpe Ratio', value: '2.7' },
        { label: 'Max Drawdown', value: '< 12.5%' },
        { label: 'Win Rate', value: '68%' }
      ]
    },
    theAlpha: {
      label: 'The Alpha',
      title: 'Premium, market-neutral performance engineering.',
      body:
        'We focus on low-correlation, stable and scalable strategy portfolios. The curve below illustrates a steady high-alpha equity path emphasizing risk control and return cadence.',
      pills: [
        { label: 'Execution', value: 'Millisecond-class latency' },
        { label: 'Model Stack', value: 'Transformers + ensembles' },
        { label: 'Risk', value: 'Real-time volatility shield' },
        { label: 'Mandate', value: 'Market-neutral' }
      ],
      liveSnapshotTitle: 'Live Account Snapshot',
      liveSnapshotSubtitle: 'Fund account realized P&L curve (illustrative account view).',
      liveSnapshotBody:
        'Snapshot of a live fund-account style equity curve, demonstrating how capital evolves under real execution conditions.',
      liveSnapshotNote:
        'Screenshot aesthetics belong to the execution platform. Data for demonstration only.'
    },
    strategies: {
      label: 'Core Strategies',
      title: 'Four systems. One objective: clean alpha.',
      subtitle: 'Designed like software. Traded like an engine.',
      cards: [
        {
          title: 'Neural Alpha Engines',
          body: 'Neural Alpha Engines — transformer-based predictive modeling.'
        },
        {
          title: 'Micro-Latency Execution',
          body: 'Micro-latency execution — FPGA-driven trade execution in milliseconds.'
        },
        {
          title: 'Dynamic Risk Shield',
          body: 'Dynamic Risk Shield — real-time volatility adjustments to preserve capital.'
        },
        {
          title: 'Liquidity Routing Matrix',
          body: 'Liquidity Routing Matrix — multi-venue smart order routing across ECN venues.'
        }
      ]
    },
    about: {
      label: 'About',
      title: 'Playful name. Serious outcomes.',
      body:
        'Our name is playful; our results are not. Founded by Olympiad mathematicians and ex-FAANG engineers.',
      disclaimerTitle: 'Disclaimer',
      disclaimer:
        'PAST PERFORMANCE IS NOT INDICATIVE OF FUTURE RESULTS. FOR QUALIFIED INVESTORS ONLY.'
    },
    footer: {
      right: 'Cartoon Capital • Market-neutral research & execution'
    },
    modal: {
      title: 'Request Access',
      subtitle: 'Leave your details and we will contact you in a compliant manner.',
      name: 'Name',
      email: 'Email',
      message: 'Message',
      messagePlaceholder: 'Tell us briefly about your investor profile.',
      consent: 'By submitting you agree to be contacted for information purposes only.',
      submit: 'Submit'
    }
  },
  zh: {
    brand: {
      primary: '卡顿对冲基金',
      secondary: 'Cartoon Capital'
    },
    hero: {
      pill: '实时 • 市场中性系统',
      headline: '当逻辑遇见超额收益',
      headlineSub: 'Where Logic Meets Alpha.',
      sub:
        '卡顿对冲基金利用自主研发的机器学习模型与高频执行系统，提供与市场无关的绝对收益。',
      cta: '申请访问',
      footnote: '仅限合格投资者 • 以市场中性为核心'
    },
    alphaHighlight: {
      label: 'Alpha 亮点',
      sub: '放大信号，抑制噪声。',
      cardTitle: '第⼀期基金平均月化收益率',
      cardMetricLabel: '平均每月',
      cardCopy: '在严格风控与流动性约束下进行规模扩张与执行优化，使收益节奏更可复用，逻辑上支撑全年约 5× 的资金增长（在稳健市况下）。',
      metrics: [
        { label: '夏普比率', value: '2.7' },
        { label: '最大回撤', value: '< 12.5%' },
        { label: '胜率', value: '68%' }
      ]
    },
    theAlpha: {
      label: '收益结构',
      title: '以工程化方式追求稳定超额收益。',
      body:
        '我们专注于低相关、稳定、可扩展的策略组合。下方曲线为展示用途的“稳态高 Alpha” 权益曲线，用于表达风险控制与收益节奏。',
      pills: [
        { label: '执行', value: '毫秒级延迟' },
        { label: '模型栈', value: 'Transformer 及集成模型' },
        { label: '风险', value: '实时波动率防护' },
        { label: '投资目标', value: '市场中性' }
      ],
      liveSnapshotTitle: '实盘账户快照',
      liveSnapshotSubtitle: '基金账户收益曲线（示意视图）。',
      liveSnapshotBody:
        '来自真实基金账户视图的收益曲线截图，用于展示策略在实盘环境下的资金轨迹表现。',
      liveSnapshotNote: '界面风格归属交易平台，数据仅作展示用途。'
    },
    strategies: {
      label: '核心策略',
      title: '四大系统，一个目标：干净的 Alpha。',
      subtitle: '像软件一样设计，像发动机一样交易。',
      cards: [
        {
          title: '神经阿尔法引擎',
          body: '神经阿尔法引擎——基于 Transformer 的预测建模。'
        },
        {
          title: '微秒级执行',
          body: '微秒级执行——FPGA 驱动的毫秒级交易执行。'
        },
        {
          title: '动态风险盾',
          body: '动态风险盾——实时波动率调整，确保资本安全。'
        },
        {
          title: '流动性路由矩阵',
          body: '流动性路由矩阵——多交易场所智能订单路由与 ECN 流动性聚合。'
        }
      ]
    },
    about: {
      label: '关于我们',
      title: '名字可以玩笑，结果必须严肃。',
      body:
        '我们的名字听起来很风趣，但我们的业绩非常严肃。团队成员由奥数金牌得主及前硅谷顶尖工程师组成。',
      disclaimerTitle: '免责声明',
      disclaimer:
        '投资有风险。月化 20% 的过往业绩不代表未来表现。仅限合格投资者查阅。'
    },
    footer: {
      right: '卡顿对冲基金 • 市场中性研究与执行'
    },
    modal: {
      title: '申请访问',
      subtitle: '留下联系方式，我们会以合规方式与你联系。',
      name: '姓名',
      email: '邮箱',
      message: '留言',
      messagePlaceholder: '请简单介绍你的投资者类型与需求。',
      consent: '提交即代表你同意我们仅用于沟通联系。',
      submit: '提交'
    }
  }
} as const;

function useLockedBody(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [locked]);
}

function LiveDataBackdrop() {
  const ref = useRef<HTMLDivElement | null>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 120, damping: 30, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 120, damping: 30, mass: 0.6 });
  const glowX = useTransform(sx, (v) => `${v}px`);
  const glowY = useTransform(sy, (v) => `${v}px`);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      mx.set(e.clientX - rect.left);
      my.set(e.clientY - rect.top);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [mx, my]);

  const tickers = useMemo(
    () => [
      { s: 'CART', p: '+1.42%' },
      { s: 'ALPHA', p: '+0.61%' },
      { s: 'NEUT', p: '+0.09%' },
      { s: 'VOL', p: '-0.18%' },
      { s: 'MOM', p: '+0.33%' },
      { s: 'HFT', p: '+0.77%' }
    ],
    []
  );

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-radial-glow" />
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            'radial-gradient(900px circle at 10% 10%, rgba(0,112,243,0.14), transparent 60%), radial-gradient(700px circle at 80% 20%, rgba(124,58,237,0.12), transparent 60%)'
        }}
      />

      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(to bottom, rgba(255,255,255,0.04), transparent 35%), linear-gradient(to top, rgba(0,112,243,0.10), transparent 60%)'
        }}
        animate={{ opacity: [0.65, 0.9, 0.7] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute inset-0 [background-size:44px_44px] bg-grid-faint"
        style={{
          maskImage:
            'radial-gradient(60% 50% at 50% 35%, rgba(0,0,0,1), rgba(0,0,0,0))'
        }}
        animate={{ backgroundPosition: ['0px 0px', '44px 44px'] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
      />

      <motion.div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(340px circle at var(--x) var(--y), rgba(0,112,243,0.20), transparent 60%)',
          ['--x' as never]: glowX,
          ['--y' as never]: glowY
        }}
      />

      <div className="cc-noise" />

      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bg via-bg/80 to-transparent" />

      <div className="absolute inset-0 pointer-events-none">
        {tickers.map((t, i) => (
          <motion.div
            key={t.s}
            className="absolute rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] tracking-wide text-white/80 backdrop-blur"
            style={{
              left: `${10 + i * 14}%`,
              top: `${18 + (i % 3) * 12}%`
            }}
            animate={{ y: [0, -10, 0], opacity: [0.55, 0.9, 0.65] }}
            transition={{ duration: 6 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
          >
            <span className="font-medium">{t.s}</span>
            <span className="ml-2 text-electric">{t.p}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur">
      <div className="text-xs uppercase tracking-widest text-white/60">{label}</div>
      <div className="mt-2 text-xl font-semibold text-white">{value}</div>
    </div>
  );
}

function PerformanceChart({ data }: { data: EquityPoint[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const julyMin = useMemo(() => {
    let min: EquityPoint | null = null;
    for (const p of data) {
      if (p.date.startsWith('2025-07')) {
        if (!min || p.equity < min.equity) min = p;
      }
    }
    return min;
  }, [data]);
  const novMin = useMemo(() => {
    let min: EquityPoint | null = null;
    for (const p of data) {
      if (p.date.startsWith('2025-11')) {
        if (!min || p.equity < min.equity) min = p;
      }
    }
    return min;
  }, [data]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-4 shadow-[0_0_0_1px_rgba(0,112,243,0.25)] backdrop-blur">
      <div className="absolute inset-0 bg-[radial-gradient(600px_circle_at_20%_0%,rgba(0,112,243,0.18),transparent_55%)]" />
      <div className="relative">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold">Performance Graph</div>
            <div className="text-xs text-white/60">12-month equity curve</div>
          </div>
          <div className="text-xs text-white/60">
            Start $3M → <span className="text-white/85">{((data.at(-1)?.equity ?? 0) / 1_000_000).toFixed(2)}M</span>
          </div>
        </div>
        <div className="h-56 w-full">
          {!mounted ? (
            <div className="h-full w-full rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02]" />
          ) : (
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 6 }}>
              <defs>
                <linearGradient id="ccAreaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="10%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="rgba(16,185,129,0)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                minTickGap={18}
                tickMargin={8}
                tickFormatter={(label: string) => {
                  // Only show month for the first day entries
                  if (!label) return '';
                  const [y, m, d] = label.split('-');
                  if (d === '01') {
                    const mon = new Date(`${label}T00:00:00Z`).toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
                    return `${mon} ${y}`;
                  }
                  return '';
                }}
              />
              <YAxis
                tickFormatter={(v) => `${Math.round(Number(v) / 1_000_000)}M`}
                tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={44}
                domain={['dataMin - 500000', 'dataMax + 500000']}
              />
              <Tooltip
                cursor={{ stroke: 'rgba(16,185,129,0.35)' }}
                contentStyle={{ background: 'rgba(10,10,10,0.9)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, boxShadow: '0 18px 60px rgba(0,0,0,0.55)', color: 'rgba(255,255,255,0.9)' }}
                labelStyle={{ color: 'rgba(255,255,255,0.65)' }}
                content={({ label, payload }) => {
                  if (!payload || payload.length === 0) return null;
                  const p = payload[0].payload as EquityPoint;
                  const dd = p.dd * 100;
                  const mRoi = p.roi * 100;
                  return (
                    <div style={{ padding: 10 }}>
                      <div style={{ fontSize: 12, opacity: 0.8 }}>{label}</div>
                      <div style={{ fontSize: 12, marginTop: 4 }}>NAV: ${p.equity.toLocaleString()}</div>
                      <div style={{ fontSize: 12 }}>Monthly ROI: {mRoi >= 0 ? '+' : ''}{mRoi.toFixed(1)}%</div>
                      <div style={{ fontSize: 12 }}>Current Drawdown: {dd.toFixed(1)}%</div>
                    </div>
                  );
                }}
              />
              <Area type="monotone" dataKey="equity" stroke="none" fill="url(#ccAreaFill)" />
              <Line
                type="monotone"
                dataKey="equity"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: '#10b981', stroke: 'rgba(255,255,255,0.5)', strokeWidth: 1 }}
              />
              {julyMin && (
                <ReferenceDot
                  x={julyMin.date}
                  y={julyMin.equity}
                  r={3}
                  fill="#10b981"
                  stroke="rgba(255,255,255,0.7)"
                  strokeWidth={1}
                  label={({ viewBox }: { viewBox?: { x?: number; y?: number } }) => {
                    const x = (viewBox?.x ?? 0) as number;
                    const y = (viewBox?.y ?? 0) as number;
                    return (
                      <text x={x + 8} y={y - 8} fill="rgba(255,255,255,0.6)" fontSize="11">
                        Market Liquidity Shock
                      </text>
                    );
                  }}
                />
              )}
              {novMin && (
                <ReferenceDot
                  x={novMin.date}
                  y={novMin.equity}
                  r={3}
                  fill="#10b981"
                  stroke="rgba(255,255,255,0.7)"
                  strokeWidth={1}
                  label={({ viewBox }: { viewBox?: { x?: number; y?: number } }) => {
                    const x = (viewBox?.x ?? 0) as number;
                    const y = (viewBox?.y ?? 0) as number;
                    return (
                      <text x={x + 8} y={y - 8} fill="rgba(255,255,255,0.7)" fontSize="11">
                        Strategic Re-balancing
                      </text>
                    );
                  }}
                />
              )}
            </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

function ContactModal({
  open,
  onClose,
  lang
}: {
  open: boolean;
  onClose: () => void;
  lang: Lang;
}) {
  useLockedBody(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-modal="true"
          role="dialog"
        >
          <motion.button
            className="absolute inset-0 cursor-default bg-black/70"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-label="Close modal overlay"
          />

          <motion.div
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#07070a]/90 p-6 shadow-[0_0_0_1px_rgba(0,112,243,0.22),0_30px_120px_rgba(0,0,0,0.75)] backdrop-blur"
            initial={{ y: 18, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 12, scale: 0.98, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(650px_circle_at_20%_0%,rgba(0,112,243,0.18),transparent_60%)]" />
            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <motion.div
                  key={lang}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="text-base font-semibold">{content[lang].modal.title}</div>
                  <div className="mt-1 text-sm text-white/60">
                    {content[lang].modal.subtitle}
                  </div>
                </motion.div>
                <button
                  onClick={onClose}
                  className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form
                className="mt-5 grid gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  onClose();
                }}
              >
                <label className="grid gap-1">
                  <span className="text-xs uppercase tracking-widest text-white/55">
                    {content[lang].modal.name}
                  </span>
                  <input
                    required
                    placeholder="Your full name"
                    className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none ring-0 placeholder:text-white/35 focus:border-electric/60 focus:shadow-[0_0_0_3px_rgba(0,112,243,0.18)]"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-xs uppercase tracking-widest text-white/55">
                    {content[lang].modal.email}
                  </span>
                  <input
                    required
                    type="email"
                    placeholder="you@domain.com"
                    className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-electric/60 focus:shadow-[0_0_0_3px_rgba(0,112,243,0.18)]"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-xs uppercase tracking-widest text-white/55">
                    {content[lang].modal.message}
                  </span>
                  <textarea
                    rows={4}
                    placeholder={content[lang].modal.messagePlaceholder}
                    className="resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-electric/60 focus:shadow-[0_0_0_3px_rgba(0,112,243,0.18)]"
                  />
                </label>

                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-xs text-white/55">{content[lang].modal.consent}</div>
                  <button
                    type="submit"
                    className="inline-flex h-11 items-center justify-center rounded-2xl bg-electric px-5 text-sm font-semibold text-white shadow-glowStrong transition hover:brightness-110"
                  >
                    {content[lang].modal.submit}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default function Page() {
  const [modalOpen, setModalOpen] = useState(false);
  const [lang, setLang] = useState<Lang>('en');

  const data = useMemo<EquityPoint[]>(() => {
    const start = new Date('2025-03-01T00:00:00Z');
    const monthEnds: number[] = [];
    const months: Date[] = [];
    let e = 3_000_000;
    // Build monthly endpoints with specified profile (Q1 18%; July -12.5% from peak; Nov -7.8%; Q4 ~12%/mo)
    const monthlyRates: number[] = [];
    for (let i = 0; i < 12; i++) {
      if (i <= 2) monthlyRates.push(0.18);
      else if (i === 3) monthlyRates.push(0.35); // Jun boost
      else if (i === 4) monthlyRates.push(-0.125); // Jul drawdown
      else if (i === 5) monthlyRates.push(0.6); // Aug strong rebound
      else if (i === 6 || i === 7) monthlyRates.push(0.10); // Sep, Oct
      else if (i === 8) monthlyRates.push(-0.078); // Nov drawdown
      else monthlyRates.push(0.12); // Dec, Jan, Feb
    }
    for (let i = 0; i < 12; i++) {
      const d = new Date(start);
      d.setUTCMonth(start.getUTCMonth() + i);
      months.push(d);
      e = e * (1 + monthlyRates[i]);
      monthEnds.push(e);
    }
    // Subdivide each month into 4 weekly points with micro-volatility (±2.5%)
    const points: EquityPoint[] = [];
    let peak = 3_000_000;
    let monthStartEquity = 3_000_000;
    const targetFinal = 15_100_000; // chart target ~15.1M
    for (let i = 0; i < 12; i++) {
      const mStart = new Date(start);
      mStart.setUTCMonth(start.getUTCMonth() + i);
      const mEndEquity = monthEnds[i];
      const steps = 5; // 4 weeklies + 1 month end anchor
      const baseStep = Math.pow(mEndEquity / monthStartEquity, 1 / steps);
      for (let s = 1; s <= 4; s++) {
        const wDate = new Date(mStart);
        wDate.setUTCDate(1 + s * 7);
        // Deterministic pseudo-gaussian noise (sum of uniforms - 0.5)
        const seed = Math.sin((i + 1) * 137.5 + s * 23.3) * 10000;
        const u1 = seed - Math.floor(seed);
        const u2 = (seed * 1.7) - Math.floor(seed * 1.7);
        const gaussApprox = (u1 + u2 - 1) * 0.05; // approx ~[-0.05,0.05]
        const noise = Math.max(-0.025, Math.min(0.025, gaussApprox));
        const stepRet = baseStep * (1 + noise);
        const next = Math.max(1, Math.round(monthStartEquity * stepRet));
        peak = Math.max(peak, next);
        const dd = (next - peak) / peak;
        const monthKey = `${mStart.getUTCFullYear()}-${String(mStart.getUTCMonth() + 1).padStart(2, '0')}`;
        const roi = next / monthStartEquity - 1;
        const dateStr = `${wDate.getUTCFullYear()}-${String(wDate.getUTCMonth() + 1).padStart(2, '0')}-${String(wDate.getUTCDate()).padStart(2, '0')}`;
        points.push({ date: dateStr, equity: next, roi, dd, monthKey });
        monthStartEquity = next;
      }
      // Force month end anchor exactly
      const anchorDate = new Date(mStart);
      anchorDate.setUTCMonth(mStart.getUTCMonth() + 1);
      anchorDate.setUTCDate(1);
      const nextE = Math.round(mEndEquity);
      peak = Math.max(peak, nextE);
      const dd = (nextE - peak) / peak;
      const monthKey = `${mStart.getUTCFullYear()}-${String(mStart.getUTCMonth() + 1).padStart(2, '0')}`;
      const roi = nextE / (points.length > 0 ? points[points.length - 1].equity : 3_000_000) - 1;
      const dateStr = `${anchorDate.getUTCFullYear()}-${String(anchorDate.getUTCMonth() + 1).padStart(2, '0')}-${String(anchorDate.getUTCDate()).padStart(2, '0')}`;
      points.push({ date: dateStr, equity: nextE, roi, dd, monthKey });
      monthStartEquity = nextE;
    }
    // Adjust final point to hit 4.89x exactly (tiny correction on last step)
    const lastIdx = points.length - 1;
    const factor = targetFinal / points[lastIdx].equity;
    if (Math.abs(factor - 1) > 0.001) {
      const adjusted = Math.round(points[lastIdx].equity * factor);
      const prev = points[lastIdx - 1]?.equity ?? adjusted;
      points[lastIdx] = {
        ...points[lastIdx],
        equity: adjusted,
        roi: adjusted / prev - 1,
      };
    }
    // Recompute drawdown to be safe
    peak = 3_000_000;
    for (let i = 0; i < points.length; i++) {
      peak = Math.max(peak, points[i].equity);
      points[i] = { ...points[i], dd: (points[i].equity - peak) / peak };
    }
    return points;
  }, []);

  return (
    <main className="relative min-h-dvh bg-bg">
      <ContactModal open={modalOpen} onClose={() => setModalOpen(false)} lang={lang} />

      <section className="relative">
        <div className="absolute inset-0">
          <LiveDataBackdrop />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 pt-10 sm:pt-14">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/5 shadow-glow">
                <div className="h-4 w-4 rounded-full bg-electric shadow-[0_0_20px_rgba(0,112,243,0.55)]" />
              </div>
              <motion.div
                key={lang}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-sm font-semibold tracking-wide">
                  {content[lang].brand.primary}
                </div>
                <div className="text-xs text-white/55">
                  {content[lang].brand.secondary}
                </div>
              </motion.div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/announcements"
                className="inline-flex h-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-3 text-[11px] font-medium uppercase tracking-[0.18em] text-white/70 backdrop-blur transition hover:bg-white/10"
              >
                {lang === 'zh' ? '基金公告' : 'Announcements'}
              </Link>
              <button
                onClick={() => setLang((prev) => (prev === 'en' ? 'zh' : 'en'))}
                className="inline-flex h-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-3 text-[11px] font-medium uppercase tracking-[0.18em] text-white/70 backdrop-blur transition hover:bg-white/10"
              >
                <span className={lang === 'en' ? 'text-electric' : 'text-white/60'}>EN</span>
                <span className="mx-1 text-white/30">/</span>
                <span className={lang === 'zh' ? 'text-electric' : 'text-white/60'}>中文</span>
              </button>
              <Link
                href="/signup"
                className="inline-flex h-9 items-center justify-center rounded-2xl border border-electric/40 bg-electric/90 px-4 text-xs font-semibold text-white shadow-glow transition hover:brightness-110"
              >
                {lang === 'zh' ? '注册' : 'Sign up'}
              </Link>
              <Link
                href="/login"
                className="inline-flex h-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-xs font-semibold text-white/90 backdrop-blur transition hover:bg-white/10"
              >
                {lang === 'zh' ? '登录' : 'Login'}
              </Link>
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex h-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white/90 backdrop-blur transition hover:bg-white/10"
              >
                {content[lang].hero.cta}
              </button>
            </div>
          </div>

          <div className="mt-14 grid gap-10 pb-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <motion.div
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70 backdrop-blur"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-electric shadow-[0_0_16px_rgba(0,112,243,0.6)]" />
                <motion.span
                  key={lang}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {content[lang].hero.pill}
                </motion.span>
              </motion.div>

              <motion.h1
                className="mt-5 text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.05 }}
              >
                <motion.span
                  key={lang}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="block"
                >
                  {content[lang].hero.headline}
                </motion.span>
                <motion.span
                  key={`${lang}-sub`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: 0.05 }}
                  className="mt-2 block text-base font-normal text-white/60 sm:text-lg"
                >
                  {content[lang].hero.headlineSub}
                </motion.span>
              </motion.h1>

              <motion.p
                className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-white/70 sm:text-lg"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.12 }}
              >
                <motion.span
                  key={`${lang}-hero-sub`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="block"
                >
                  {content[lang].hero.sub}
                </motion.span>
              </motion.p>

              <motion.div
                className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.18 }}
              >
                <Link
                  href="/signup"
                  className="inline-flex h-12 items-center justify-center rounded-2xl bg-electric px-6 text-sm font-semibold text-white shadow-glowStrong transition hover:brightness-110"
                >
                  {lang === 'zh' ? '注册账户' : 'Create Account'}
                </Link>
                <motion.div
                  key={`${lang}-hero-foot`}
                  className="text-xs text-white/55"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {content[lang].hero.footnote}
                </motion.div>
              </motion.div>
            </div>

            <motion.div
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_0_0_1px_rgba(124,58,237,0.18)] backdrop-blur"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(650px_circle_at_30%_0%,rgba(124,58,237,0.20),transparent_58%)]" />
              <div className="relative">
                <motion.div
                  key={`${lang}-alpha-label`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="text-xs uppercase tracking-widest text-white/60">
                    {content[lang].alphaHighlight.label}
                  </div>
                  <div className="mt-2 text-sm text-white/70">
                    {content[lang].alphaHighlight.sub}
                  </div>
                </motion.div>

                <div className="mt-5 rounded-3xl border border-electric/30 bg-gradient-to-b from-electric/20 via-white/[0.04] to-white/[0.03] p-5 shadow-glowStrong">
                  <div className="text-xs uppercase tracking-widest text-white/70">
                    {content[lang].alphaHighlight.cardTitle}
                  </div>
                  <div className="mt-2 flex items-end gap-3">
                  <div className="text-5xl font-semibold tracking-tight text-white">+14.5%</div>
                    <div className="pb-2 text-xs text-white/60">
                      {content[lang].alphaHighlight.cardMetricLabel}
                    </div>
                  </div>
                  <div className="mt-3 space-y-1.5 text-xs tracking-wide text-slate-400 sm:text-sm">
                    <p>14.5% 并非运气，而是严苛算法下的必然。我们在流动性边界内寻求最优执行，在严格控制 12.5% 最大回撤的同时，成功实现了 3M 至 15M 的资金阶梯式跃迁。</p>
                    <p>14.5% is not luck; it&rsquo;s the result of algorithmic rigor. By optimizing execution within liquidity boundaries, we secured a seamless capital transition from $3M to $15M while strictly capping drawdown at 12.5%.</p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  {content[lang].alphaHighlight.metrics.map((m) => (
                    <div
                      key={m.label}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] p-3"
                    >
                      <div className="text-[11px] uppercase tracking-widest text-white/55">
                        {m.label}
                      </div>
                      <div className="mt-1 text-lg font-semibold">{m.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <motion.div
              key={`${lang}-alpha-section`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="text-xs uppercase tracking-widest text-white/60">
                {content[lang].theAlpha.label}
              </div>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                {content[lang].theAlpha.title}
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/70">
                {content[lang].theAlpha.body}
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {content[lang].theAlpha.pills.map((p) => (
                  <StatPill key={p.label} label={p.label} value={p.value} />
                ))}
              </div>
            </motion.div>
          </div>

          <PerformanceChart data={data} />
        </div>

        <div className="mt-10 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <motion.div
              key={`${lang}-snapshot-copy`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div>
                <div className="text-xs uppercase tracking-widest text-white/60">
                  {content[lang].theAlpha.liveSnapshotTitle}
                </div>
                <div className="mt-2 text-sm font-medium text-white/85">
                  {content[lang].theAlpha.liveSnapshotSubtitle}
                </div>
                <p className="mt-2 max-w-xl text-xs leading-relaxed text-white/60">
                  {content[lang].theAlpha.liveSnapshotBody}
                </p>
              </div>
            </motion.div>
            <motion.div
              key={`${lang}-snapshot-note`}
              className="text-[11px] text-white/45"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {content[lang].theAlpha.liveSnapshotNote}
            </motion.div>
          </div>
          <div className="relative mx-auto h-48 w-full max-w-4xl sm:h-56 md:h-64">
            <div className="pointer-events-none absolute inset-0 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] via-black/20 to-black/40" />
            <div className="relative h-full w-full overflow-hidden rounded-2xl">
              <Image
                src="/account-equity.png"
                alt="Fund account equity curve snapshot"
                fill
                className="object-contain"
                priority={false}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 pb-14">
        <div className="mb-6 flex items-end justify-between gap-6">
          <motion.div
            key={`${lang}-strategies-head`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="flex-1"
          >
            <div className="text-xs uppercase tracking-widest text-white/60">
              {content[lang].strategies.label}
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              {content[lang].strategies.title}
            </h2>
          </motion.div>
          <motion.div
            key={`${lang}-strategies-sub`}
            className="hidden text-sm text-white/60 lg:block"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {content[lang].strategies.subtitle}
          </motion.div>
        </div>

        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          {content[lang].strategies.cards.map((card) => {
            const Icon = card.title.includes('Neural')
              ? BrainCircuit
              : card.title.includes('微秒') || card.title.includes('Micro')
                ? Zap
                : Shield;
            return (
              <StrategyCard
                key={card.title}
                icon={<Icon className="h-5 w-5" />}
                title={card.title}
                body={card.body}
              />
            );
          })}
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 pb-14">
        <div className="grid gap-8 rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <motion.div
            key={`${lang}-about`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="text-xs uppercase tracking-widest text-white/60">
              {content[lang].about.label}
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              {content[lang].about.title}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/70">
              {content[lang].about.body}
            </p>
          </motion.div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-electric px-6 text-sm font-semibold text-white shadow-glowStrong transition hover:brightness-110"
            >
              {content[lang].hero.cta}
            </button>
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-xs leading-relaxed text-white/70">
              <div className="font-semibold text-white/85">
                {content[lang].about.disclaimerTitle}
              </div>
              <div className="mt-2">{content[lang].about.disclaimer}</div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-8">
          <div className="text-xs uppercase tracking-widest text-white/60">
            {lang === 'zh' ? '合作伙伴' : 'Partners'}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {[
              { name: 'Binance', logo: '/partners/binance.svg?v=2' },
              { name: 'OKX', logo: '/partners/okx.svg?v=2' },
              { name: 'Bybit', logo: '/partners/bybit.svg?v=2' },
              { name: 'Peak XV Partners', logo: '/partners/peakxv.svg?v=5' },
              { name: 'EC Markets', logo: '/partners/ecmarkets.svg?v=2' },
              { name: 'Hyperliquid', logo: '/partners/hyperliquid.svg?v=1' }
            ].map((p) => (
              <div
                key={p.name}
                className="flex h-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] p-3"
                title={p.name}
              >
                <img
                  src={p.logo}
                  alt={p.name}
                  className="max-h-10 opacity-90"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function StrategyCard({
  icon,
  title,
  body
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <motion.div
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur"
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
    >
      <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100">
        <div className="absolute inset-0 bg-[radial-gradient(600px_circle_at_30%_0%,rgba(0,112,243,0.18),transparent_60%)]" />
      </div>

      <div className="relative">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/5 text-electric shadow-[0_0_0_1px_rgba(0,112,243,0.20)]">
            {icon}
          </div>
          <div className="text-sm font-semibold">{title}</div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-white/70">{body}</p>
        <div className="mt-6 h-px w-full bg-gradient-to-r from-electric/40 via-white/10 to-transparent" />
        <div className="mt-3 text-xs text-white/55">
          Engineered for signal clarity • Noise suppressed
        </div>
      </div>
    </motion.div>
  );
}
