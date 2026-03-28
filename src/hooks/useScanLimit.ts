import { useUserProfile } from './useUserProfile';
import { useSubscription } from './useSubscription';
import {
  canScan,
  isFreeScanAvailable,
  getFreeScanRemaining,
  getScanAccessLabel,
} from '../logic/scanLimiter';

export function useScanLimit() {
  const { userDoc } = useUserProfile();
  const { isPremium } = useSubscription();

  return {
    canScan: canScan(userDoc, isPremium),
    isFreeScanAvailable: userDoc ? isFreeScanAvailable(userDoc) : false,
    freeScanRemaining: getFreeScanRemaining(userDoc),
    scanAccessLabel: getScanAccessLabel(userDoc, isPremium),
    isPremium,
  };
}
