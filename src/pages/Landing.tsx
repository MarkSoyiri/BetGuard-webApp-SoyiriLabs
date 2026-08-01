import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  LineChart as LineChartIcon,
  Bell,
  Bot,
  PiggyBank,
  GraduationCap,
  Users,
  ArrowRight,
  TrendingDown,
  Target,
  Sparkles,
  CheckCircle2,
  Star,
  Ticket,
  ShieldAlert,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Button } from '@/components/ui/Button';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { Footer } from '@/components/layout/Footer';
import { useUser } from '@/contexts/UserContext';
import { ChartTooltip, AXIS_TICK, gridStyle, COLORS } from '@/components/charts/chartUtils';

const heroData = [
  { day: 'W1', spend: 210 },
  { day: 'W2', spend: 175 },
  { day: 'W3', spend: 120 },
  { day: 'W4', spend: 95 },
  { day: 'W5', spend: 70 },
  { day: 'W6', spend: 40 },
];

const FEATURES = [
  {
    icon: LineChartIcon,
    title: 'Spending Analytics',
    text: 'Beautiful, real-time charts that show exactly where your money goes — no guesswork.',
    gradient: 'from-primary to-indigo-700',
  },
  {
    icon: Bell,
    title: 'Smart Budget Alerts',
    text: 'Get warned at 80%, 90% and 100% of your budget before a habit becomes a problem.',
    gradient: 'from-accent to-orange-500',
  },
  {
    icon: Bot,
    title: 'AI Coach',
    text: 'A personal coach that understands your numbers and gives honest, supportive advice.',
    gradient: 'from-secondary to-emerald-700',
  },
  {
    icon: PiggyBank,
    title: 'Savings Goals',
    text: 'Turn what you would have bet into real goals — a phone, a trip, an emergency fund.',
    gradient: 'from-sky-500 to-cyan-600',
  },
  {
    icon: Ticket,
    title: 'Demo Sportsbook',
    text: 'Practise on realistic fixtures with a bet slip, odds and simulated results — no real money, no risk.',
    gradient: 'from-fuchsia-500 to-purple-700',
  },
  {
    icon: ShieldAlert,
    title: 'Responsible Limits',
    text: 'Set daily, weekly and monthly caps. BetGuard blocks overspending and offers betting breaks when you need them.',
    gradient: 'from-amber-500 to-orange-700',
  },
  {
    icon: GraduationCap,
    title: 'Education Center',
    text: 'Learn about probability, gambling addiction and financial literacy in 5 minutes.',
    gradient: 'from-violet-600 to-purple-700',
  },
  {
    icon: Users,
    title: 'Supportive Community',
    text: 'An anonymous community of people on the same journey. Share, learn, grow together.',
    gradient: 'from-rose-500 to-pink-600',
  },
];

const STEPS = [
  {
    step: '01',
    title: 'Connect & Track',
    text: 'Log your bets in seconds. BetGuard automatically builds your spending picture.',
  },
  {
    step: '02',
    title: 'Understand Your Numbers',
    text: 'See your risk level, health score and budget health on beautiful, easy dashboards.',
  },
  {
    step: '03',
    title: 'Build Healthier Habits',
    text: 'Set limits, take breaks, settle sportsbook bets and learn from post-bet insights — all backed by your AI Coach.',
  },
];

const TESTIMONIALS = [
  {
    name: 'Kofi Mensah',
    role: 'Accra · 4 months on BetGuard',
    text: 'I had no idea I was spending GH₵1,800 a month on betting until BetGuard showed me. Six months later I am down 60% and finally saving for a car.',
    stars: 5,
  },
  {
    name: 'Ama Owusu',
    role: 'Kumasi · 2 months on BetGuard',
    text: 'The budget alerts are what saved me. That 80% warning makes me stop and think before I place another bet. It genuinely changed my behaviour.',
    stars: 5,
  },
  {
    name: 'Yaw Boateng',
    role: 'Takoradi · 3 months on BetGuard',
    text: 'The AI Coach feels like talking to a friend who actually knows my situation. It gave me a plan to cut spending by 30% — and I did it.',
    stars: 4,
  },
];

const STATS = [
  { value: '12,000+', label: 'Active users in Ghana' },
  { value: 'GH₵3.2M', label: 'Saved through BetGuard' },
  { value: '58%', label: 'Average spending reduction' },
  { value: '4.9/5', label: 'User satisfaction' },
];

export function Landing() {
  const { isAuthenticated } = useUser();
  const startLink = isAuthenticated ? '/dashboard' : '/register';

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.04] via-transparent to-transparent" />
        <div className="absolute -left-32 top-[-12%] size-96 rounded-full bg-primary/5 blur-[90px]" />
        <div className="absolute right-[-10%] top-[32%] size-80 rounded-full bg-secondary/5 blur-[90px]" />
        <div className="absolute bottom-[8%] left-[28%] size-72 rounded-full bg-accent/5 blur-[90px]" />
      </div>

      {/* Landing nav */}
      <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/70 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/70">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/30">
              <ShieldCheck className="size-5 text-white" aria-hidden="true" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-ink dark:text-white">
              BetGuard
            </span>
          </Link>
          <nav className="ml-8 hidden items-center gap-6 text-sm font-medium text-slate-500 lg:flex dark:text-slate-400">
            <a href="#features" className="transition hover:text-ink dark:hover:text-white">Features</a>
            <a href="#how-it-works" className="transition hover:text-ink dark:hover:text-white">How it works</a>
            <a href="#testimonials" className="transition hover:text-ink dark:hover:text-white">Stories</a>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            {isAuthenticated ? (
              <Button to="/dashboard" icon={<ArrowRight className="size-4" />}>Go to dashboard</Button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:text-primary dark:text-slate-300 dark:hover:text-white"
                >
                  Sign in
                </Link>
                <Button
                  to="/register"
                  size="sm"
                  icon={<ArrowRight className="size-4" />}
                  className="lg:px-5 lg:py-2.5 lg:text-sm lg:gap-2"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-6 pb-24 pt-16 md:pt-24">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-4 py-1.5 text-xs font-bold text-secondary-dark dark:text-secondary"
            >
              <Sparkles className="size-3.5" aria-hidden="true" />
              Responsible Betting Companion
            </motion.div>
            <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-ink sm:text-5xl md:text-6xl dark:text-white">
              Take Control of Your{' '}
              <span className="text-gradient bg-gradient-to-r from-primary to-secondary">
                Betting Habits
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-500 dark:text-slate-400">
              BetGuard helps you understand your spending, build healthier financial habits, and
              stay in control — with beautiful analytics, smart alerts and a coach that has your
              back.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button to={startLink} size="lg" icon={<ArrowRight className="size-5" />}>
                Get Started
              </Button>
              <Button to="/education" size="lg" variant="outline" icon={<GraduationCap className="size-5" />}>
                Learn More
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium text-slate-500 dark:text-slate-400">
              {['No credit card', 'Free forever', 'Your data stays on your device'].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-secondary" aria-hidden="true" /> {t}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Hero visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="relative"
          >
            <div className="glass-strong relative rounded-3xl p-6 shadow-glass-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Weekly spending
                  </p>
                  <p className="mt-1 font-display text-3xl font-bold text-ink dark:text-white">
                    GH₵40{' '}
                    <span className="text-sm font-semibold text-secondary">▼ 80% this month</span>
                  </p>
                </div>
                <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
                  <TrendingDown className="size-6" aria-hidden="true" />
                </div>
              </div>
              <div className="mt-4 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={heroData} margin={{ top: 10, right: 6, left: -18, bottom: 0 }}>
                    <defs>
                      <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid {...gridStyle} vertical={false} />
                    <XAxis dataKey="day" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                    <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="spend"
                      name="Spent"
                      stroke={COLORS.secondary}
                      strokeWidth={3}
                      fill="url(#heroGrad)"
                      animationDuration={1400}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="glass-strong absolute -left-6 top-10 flex items-center gap-3 rounded-2xl p-3 pr-5 shadow-glass-lg"
            >
              <div className="flex size-9 items-center justify-center rounded-xl bg-accent/15 text-orange-600">
                <Target className="size-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-bold text-ink dark:text-white">Budget 62% used</p>
                <p className="text-[11px] text-slate-400">Stay under GH₵600</p>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="glass-strong absolute -right-4 bottom-8 flex items-center gap-3 rounded-2xl p-3 pr-5 shadow-glass-lg"
            >
              <div className="flex size-9 items-center justify-center rounded-xl bg-secondary/15 text-secondary-dark">
                <PiggyBank className="size-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-bold text-ink dark:text-white">Saved GH₵320 this month</p>
                <p className="text-[11px] text-slate-400">Emergency fund growing</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass grid grid-cols-2 gap-6 rounded-3xl p-8 md:grid-cols-4"
        >
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-3xl font-extrabold text-gradient bg-gradient-to-r from-primary to-secondary md:text-4xl">
                {s.value}
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl scroll-mt-20 px-6 py-24">
        <SectionTitle
          center
          eyebrow="Features"
          title="Everything you need to stay in control"
          subtitle="BetGuard combines powerful analytics with gentle, human-centred support so healthier habits actually stick."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                whileHover={{ y: -6 }}
                className="glass group rounded-2xl p-7"
              >
                <div
                  className={`flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br ${f.gradient} text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                >
                  <Icon className="size-6" aria-hidden="true" />
                </div>
                <h3 className="mt-5 font-display text-lg font-bold text-ink dark:text-white">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {f.text}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-7xl scroll-mt-20 px-6 py-24">
        <SectionTitle
          center
          eyebrow="How it works"
          title="Three steps to a healthier relationship with betting"
          subtitle="No lectures, no judgement — just clear numbers and steady progress."
        />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="glass relative overflow-hidden rounded-2xl p-7"
            >
              <span className="pointer-events-none absolute -right-4 -top-6 font-display text-[7rem] font-extrabold text-slate-900/[0.04] dark:text-white/[0.05]">
                {s.step}
              </span>
              <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-light font-display text-sm font-bold text-white shadow-lg shadow-primary/25">
                {s.step}
              </div>
              <h3 className="mt-5 font-display text-lg font-bold text-ink dark:text-white">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{s.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="mx-auto max-w-7xl scroll-mt-20 px-6 py-24">
        <SectionTitle
          center
          eyebrow="Stories"
          title="Real people, real change"
          subtitle="Hear from users across Ghana who took back control of their money."
        />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="glass flex flex-col rounded-2xl p-7"
            >
              <div className="flex gap-1 text-accent" aria-label={`${t.stars} out of 5 stars`}>
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className={`size-4 ${j < t.stars ? 'fill-accent' : 'opacity-30'}`} />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                "{t.text}"
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary font-display text-xs font-bold text-white">
                  {t.name.split(' ').map((p) => p[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-bold text-ink dark:text-white">{t.name}</p>
                  <p className="text-xs text-slate-400">{t.role}</p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-primary-dark to-secondary p-10 text-center md:p-20"
        >
          <div className="pointer-events-none absolute -left-20 -top-20 size-72 rounded-full bg-white/[0.06] blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-24 -right-16 size-72 rounded-full bg-accent/10 blur-3xl" aria-hidden="true" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="font-display text-3xl font-extrabold leading-tight text-white md:text-5xl">
              Your future self will thank you.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/80 md:text-lg">
              Join thousands of Ghanaians building healthier betting habits. Free, private, and
              completely on your terms.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <Button to={startLink} size="lg" variant="accent" icon={<ArrowRight className="size-5" />}>
                Start Free Today
              </Button>
              <Button
                to="/risk-assessment"
                size="lg"
                variant="outline"
                className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                Take the risk quiz
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
