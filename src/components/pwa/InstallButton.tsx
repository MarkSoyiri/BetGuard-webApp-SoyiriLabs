import { Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { usePWA } from '@/contexts/PWAContext';

interface InstallButtonProps {
  compact?: boolean;
  iconOnly?: boolean;
}

export function InstallButton({ compact = false, iconOnly = false }: InstallButtonProps) {
  const { canInstall, installApp } = usePWA();
  if (!canInstall) return null;

  if (iconOnly) {
    return (
      <button
        onClick={() => void installApp()}
        className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-ink dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
        aria-label="Install BetGuard app"
        title="Install BetGuard"
      >
        <Download className="size-5" />
      </button>
    );
  }

  return (
    <Button
      variant={compact ? 'outline' : 'primary'}
      size={compact ? 'sm' : 'md'}
      onClick={() => void installApp()}
      icon={<Download className={compact ? 'size-3.5' : 'size-4'} aria-hidden="true" />}
    >
      Install App
    </Button>
  );
}
