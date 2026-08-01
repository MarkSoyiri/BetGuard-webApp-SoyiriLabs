import type {
  Achievement,
  AppNotification,
  Article,
  BetRecord,
  Challenge,
  CommunityPost,
  GreenProject,
  SavingsGoal,
} from '@/types';
import { daysAgoISO } from '@/utils/format';

export const PLATFORMS = ['Platform A', 'Platform B', 'Platform C'] as const;
export const SPORTS = ['Football', 'Basketball', 'Tennis'] as const;

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateDemoBets(): BetRecord[] {
  const rand = mulberry32(20260731);
  const bets: BetRecord[] = [];
  for (let d = 70; d >= 0; d -= 1) {
    const perDay = rand() < 0.45 ? 0 : rand() < 0.7 ? 1 : 2;
    for (let i = 0; i < perDay; i += 1) {
      const platform = PLATFORMS[Math.floor(rand() * PLATFORMS.length)];
      const sport = SPORTS[Math.floor(rand() * SPORTS.length)];
      const amount = Math.round((5 + rand() * 195 + (i === 1 ? 30 : 0)) / 5) * 5;
      const outcome = rand() < 0.42 ? 'won' : 'lost';
      bets.push({
        id: `demo-${d}-${i}`,
        date: daysAgoISO(d),
        platform,
        sport,
        amount,
        outcome,
        notes: outcome === 'won' ? 'Felt lucky, got a nice win.' : 'Slipped up, chasing a loss.',
      });
    }
  }
  return bets.sort((a, b) => b.date.localeCompare(a.date));
}

export function sampleGoals(): SavingsGoal[] {
  const now = new Date();
  const deadline = (days: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  };
  return [
    { id: 'goal-emergency', name: 'Emergency Fund', target: 5000, current: 3200, deadline: deadline(120), createdAt: daysAgoISO(40) },
    { id: 'goal-phone', name: 'New Phone', target: 3500, current: 1250, deadline: deadline(90), createdAt: daysAgoISO(60) },
    { id: 'goal-trip', name: 'Weekend Trip to Cape Coast', target: 1800, current: 600, deadline: deadline(45), createdAt: daysAgoISO(25) },
  ];
}

export function sampleChallenges(): Challenge[] {
  return [
    { id: 'ch-no-bet', title: 'No Bet Today', description: 'Enjoy a full day without placing any bet.', frequency: 'Daily', target: 1, progress: 1, unit: 'day', reward: 'Fresh Start Badge', completed: true, claimed: false },
    { id: 'ch-save-20', title: 'Save GH₵20', description: 'Transfer GH₵20 to a savings goal instead of betting.', frequency: 'Daily', target: 1, progress: 0, unit: 'deposit', reward: 'Penny Saver Badge', completed: false, claimed: false },
    { id: 'ch-track-week', title: 'Track Every Bet', description: 'Log every single bet you place for one week.', frequency: 'Weekly', target: 7, progress: 4, unit: 'days tracked', reward: 'Discipline Badge', completed: false, claimed: false },
    { id: 'ch-7-day', title: '7-Day Challenge', description: 'No bets for 7 consecutive days.', frequency: 'Weekly', target: 7, progress: 3, unit: 'days', reward: 'Week Warrior Badge', completed: false, claimed: false },
    { id: 'ch-lower-30', title: 'Cut Spending 30%', description: 'Spend 30% less on betting this month.', frequency: 'Monthly', target: 30, progress: 18, unit: '% reduced', reward: 'Money Master Badge', completed: false, claimed: false },
    { id: 'ch-30-day', title: '30-Day Challenge', description: 'A whole month of healthy betting habits.', frequency: 'Monthly', target: 30, progress: 11, unit: 'days', reward: 'Guardian Badge', completed: false, claimed: false },
    { id: 'ch-green-tree', title: 'Plant a Tree', description: 'Plant a tree in your community or garden.', frequency: 'Weekly', target: 1, progress: 0, unit: 'tree', reward: 'Tree Planter', completed: false, claimed: false, category: 'environmental', points: 40 },
    { id: 'ch-green-recycle', title: 'Recycle for Seven Days', description: 'Sort and recycle your waste for seven consecutive days.', frequency: 'Weekly', target: 7, progress: 0, unit: 'days', reward: 'Recycler', completed: false, claimed: false, category: 'environmental', points: 60 },
    { id: 'ch-green-water', title: 'Save Water', description: 'Keep showers short and fix that leaking tap.', frequency: 'Daily', target: 1, progress: 0, unit: 'day', reward: 'Water Saver', completed: false, claimed: false, category: 'environmental', points: 20 },
    { id: 'ch-green-walk', title: 'Walk Instead of Drive', description: 'Walk or cycle five short trips instead of driving.', frequency: 'Weekly', target: 5, progress: 0, unit: 'trips', reward: 'Eco Walker', completed: false, claimed: false, category: 'environmental', points: 40 },
    { id: 'ch-green-cleanup', title: 'Community Clean-up', description: 'Join or organise a clean-up of a local park or beach.', frequency: 'Monthly', target: 1, progress: 0, unit: 'clean-up', reward: 'Clean-up Hero', completed: false, claimed: false, category: 'environmental', points: 80 },
    { id: 'ch-green-garden', title: 'Start a Home Garden', description: 'Start a small herb or vegetable garden at home.', frequency: 'Monthly', target: 1, progress: 0, unit: 'garden', reward: 'Home Gardener', completed: false, claimed: false, category: 'environmental', points: 80 },
  ];
}

export function sampleAchievements(): Achievement[] {
  return [
    { id: 'ach-first-week', title: 'First Week Completed', description: 'Logged your betting activity for a full week.', icon: 'calendar', tier: 'bronze', unlocked: true, unlockedAt: daysAgoISO(20) },
    { id: 'ach-budget', title: 'Stayed Within Budget', description: 'Kept your spending inside your monthly budget.', icon: 'wallet', tier: 'bronze', unlocked: true, unlockedAt: daysAgoISO(12) },
    { id: 'ach-lit', title: 'Financial Literacy', description: 'Completed the Financial Literacy article.', icon: 'book', tier: 'bronze', unlocked: true, unlockedAt: daysAgoISO(9) },
    { id: 'ach-risk', title: 'Risk Assessment', description: 'Completed your first risk assessment.', icon: 'activity', tier: 'bronze', unlocked: true, unlockedAt: daysAgoISO(15) },
    { id: 'ach-save-100', title: 'Saved GH₵100', description: 'Moved GH₵100 from betting to savings.', icon: 'piggy', tier: 'silver', unlocked: true, unlockedAt: daysAgoISO(7) },
    { id: 'ach-7-day', title: '7-Day Streak', description: 'Completed the 7-Day Challenge.', icon: 'flame', tier: 'silver', unlocked: false },
    { id: 'ach-challenger', title: 'Challenge Champion', description: 'Completed any 5 challenges.', icon: 'trophy', tier: 'silver', unlocked: false },
    { id: 'ach-coach', title: 'Coach Companion', description: 'Asked the AI Coach 10 questions.', icon: 'sparkles', tier: 'silver', unlocked: false },
    { id: 'ach-30-day', title: '30-Day Champion', description: 'Completed the 30-Day Challenge.', icon: 'crown', tier: 'gold', unlocked: false },
    { id: 'ach-low-risk', title: 'Low-Risk Lifestyle', description: 'Maintained a low risk score for 3 months.', icon: 'shield', tier: 'gold', unlocked: false },
    { id: 'ach-zero-week', title: 'Bet-Free Month', description: 'No bets placed for an entire month.', icon: 'award', tier: 'gold', unlocked: false },
    { id: 'ach-green-bronze', title: 'Bronze Environmental Supporter', description: 'Made your first green contribution.', icon: 'leaf', tier: 'bronze', unlocked: false, category: 'green' },
    { id: 'ach-green-silver', title: 'Silver Environmental Supporter', description: 'Reached 10 green contributions.', icon: 'leaf', tier: 'silver', unlocked: false, category: 'green' },
    { id: 'ach-green-gold', title: 'Gold Environmental Supporter', description: 'Reached 25 green contributions.', icon: 'leaf', tier: 'gold', unlocked: false, category: 'green' },
    { id: 'ach-eco-warrior', title: 'Eco Warrior', description: 'Put GH₵200+ into green projects.', icon: 'shield', tier: 'silver', unlocked: false, category: 'green' },
    { id: 'ach-sustainability', title: 'Sustainability Champion', description: 'Reached a Green Score of 90+.', icon: 'crown', tier: 'gold', unlocked: false, category: 'green' },
  ];
}

export function sampleGreenProjects(): GreenProject[] {
  return [
    {
      id: 'proj-tree',
      name: 'National Tree Planting Campaign',
      icon: 'tree',
      description: 'Funds the planting and care of native trees across Ghana to restore forests and fight desertification.',
      sdg: 'Forests & Land',
      target: 2000,
      raised: 1450,
      supporters: 86,
      status: 'active',
      gradient: 'from-emerald-500 to-green-700',
    },
    {
      id: 'proj-recycle',
      name: 'Plastic Recycling Initiative',
      icon: 'recycle',
      description: 'Builds collection points and recycling hubs that keep plastic waste out of our rivers and oceans.',
      sdg: 'Green Cities',
      target: 3000,
      raised: 2100,
      supporters: 64,
      status: 'active',
      gradient: 'from-sky-500 to-cyan-700',
    },
    {
      id: 'proj-water',
      name: 'Clean Water Project',
      icon: 'droplet',
      description: 'Drills boreholes and installs filters so communities have safe, clean drinking water.',
      sdg: 'Clean Water',
      target: 5000,
      raised: 1800,
      supporters: 41,
      status: 'active',
      gradient: 'from-blue-500 to-indigo-700',
    },
    {
      id: 'proj-education',
      name: 'Environmental Education Programme',
      icon: 'school',
      description: 'Teaches students and families about conservation, waste sorting and sustainable living.',
      sdg: 'Climate Action',
      target: 1500,
      raised: 520,
      supporters: 22,
      status: 'active',
      gradient: 'from-amber-500 to-orange-700',
    },
    {
      id: 'proj-parks',
      name: 'Urban Green Parks',
      icon: 'tree-deciduous',
      description: 'Creates shade, cooling and green space in city neighbourhoods by planting community parks.',
      sdg: 'Green Cities',
      target: 2500,
      raised: 900,
      supporters: 37,
      status: 'active',
      gradient: 'from-lime-500 to-emerald-700',
    },
    {
      id: 'proj-climate',
      name: 'Climate Awareness Campaign',
      icon: 'earth',
      description: 'A public campaign making climate science simple and inspiring everyday eco action.',
      sdg: 'Climate Action',
      target: 1000,
      raised: 1000,
      supporters: 55,
      status: 'funded',
      gradient: 'from-violet-500 to-purple-700',
    },
  ];
}

export function sampleNotifications(): AppNotification[] {
  return [
    { id: 'nt-1', type: 'achievement', title: 'Badge unlocked!', message: 'You earned the "Stayed Within Budget" badge. Keep going!', date: daysAgoISO(0), read: false },
    { id: 'nt-2', type: 'warning', title: 'Budget alert', message: "You've used 80% of your monthly budget. Consider easing off.", date: daysAgoISO(1), read: false },
    { id: 'nt-3', type: 'reminder', title: 'Challenge reminder', message: 'Your "Track Every Bet" challenge continues today. Log your activity.', date: daysAgoISO(1), read: false },
    { id: 'nt-4', type: 'info', title: 'New article', message: '"Understanding Gambling Addiction" is now available in the Education Center.', date: daysAgoISO(2), read: true },
    { id: 'nt-5', type: 'success', title: 'Savings milestone', message: 'You reached 50% of your Emergency Fund goal. Excellent work!', date: daysAgoISO(3), read: true },
    { id: 'nt-6', type: 'reminder', title: 'Weekly review', message: 'Take 2 minutes to review your weekly spending trends.', date: daysAgoISO(4), read: true },
  ];
}

export function samplePosts(): CommunityPost[] {
  return [
    {
      id: 'post-1',
      author: 'Kofi A.',
      title: 'Day 21 of tracking every bet — here is what changed',
      content:
        'Three weeks ago I started logging every single bet. Seeing the totals add up in real time has completely changed my mindset. I have cut my spending by half without even feeling like I am missing out.',
      tag: 'Success Story',
      likes: 48,
      liked: false,
      date: daysAgoISO(1),
      comments: [
        { id: 'c1', author: 'Ama O.', content: 'This is so inspiring. Keep going!', date: daysAgoISO(1) },
        { id: 'c2', author: 'Yaw B.', content: 'Same here — the numbers are a wake-up call.', date: daysAgoISO(1) },
      ],
    },
    {
      id: 'post-2',
      author: 'Efua M.',
      title: 'How I stopped chasing losses',
      content:
        'I used to double my bet after every loss to "win it back". A friend shared the probability math with me and it finally clicked. Chasing losses never pays off. Stay calm and walk away.',
      tag: 'Support',
      likes: 32,
      liked: false,
      date: daysAgoISO(2),
      comments: [{ id: 'c3', author: 'Kofi A.', content: 'The probability article here is brilliant.', date: daysAgoISO(2) }],
    },
    {
      id: 'post-3',
      author: 'Nana K.',
      title: 'Set my first savings goal today',
      content:
        'Moved the money I would have bet on football tonight into my new phone savings goal. Feels better than any accumulator I have ever placed.',
      tag: 'Milestone',
      likes: 21,
      liked: false,
      date: daysAgoISO(3),
      comments: [],
    },
    {
      id: 'post-4',
      author: 'Akosua D.',
      title: 'Anyone else using the weekly challenge?',
      content:
        'The "Track Every Bet" challenge has been a game changer for me. The reminders actually keep me honest. Would love to hear how others are doing!',
      tag: 'Discussion',
      likes: 15,
      liked: false,
      date: daysAgoISO(4),
      comments: [{ id: 'c4', author: 'Efua M.', content: 'On day 5 here, going strong!', date: daysAgoISO(3) }],
    },
  ];
}

export function sampleArticles(): Article[] {
  return [
    {
      id: 'art-addiction',
      title: 'Understanding Gambling Addiction',
      category: 'Addiction Awareness',
      excerpt: 'Learn what gambling addiction is, how it develops, and the warning signs to watch for.',
      readTime: '6 min read',
      icon: 'brain',
      gradient: 'from-primary to-indigo-700',
      sections: [
        { heading: 'What is gambling addiction?', body: 'Gambling addiction, also known as problem gambling, is a behavioural disorder where a person cannot control their urge to bet, even when it causes serious harm to their finances, relationships, or mental health. It is often driven by the unpredictable nature of wins and losses, which keeps the brain chasing the next reward.' },
        { heading: 'How it develops', body: 'It rarely happens overnight. It starts with occasional bets, then builds as the excitement and occasional wins reinforce the behaviour. Losses create a strong urge to "win it back", which is exactly how many people spiral. Being aware of this pattern is the first line of defence.' },
        { heading: 'Warning signs', body: 'Betting more than you can afford, borrowing money to bet, hiding betting activity from loved ones, feeling restless or irritable when not betting, and lying about time or money spent are all common signs. If you notice several of these, it is worth reaching out for support.' },
      ],
    },
    {
      id: 'art-finance',
      title: 'Financial Literacy Basics',
      category: 'Finance',
      excerpt: 'Master budgeting, saving, and building healthy money habits that last.',
      readTime: '5 min read',
      icon: 'wallet',
      gradient: 'from-secondary to-emerald-700',
      sections: [
        { heading: 'The 50/30/20 rule', body: 'A simple framework: 50% of your income goes to needs, 30% to wants, and 20% to savings and debt repayment. Applying this rule makes it easier to see exactly how much of your income should be reserved for leisure activities like betting.' },
        { heading: 'Track before you cut', body: 'You cannot manage what you do not measure. For one month, write down every single cedi you spend. BetGuard makes this easy — the results are often surprising and become the motivation to change.' },
        { heading: 'Build an emergency fund', body: 'Aim to save at least 3 months of essential expenses. This cushion protects you from the urge to gamble when money gets tight, and reduces financial stress that often drives risky decisions.' },
      ],
    },
    {
      id: 'art-probability',
      title: 'Probability Explained',
      category: 'Education',
      excerpt: 'Why bookmakers always win, and what odds actually mean for your money.',
      readTime: '7 min read',
      icon: 'dice',
      gradient: 'from-accent to-orange-500',
      sections: [
        { heading: 'Odds tell you the price, not the outcome', body: 'If a team has odds of 2.00, that only means the bookmaker believes there is roughly a 50% chance of that outcome — and the price already includes a built-in margin. The real probability is almost always lower than the odds suggest.' },
        { heading: 'The house always has an edge', body: 'Bookmakers build a margin into every market. Over thousands of bets, this margin guarantees they profit overall, regardless of who wins individual matches. No strategy, system, or accumulator can remove that edge.' },
        { heading: 'The martingale myth', body: 'Doubling your bet after a loss to "recover" sounds clever but breaks quickly: the stakes grow exponentially and you will eventually hit a limit — your budget, the bookmaker, or reality. You risk GH₵100 to win GH₵5.' },
      ],
    },
    {
      id: 'art-money',
      title: 'Managing Money Wisely',
      category: 'Finance',
      excerpt: 'Practical tips to keep your finances healthy in a world full of temptations.',
      readTime: '5 min read',
      icon: 'piggy',
      gradient: 'from-rose-500 to-danger',
      sections: [
        { heading: 'Pay yourself first', body: 'Set up an automatic transfer to savings the moment your salary lands. When the money is gone before you see it, the temptation to bet it never arises.' },
        { heading: 'Use the 24-hour rule', body: 'When you feel the urge to place an impulsive bet, wait 24 hours. Most urges pass. Write down what you wanted to bet and why — self-awareness weakens impulsivity.' },
        { heading: 'Set firm limits', body: 'Decide in advance how much you can responsibly afford to lose, not win. Treat it as the price of entertainment, like a cinema ticket. Never exceed that amount, no matter what.' },
      ],
    },
    {
      id: 'art-mental',
      title: 'Mental Health & Betting',
      category: 'Wellbeing',
      excerpt: 'Understand the emotional loop of betting and protect your mental wellbeing.',
      readTime: '6 min read',
      icon: 'heart',
      gradient: 'from-violet-600 to-primary',
      sections: [
        { heading: 'The emotional rollercoaster', body: 'Betting triggers big swings of dopamine — excitement on a win, anxiety on a loss, and a desperate urge to recover. These swings are exhausting and can feed anxiety and depression over time.' },
        { heading: 'Stress and decision-making', body: 'When we are stressed, we make worse decisions. The urge to bet often spikes during difficult periods, creating a painful cycle: stress leads to betting, betting leads to more stress. Breaking the cycle starts with noticing it.' },
        { heading: 'Healthy alternatives', body: 'Replace betting with activities that produce real, sustainable rewards: exercise, hobbies, time with friends, or reading. The feeling is different — slower but far more satisfying — and it compounds.' },
      ],
    },
    {
      id: 'art-stats',
      title: 'Reading Your Own Numbers',
      category: 'Education',
      excerpt: 'How to use your BetGuard statistics to spot patterns before they become problems.',
      readTime: '4 min read',
      icon: 'chart',
      gradient: 'from-sky-500 to-secondary',
      sections: [
        { heading: 'Trends matter more than events', body: 'A single bad weekend is not a crisis, but a rising three-month trend is a signal. Review your Statistics page monthly and look at the direction of spending, not individual bets.' },
        { heading: 'Watch the win-rate trap', body: 'A 45% win rate sounds decent, but because payouts are lower than the true odds, you can win often and still lose money. Judge success by your net balance, not how many bets you won.' },
        { heading: 'Set review milestones', body: 'Schedule a 10-minute monthly review with yourself. Compare your spending to your budget, check your risk trend, and decide whether your limits still feel right. Small reviews prevent big problems.' },
      ],
    },
  ];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export const quizQuestions: QuizQuestion[] = [
  {
    question: 'What is the most reliable predictor of long-term betting outcomes?',
    options: ['Team form', 'The bookmaker\u2019s margin', 'Betting systems', 'A lucky day'],
    correct: 1,
    explanation: 'Bookmakers build a margin into every market, so over the long run they always profit.',
  },
  {
    question: 'The 50/30/20 rule suggests what share of income for savings?',
    options: ['50%', '30%', '20%', '10%'],
    correct: 2,
    explanation: '20% of income goes to savings and debt repayment.',
  },
  {
    question: 'Which of these is a warning sign of problem gambling?',
    options: ['Betting on the weekend', 'Borrowing money to place bets', 'Following a favourite team', 'Using a monthly budget'],
    correct: 1,
    explanation: 'Borrowing money to gamble is a strong indicator of problem gambling.',
  },
  {
    question: 'Why does "doubling up to recover losses" fail?',
    options: ['It works if you are patient', 'Stakes grow exponentially and hit limits', 'Bookmakers dislike it', 'Wins are taxed'],
    correct: 1,
    explanation: 'Stakes double each loss, so you quickly reach the limit of your budget or the bookmaker.',
  },
  {
    question: 'A healthy reaction after exceeding your betting budget is to:',
    options: ['Chase losses to recover', 'Take a break and review your limits', 'Bet bigger next time', 'Hide the loss'],
    correct: 1,
    explanation: 'Stepping back and reviewing your budget is the healthiest response.',
  },
  {
    question: 'What should you judge your betting by?',
    options: ['Number of wins', 'Net money gained or lost', 'Excitement level', 'Odds of winning bets'],
    correct: 1,
    explanation: 'Your net balance tells you the true picture, not the win count.',
  },
];

export interface RiskQuestion {
  question: string;
  options: string[];
  weight: number;
}

export const riskQuestions: RiskQuestion[] = [
  {
    question: 'How often do you bet?',
    options: ['Never or rarely', 'A few times a month', 'Several times a week', 'Every day'],
    weight: 4,
  },
  {
    question: 'Have you ever chased a loss by betting more?',
    options: ['Never', 'Once or twice', 'Sometimes', 'Regularly'],
    weight: 4,
  },
  {
    question: 'Do you ever borrow money to place bets?',
    options: ['Never', 'Once', 'Occasionally', 'Often'],
    weight: 4,
  },
  {
    question: 'Do you feel stressed or anxious after betting?',
    options: ['Never', 'Rarely', 'Often', 'Almost always'],
    weight: 4,
  },
  {
    question: 'Do you bet more than you initially planned?',
    options: ['Never', 'Rarely', 'Often', 'Almost always'],
    weight: 4,
  },
  {
    question: 'Do you hide your betting activity from people close to you?',
    options: ['Never', 'Rarely', 'Sometimes', 'Frequently'],
    weight: 4,
  },
  {
    question: 'Does betting ever interfere with your work or studies?',
    options: ['Never', 'Rarely', 'Sometimes', 'Frequently'],
    weight: 4,
  },
  {
    question: 'How do you feel when you are unable to bet?',
    options: ['Relieved or indifferent', 'Slightly restless', 'Irritable', 'Strongly agitated'],
    weight: 4,
  },
];

export const AI_COACH_QUICK_QUESTIONS = [
  'How much have I spent this month?',
  'Can I afford to keep betting?',
  'Give me tips to reduce my spending',
  'What should I do after a big loss?',
  'How do I set a healthy budget?',
  'How is my betting helping the planet?',
];
