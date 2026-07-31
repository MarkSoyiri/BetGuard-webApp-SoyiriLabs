import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck, ArrowRight, RotateCcw } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageTransition';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { RiskCard } from '@/components/ui/RiskCard';
import { riskQuestions } from '@/data/sample';
import { assessRisk, riskColor } from '@/utils/stats';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/contexts/ToastContext';

const RECOMMENDATIONS: Record<string, string[]> = {
  Low: [
    'Continue tracking every bet — consistency keeps small problems from growing.',
    'Keep your monthly budget where it is and review it quarterly.',
    'Complete weekly challenges to build a healthy routine.',
  ],
  Medium: [
    'Consider lowering your monthly betting budget by at least 20%.',
    'Use the 24-hour rule before every bet to reduce impulsivity.',
    'Take the "7-Day Challenge" and aim for a betting-free week.',
    'Read "Understanding Gambling Addiction" in the Education Center.',
  ],
  High: [
    'We strongly recommend a betting pause of 30 days.',
    'Set a hard self-exclusion reminder with BetGuard alerts at 80% budget.',
    'Reach out to professional support — the National Hotline for Problem Gambling is available.',
    'Talk to someone you trust about your spending.',
  ],
};

export function RiskAssessment() {
  const { profile, updateProfile } = useUser();
  const { toast } = useToast();
  const [answers, setAnswers] = useState<number[]>(Array(riskQuestions.length).fill(-1));
  const [submitted, setSubmitted] = useState(profile?.riskLevel != null);

  const allAnswered = answers.every((a) => a >= 0);
  const result = useMemo(() => assessRisk(answers.map((a) => Math.max(0, a))), [answers]);
  const level = submitted && profile?.riskLevel ? profile.riskLevel : result.level;
  const score = submitted && profile?.riskLevel ? result.score : result.score;

  const submit = () => {
    if (!allAnswered) {
      toast('Please answer all questions before submitting.', 'error');
      return;
    }
    updateProfile({ riskLevel: result.level });
    setSubmitted(true);
    toast(`Assessment complete — your risk level is ${result.level}.`);
  };

  const reset = () => {
    setAnswers(Array(riskQuestions.length).fill(-1));
    setSubmitted(false);
    updateProfile({ riskLevel: null });
  };

  const color = riskColor(level);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Risk Assessment"
        subtitle="Answer honestly — this helps BetGuard tune its advice to where you are right now."
      />

      <GlassCard className="mb-6 overflow-hidden">
        <div className="border-b border-slate-200/60 bg-gradient-to-r from-primary/[0.05] to-secondary/[0.05] p-6 dark:border-slate-700/60">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-light text-white shadow-lg shadow-primary/30">
              <Activity className="size-6" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-ink dark:text-white">
                {submitted ? 'Your result' : 'The questionnaire'}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {submitted
                  ? 'You can retake this assessment at any time.'
                  : `${riskQuestions.length} quick questions · about 2 minutes`}
              </p>
            </div>
            {submitted && (
              <Button variant="ghost" size="sm" className="ml-auto" onClick={reset} icon={<RotateCcw className="size-3.5" aria-hidden="true" />}>
                Retake
              </Button>
            )}
          </div>
        </div>

        {submitted ? (
          <div className="p-8">
            <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
              <RiskCard level={level} score={score} compact />
              <div className="flex-1 space-y-4">
                <h4 className="font-display text-base font-bold text-ink dark:text-white">
                  Recommendations for you
                </h4>
                <ul className="space-y-3">
                  {RECOMMENDATIONS[level].map((r, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-start gap-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300"
                    >
                      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-white" style={{ background: color }}>
                        <ShieldCheck className="size-3.5" aria-hidden="true" />
                      </span>
                      {r}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-7 p-8">
            {riskQuestions.map((q, qi) => (
              <div key={qi}>
                <p className="mb-3 font-semibold text-ink dark:text-white">
                  <span className="mr-2 text-slate-400">{qi + 1}.</span>
                  {q.question}
                </p>
                <div className="flex flex-wrap gap-2">
                  {q.options.map((opt, oi) => {
                    const selectedIdx = answers[qi];
                    return (
                      <button
                        key={oi}
                        onClick={() => setAnswers((prev) => prev.map((a, i) => (i === qi ? oi : a)))}
                        className={`rounded-xl border-2 px-4 py-2 text-sm font-medium transition-all ${
                          selectedIdx === oi
                            ? 'border-primary bg-primary/10 text-primary dark:border-primary-light dark:text-primary-light'
                            : 'border-slate-200 bg-white/60 text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-400'
                        }`}
                        aria-pressed={selectedIdx === oi}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200/60 pt-6 dark:border-slate-700/60">
              <p className="text-sm text-slate-400">
                Answered {answers.filter((a) => a >= 0).length} of {riskQuestions.length}
              </p>
              <Button onClick={submit} disabled={!allAnswered} icon={<ArrowRight className="size-4" aria-hidden="true" />}>
                Calculate my risk
              </Button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
