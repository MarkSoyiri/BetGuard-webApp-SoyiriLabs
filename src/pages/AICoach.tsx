import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, Send, Sparkles, User, HeartHandshake } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageTransition';
import { useBets } from '@/contexts/BetContext';
import { useBudget } from '@/contexts/BudgetContext';
import { useGoals } from '@/contexts/GoalContext';
import { useUser } from '@/contexts/UserContext';
import { usePersistedState } from '@/hooks/usePersistedState';
import { computeStats, budgetStatus, monthlySpending, budgetProgress } from '@/utils/stats';
import { formatGHS } from '@/utils/format';
import { AI_COACH_QUICK_QUESTIONS } from '@/data/sample';
import type { ChatMessage } from '@/types';
import { uid } from '@/utils/format';

interface CoachContext {
  monthSpent: number;
  budget: number;
  monthlyAvg: number;
  savingsTotal: number;
  winRate: number;
  name: string;
}

function buildReply(input: string, ctx: CoachContext): string {
  const q = input.toLowerCase();
  const { monthSpent, budget, monthlyAvg, savingsTotal, winRate, name } = ctx;
  const remaining = Math.max(0, budget - monthSpent);
  const status = budgetStatus(monthSpent, budget);

  if (q.includes('how much') || q.includes('spent') || q.includes('spending')) {
    return `So far this month you have placed bets totalling ${formatGHS(monthSpent)}. That leaves ${formatGHS(remaining)} of your ${formatGHS(budget)} budget. Your monthly average over the past 8 weeks is ${formatGHS(monthlyAvg)}.`;
  }
  if (q.includes('afford') || q.includes('keep betting') || q.includes('can i bet') || q.includes('should i bet')) {
    if (status === 'critical' || status === 'warning') {
      return `Honestly? Now is the best time to pause. You have used ${budgetProgress(monthSpent, budget)}% of your budget and the risk of chasing losses is high. Take a break — it is the strongest move you can make.`;
    }
    return `You are ${budgetProgress(monthSpent, budget)}% through your monthly budget with ${formatGHS(remaining)} left. If a bet is planned and affordable, keep it small — but remember, staying under budget feels better than any win.`;
  }
  if (q.includes('reduce') || q.includes('cut') || q.includes('save') || q.includes('tips') || q.includes('less')) {
    const potential = Math.round(monthSpent * 0.3);
    return `Reducing your betting by 30% could save roughly ${formatGHS(potential)} a month — that is ${formatGHS(potential * 12)} a year. Try three things: log every bet, set a hard daily cap, and move the saved money into a savings goal instantly. Your current savings total is ${formatGHS(savingsTotal)}.`;
  }
  if (q.includes('loss') || q.includes('lost') || q.includes('upset') || q.includes('chase')) {
    return `I am sorry — losses sting. Whatever you do, do not chase them. The math is unforgiving: doubling up to recover loses quickly. Take a breath, close the app, and do something that does not cost money. Your win rate is ${Math.round(winRate)}%, and that is completely normal.`;
  }
  if (q.includes('budget') || q.includes('limit') || q.includes('plan')) {
    return `A healthy budget is what you can afford to lose without stress — a good rule of thumb is no more than 10–20% of discretionary income. You are currently at ${formatGHS(monthSpent)} against a ${formatGHS(budget)} monthly limit. We can adjust it anytime on the Budget page.`;
  }
  if (q.includes('habit') || q.includes('help') || q.includes('addict')) {
    return `Thank you for asking, ${name.split(' ')[0]}. Awareness is the first victory. Keep logging every bet, complete the risk assessment, and read the "Understanding Gambling Addiction" article in the Education Center. You are not alone — and support is always available.`;
  }
  if (q.includes('hi') || q.includes('hello') || q.includes('hey')) {
    return `Hi ${name.split(' ')[0]}! I have been watching your numbers — you have spent ${formatGHS(monthSpent)} this month. What would you like to talk about?`;
  }
  const defaultReplies = [
    `You've spent ${formatGHS(monthSpent)} this month against a ${formatGHS(budget)} budget — that is ${budgetProgress(monthSpent, budget)}% of your limit. Solid awareness is half the battle.`,
    `Reducing betting by 30% could save you about ${formatGHS(Math.round(monthSpent * 0.3))} monthly. Imagine what that could build.`,
    `You're maintaining a healthy level of tracking. Consistency is what changes habits. Keep going.`,
    `Remember: judge success by your net balance, not by how many bets you won. Your win rate is ${Math.round(winRate)}% — the bookmaker's margin is always there.`,
    `You exceeded your average pace this week. It happens. Reset tomorrow and stick to your limits.`,
  ];
  return defaultReplies[Math.floor(Math.random() * defaultReplies.length)];
}

function TypingDots() {
  return (
    <div className="flex gap-1 px-1 py-1.5" aria-label="Coach is typing">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-2 rounded-full bg-slate-400"
          animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

export function AICoach() {
  const { bets } = useBets();
  const { monthlyBudget } = useBudget();
  const { goals } = useGoals();
  const { profile } = useUser();

  const stats = useMemo(() => computeStats(bets), [bets]);
  const monthSpent = useMemo(() => monthlySpending(bets), [bets]);
  const monthlyAvg = useMemo(() => {
    const now = new Date();
    const recent = bets.filter((b) => {
      const d = new Date(b.date);
      return now.getTime() - d.getTime() < 56 * 86400000;
    });
    return recent.reduce((s, b) => s + b.amount, 0) / 2;
  }, [bets]);
  const savingsTotal = useMemo(() => goals.reduce((s, g) => s + g.current, 0), [goals]);

  const [messages, setMessages] = usePersistedState<ChatMessage[]>('chat', [
    {
      id: uid('msg'),
      role: 'coach',
      text: `Hi ${profile?.name?.split(' ')[0] ?? 'there'}! I'm your BetGuard coach. Ask me anything about your spending, budget, or habits — I'm here to keep you on track.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const send = (text: string) => {
    const clean = text.trim();
    if (!clean || typing) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { id: uid('msg'), role: 'user', text: clean, time: now }]);
    setInput('');
    setTyping(true);
    const ctx: CoachContext = {
      monthSpent,
      budget: monthlyBudget,
      monthlyAvg,
      savingsTotal,
      winRate: stats.winRate,
      name: profile?.name ?? 'friend',
    };
    setTimeout(() => {
      const reply = buildReply(clean, ctx);
      setMessages((prev) => [
        ...prev,
        { id: uid('msg'), role: 'coach', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ]);
      setTyping(false);
    }, 900 + Math.random() * 700);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="AI Coach"
        subtitle="A supportive coach that understands your numbers — no judgement, just clarity."
      />

      <div className="glass flex h-[68vh] min-h-[480px] flex-col overflow-hidden rounded-3xl">
        <div className="flex items-center gap-3 border-b border-slate-200/60 bg-gradient-to-r from-primary/[0.06] to-secondary/[0.06] px-6 py-4 dark:border-slate-700/60">
          <div className="relative">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-lg shadow-primary/30">
              <Bot className="size-6" aria-hidden="true" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-secondary ring-2 ring-white dark:ring-slate-900" />
          </div>
          <div>
            <p className="font-display text-sm font-bold text-ink dark:text-white">BetGuard Coach</p>
            <p className="flex items-center gap-1.5 text-xs text-secondary-dark dark:text-secondary">
              <Sparkles className="size-3" aria-hidden="true" /> Always in your corner
            </p>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-6 md:px-6">
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                className={`flex items-end gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                    m.role === 'user'
                      ? 'bg-gradient-to-br from-primary to-primary-light text-white'
                      : 'bg-gradient-to-br from-secondary to-emerald-600 text-white'
                  }`}
                >
                  {m.role === 'user' ? <User className="size-4" aria-hidden="true" /> : <Bot className="size-4" aria-hidden="true" />}
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    m.role === 'user'
                      ? 'rounded-br-md bg-gradient-to-br from-primary to-primary-light text-white'
                      : 'glass rounded-bl-md text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {m.text}
                  <span
                    className={`mt-1.5 block text-right text-[10px] ${
                      m.role === 'user' ? 'text-white/70' : 'text-slate-400'
                    }`}
                  >
                    {m.time}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {typing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-end gap-2.5"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-emerald-600 text-white">
                <Bot className="size-4" aria-hidden="true" />
              </div>
              <div className="glass rounded-2xl rounded-bl-md px-4 py-3">
                <TypingDots />
              </div>
            </motion.div>
          )}
          <div ref={endRef} />
        </div>

        <div className="border-t border-slate-200/60 p-4 dark:border-slate-700/60">
          <div className="mb-3 flex flex-wrap gap-2">
            {AI_COACH_QUICK_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                disabled={typing}
                className="rounded-full border border-slate-200 bg-white/60 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-secondary hover:bg-secondary/10 hover:text-secondary-dark disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300"
              >
                {q}
              </button>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your coach anything…"
              className="flex-1 rounded-xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-ink placeholder-slate-400 outline-none transition focus:border-secondary focus:ring-4 focus:ring-secondary/15 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
              aria-label="Message your coach"
            />
            <button
              type="submit"
              disabled={!input.trim() || typing}
              className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-secondary to-emerald-600 text-white shadow-lg shadow-secondary/30 transition hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
              aria-label="Send message"
            >
              <Send className="size-5" aria-hidden="true" />
            </button>
          </form>
          <p className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-400">
            <HeartHandshake className="size-3.5" aria-hidden="true" />
            BetGuard Coach provides general guidance for a responsible-betting proof of concept and is not a substitute for professional help.
          </p>
        </div>
      </div>
    </div>
  );
}
