// AppsFlyer adapter. Maps canonical events to AppsFlyer standard `af_*` events.
// The native module is only present in a dev/EAS build (not Expo Go), so every
// SDK call is guarded and degrades to a logged no-op.

import type { AppsFlyerConfig } from '../config';
import type { CanonicalEvent, CanonicalEventName, TrackingProvider } from '../types';

// Lazy holder for the native module.
let appsFlyer: any = null;
function load(): any {
  if (appsFlyer) return appsFlyer;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('react-native-appsflyer');
    appsFlyer = mod?.default ?? mod;
  } catch {
    appsFlyer = null;
  }
  return appsFlyer;
}

const EVENT_NAME: Record<CanonicalEventName, string> = {
  view_item: 'af_content_view',
  view_item_list: 'af_list_view',
  add_to_cart: 'af_add_to_cart',
  view_cart: 'af_list_view',
  begin_checkout: 'af_initiated_checkout',
  purchase: 'af_purchase',
};

function toValues(event: CanonicalEvent): Record<string, unknown> {
  const ids = (event.items ?? []).map((i) => i.id);
  const values: Record<string, unknown> = {
    af_currency: event.currency,
    af_content_type: event.items?.[0]?.category ?? 'product',
  };
  if (ids.length) values.af_content_id = ids;
  if (event.value !== undefined) {
    values.af_revenue = event.value;
    values.af_price = event.value;
  }
  const qty = (event.items ?? []).reduce((s, i) => s + i.quantity, 0);
  if (qty) values.af_quantity = qty;
  if (event.transactionId) values.af_order_id = event.transactionId;
  return values;
}

export function createAppsFlyerProvider(cfg: AppsFlyerConfig): TrackingProvider {
  return {
    key: 'appsflyer',
    isAvailable() {
      return !!load();
    },
    init() {
      const af = load();
      if (!af) {
        console.warn('[tracking:appsflyer] native module unavailable (Expo Go?) — skipping init.');
        return;
      }
      if (!cfg.devKey) {
        console.warn('[tracking:appsflyer] missing EXPO_PUBLIC_AF_DEV_KEY — skipping init.');
        return;
      }
      af.initSdk(
        {
          devKey: cfg.devKey,
          appId: cfg.appId,
          isDebug: cfg.isDebug,
          onInstallConversionDataListener: true,
          // Give the ATT prompt time to resolve before attribution starts (iOS).
          timeToWaitForATTUserAuthorization: 60,
        },
        (res: unknown) => console.log('[tracking:appsflyer] init ok', res),
        (err: unknown) => console.warn('[tracking:appsflyer] init error', err),
      );
    },
    logEvent(event: CanonicalEvent) {
      const af = load();
      if (!af) return;
      const name = EVENT_NAME[event.name];
      af.logEvent(
        name,
        toValues(event),
        () => {},
        (err: unknown) => console.warn(`[tracking:appsflyer] logEvent ${name} error`, err),
      );
    },
    setUserId(id: string) {
      const af = load();
      if (!af) return;
      try {
        af.setCustomerUserId(id, () => {});
      } catch (e) {
        console.warn('[tracking:appsflyer] setCustomerUserId error', e);
      }
    },
  };
}
