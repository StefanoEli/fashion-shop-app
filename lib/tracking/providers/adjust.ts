// Adjust adapter. Maps canonical events to Adjust event tokens (defined in the
// Adjust dashboard and provided via config). Native module is only present in a
// dev/EAS build, so all SDK calls are guarded.

import type { AdjustConfig } from '../config';
import type { CanonicalEvent, TrackingProvider } from '../types';

let adjustMod: any = null;
function load(): any {
  if (adjustMod) return adjustMod;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    adjustMod = require('react-native-adjust');
  } catch {
    adjustMod = null;
  }
  return adjustMod;
}

export function createAdjustProvider(cfg: AdjustConfig): TrackingProvider {
  return {
    key: 'adjust',
    isAvailable() {
      return !!load();
    },
    init() {
      const mod = load();
      if (!mod) {
        console.warn('[tracking:adjust] native module unavailable (Expo Go?) — skipping init.');
        return;
      }
      if (!cfg.appToken) {
        console.warn('[tracking:adjust] missing EXPO_PUBLIC_ADJUST_APP_TOKEN — skipping init.');
        return;
      }
      const { Adjust, AdjustConfig } = mod;
      const environment =
        cfg.environment === 'production'
          ? AdjustConfig.EnvironmentProduction
          : AdjustConfig.EnvironmentSandbox;
      const config = new AdjustConfig(cfg.appToken, environment);
      Adjust.initSdk(config);
      console.log('[tracking:adjust] init ok', cfg.environment);
    },
    logEvent(event: CanonicalEvent) {
      const mod = load();
      if (!mod) return;
      const token = cfg.eventTokens[event.name];
      if (!token) {
        // No token mapped for this event — nothing to send to Adjust.
        return;
      }
      const { Adjust, AdjustEvent } = mod;
      const adjustEvent = new AdjustEvent(token);
      if (event.value !== undefined) {
        adjustEvent.setRevenue(event.value, event.currency);
      }
      if (event.transactionId) {
        adjustEvent.setTransactionId(event.transactionId);
        adjustEvent.setDeduplicationId(event.transactionId);
      }
      const ids = (event.items ?? []).map((i) => i.id).join(',');
      if (ids) adjustEvent.addCallbackParameter('content_ids', ids);
      Adjust.trackEvent(adjustEvent);
    },
    setUserId(id: string) {
      const mod = load();
      if (!mod) return;
      try {
        mod.Adjust.addGlobalCallbackParameter('user_id', id);
      } catch (e) {
        console.warn('[tracking:adjust] setUserId error', e);
      }
    },
  };
}
