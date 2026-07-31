import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCheck, Trash2, AlertTriangle, CheckCircle2, Info, Sparkles, Clock, type LucideIcon } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageTransition';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { useNotifications } from '@/contexts/NotificationContext';
import { useToast } from '@/contexts/ToastContext';
import { timeAgo } from '@/utils/format';
import type { NotificationType } from '@/types';

const TYPE_META: Record<NotificationType, { icon: LucideIcon; bg: string; text: string }> = {
  warning: { icon: AlertTriangle, bg: 'bg-warning/10', text: 'text-warning' },
  success: { icon: CheckCircle2, bg: 'bg-secondary/10', text: 'text-secondary' },
  info: { icon: Info, bg: 'bg-primary/10', text: 'text-primary-light' },
  achievement: { icon: Sparkles, bg: 'bg-accent/15', text: 'text-orange-600 dark:text-accent' },
  reminder: { icon: Clock, bg: 'bg-slate-100', text: 'text-slate-500 dark:text-slate-300' },
};

type Filter = 'All' | NotificationType;

export function NotificationsPage() {
  const { notifications, unreadCount, markRead, markAllRead, removeNotification, clearAll } =
    useNotifications();
  const { toast } = useToast();
  const [filter, setFilter] = useState<Filter>('All');
  const [confirming, setConfirming] = useState(false);

  const filtered = notifications.filter((n) => filter === 'All' || n.type === filter);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Notifications"
        subtitle={`${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`}
        action={
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => { markAllRead(); toast('All notifications marked as read.', 'info'); }}>
              <CheckCheck className="size-4" aria-hidden="true" /> Mark all read
            </Button>
            <Button variant="danger" size="sm" onClick={() => setConfirming(true)}>
              <Trash2 className="size-4" aria-hidden="true" /> Clear all
            </Button>
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {(['All', 'warning', 'success', 'info', 'achievement', 'reminder'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-xl px-4 py-2 text-xs font-semibold capitalize transition-all ${
              filter === f
                ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-lg shadow-primary/25'
                : 'glass text-slate-500 hover:text-ink dark:text-slate-300 dark:hover:text-white'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <GlassCard hover={false}>
          <EmptyState
            icon={<Bell className="size-8" aria-hidden="true" />}
            title="All caught up"
            message={filter === 'All' ? 'You have no notifications right now. Nice and quiet!' : `No ${filter} notifications.`}
          />
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {filtered.map((n, i) => {
            const meta = TYPE_META[n.type];
            const Icon = meta.icon;
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`glass group flex items-start gap-4 rounded-2xl p-5 ${
                  !n.read ? 'ring-1 ring-primary-light/30' : ''
                }`}
              >
                <div className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${meta.bg}`}>
                  <Icon className={`size-5 ${meta.text}`} aria-hidden="true" />
                </div>
                <button
                  className="flex-1 text-left"
                  onClick={() => markRead(n.id)}
                  aria-label={`Read notification: ${n.title}`}
                >
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-ink dark:text-white">{n.title}</p>
                    {!n.read && <span className="size-2 rounded-full bg-secondary" aria-label="Unread" />}
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{n.message}</p>
                  <p className="mt-1.5 text-xs text-slate-400">{timeAgo(n.date)}</p>
                </button>
                <button
                  onClick={() => {
                    removeNotification(n.id);
                    toast('Notification removed.', 'info');
                  }}
                  className="rounded-lg p-2 text-slate-300 opacity-0 transition group-hover:opacity-100 hover:bg-danger/10 hover:text-danger dark:text-slate-600"
                  aria-label={`Delete notification: ${n.title}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={confirming}
        title="Clear all notifications?"
        message="All notifications will be permanently removed. You can restore demo data from Settings later."
        confirmLabel="Clear all"
        onConfirm={() => {
          clearAll();
          setConfirming(false);
          toast('All notifications cleared.', 'info');
        }}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}
