import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  tone?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  tone = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} size="sm">
      <div className="flex flex-col items-center py-2 text-center">
        <div
          className={`mb-4 flex size-14 items-center justify-center rounded-2xl ${
            tone === 'danger'
              ? 'bg-danger/10 text-danger'
              : 'bg-primary/10 text-primary'
          }`}
        >
          <AlertTriangle className="size-7" aria-hidden="true" />
        </div>
        <h4 className="font-display text-lg font-bold text-ink dark:text-white">{title}</h4>
        <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          {message}
        </p>
        <div className="mt-6 flex w-full gap-3">
          <Button variant="ghost" fullWidth onClick={onCancel}>
            Cancel
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} fullWidth onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
