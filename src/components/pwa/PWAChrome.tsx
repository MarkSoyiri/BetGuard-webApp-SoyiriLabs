import { InstallBanner } from './InstallBanner';
import { UpdateToast } from './UpdateToast';
import { OfflineBanner } from './OfflineBanner';
import { WelcomeModal } from './WelcomeModal';

export function PWAChrome() {
  return (
    <>
      <OfflineBanner />
      <InstallBanner />
      <UpdateToast />
      <WelcomeModal />
    </>
  );
}
