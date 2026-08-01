import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  BookOpen,
  Brain,
  Wallet,
  Dices,
  PiggyBank,
  Heart,
  BarChart3,
  Clock,
  CheckCircle2,
  XCircle,
  Trophy,
  type LucideIcon,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageTransition';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Chip } from '@/components/ui/Badge';
import { sampleArticles, quizQuestions } from '@/data/sample';
import type { Article } from '@/types';
import { useToast } from '@/contexts/ToastContext';
import { useAchievements } from '@/contexts/AchievementContext';
import { useChallenges } from '@/contexts/ChallengeContext';

const ICONS: Record<string, LucideIcon> = {
  brain: Brain,
  wallet: Wallet,
  dice: Dices,
  piggy: PiggyBank,
  heart: Heart,
  chart: BarChart3,
};

export function Education() {
  const { toast } = useToast();
  const { addAchievement } = useAchievements();
  const { recordArticleRead, recordQuizScore } = useChallenges();

  const [selected, setSelected] = useState<Article | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(quizQuestions.length).fill(null));
  const [submitted, setSubmitted] = useState(false);

  const score = useMemo(
    () => answers.reduce<number>((s, a, i) => s + (a === quizQuestions[i].correct ? 1 : 0), 0),
    [answers],
  );
  const passed = score >= quizQuestions.length * 0.7;
  const allAnswered = answers.every((a) => a !== null);

  const submitQuiz = () => {
    setSubmitted(true);
    recordQuizScore((score / quizQuestions.length) * 100);
    if (passed) {
      addAchievement('Financial Literacy', 'Scored 70%+ on the Education quiz.');
      toast(`Quiz complete! You scored ${score}/${quizQuestions.length}. Badge awarded!`);
    } else {
      toast(`Quiz complete. You scored ${score}/${quizQuestions.length}. Keep learning!`, 'info');
    }
  };

  const resetQuiz = () => {
    setAnswers(Array(quizQuestions.length).fill(null));
    setSubmitted(false);
  };

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Education Center"
        subtitle="Short, practical lessons to sharpen your financial mind and protect your wellbeing."
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {sampleArticles().map((article, i) => {
          const Icon = ICONS[article.icon] ?? BookOpen;
          return (
            <motion.button
              key={article.id}
              onClick={() => {
                recordArticleRead(article.id);
                setSelected(article);
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -6 }}
              className="glass group rounded-2xl p-6 text-left"
            >
              <div
                className={`flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br ${article.gradient} text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
              >
                <Icon className="size-6" aria-hidden="true" />
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Chip tone="primary">{article.category}</Chip>
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock className="size-3" aria-hidden="true" /> {article.readTime}
                </span>
              </div>
              <h3 className="mt-3 font-display text-lg font-bold text-ink transition-colors group-hover:text-primary dark:text-white dark:group-hover:text-primary-light">
                {article.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                {article.excerpt}
              </p>
            </motion.button>
          );
        })}
      </div>

      <GlassCard className="mt-10 overflow-hidden">
        <div className="border-b border-slate-200/60 bg-gradient-to-r from-primary/[0.05] to-secondary/[0.05] p-8 dark:border-slate-700/60">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-orange-500 text-ink shadow-lg shadow-accent/30">
              <Trophy className="size-7" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-xl font-bold text-ink dark:text-white">
                Test your knowledge
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Answer the {quizQuestions.length} questions. Score {Math.round(quizQuestions.length * 0.7)}+ to earn the
                Financial Literacy badge.
              </p>
            </div>
            {submitted && (
              <div className="text-center">
                <p className="font-display text-3xl font-bold text-ink dark:text-white">
                  {score}/{quizQuestions.length}
                </p>
                <Chip tone={passed ? 'secondary' : 'warning'}>{passed ? 'Passed!' : 'Keep trying'}</Chip>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8 p-8">
          {quizQuestions.map((q, qi) => {
            const picked = answers[qi];
            const isCorrect = picked === q.correct;
            return (
              <div key={qi}>
                <p className="mb-3 font-semibold text-ink dark:text-white">
                  <span className="mr-2 text-slate-400">{qi + 1}.</span>
                  {q.question}
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {q.options.map((opt, oi) => {
                    let style =
                      'border-slate-200 bg-white/60 hover:border-primary-light dark:border-slate-700 dark:bg-slate-800/40';
                    if (submitted) {
                      if (oi === q.correct) style = 'border-secondary bg-secondary/10 text-secondary-dark dark:text-secondary';
                      else if (oi === picked) style = 'border-danger bg-danger/10 text-danger';
                      else style = 'border-slate-200 opacity-50 dark:border-slate-700';
                    } else if (picked === oi) {
                      style = 'border-primary bg-primary/10 text-primary dark:border-primary-light dark:text-primary-light';
                    }
                    return (
                      <button
                        key={oi}
                        disabled={submitted}
                        onClick={() => setAnswers((prev) => prev.map((a, i) => (i === qi ? oi : a)))}
                        className={`flex items-center justify-between rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all disabled:cursor-default ${style}`}
                      >
                        <span>{opt}</span>
                        {submitted && oi === q.correct && (
                          <CheckCircle2 className="size-4 shrink-0 text-secondary" aria-hidden="true" />
                        )}
                        {submitted && oi === picked && !isCorrect && (
                          <XCircle className="size-4 shrink-0 text-danger" aria-hidden="true" />
                        )}
                      </button>
                    );
                  })}
                </div>
                {submitted && (
                  <p className="mt-2.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    <span className="font-bold text-secondary-dark dark:text-secondary">Why? </span>
                    {q.explanation}
                  </p>
                )}
              </div>
            );
          })}
          <div className="flex flex-wrap gap-3 border-t border-slate-200/60 pt-6 dark:border-slate-700/60">
            <Button
              onClick={submitQuiz}
              disabled={!allAnswered || submitted}
              variant={submitted ? 'ghost' : 'primary'}
              icon={!submitted ? <GraduationCap className="size-4" aria-hidden="true" /> : undefined}
            >
              {submitted ? 'Quiz complete' : allAnswered ? 'Submit quiz' : `Answer all questions (${answers.filter(Boolean).length}/${quizQuestions.length})`}
            </Button>
            {submitted && (
              <Button onClick={resetQuiz} variant="outline">
                Retake quiz
              </Button>
            )}
          </div>
        </div>
      </GlassCard>

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.title}
        subtitle={`${selected?.category} · ${selected?.readTime}`}
        size="lg"
      >
        <div className="space-y-6">
          {selected?.sections.map((s) => (
            <div key={s.heading}>
              <h4 className="mb-2 font-display text-base font-bold text-ink dark:text-white">
                {s.heading}
              </h4>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{s.body}</p>
            </div>
          ))}
          <div className="rounded-2xl bg-secondary/10 p-4">
            <p className="flex items-start gap-2 text-sm text-secondary-dark dark:text-secondary">
              <BookOpen className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              Complete the quiz below to earn the Financial Literacy badge for this category.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
