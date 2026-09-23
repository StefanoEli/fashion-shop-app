// Central provider configuration — the single place that decides which MMPs are
// active. Values come from EXPO_PUBLIC_* env vars (see .env.example) so nothing
// secret is hardcoded. Flip `enabled` to add/remove an MMP, or enable more than
// one at once (simultaneous fan-out).

import type { CanonicalEventName } from './types';

const env = (key: string, fallback = ''): string => {
  const v = process.env[key];
  return v === undefined || v === null ? fallback : String(v);
};

const bool = (key: string, fallback = false): boolean => {
  const v = process.env[key];
  if (v === undefined) return fallback;
  return v === 'true' || v === '1';
};

export type AppsFlyerConfig = {
  enabled: boolean;
  devKey: string;
  /** iOS App Store numeric id (required on iOS). */
  appId: string;
  isDebug: boolean;
};

export type AdjustConfig = {
  enabled: boolean;
  appToken: string;
  environment: 'sandbox' | 'production';
  /** Map canonical event -> Adjust event token (created in the Adjust dashboard). */
  eventTokens: Partial<Record<CanonicalEventName, string>>;
};

export type ProvidersConfig = {
  appsflyer: AppsFlyerConfig;
  adjust: AdjustConfig;
};

function parseAdjustTokens(): Partial<Record<CanonicalEventName, string>> {
  const raw = env('EXPO_PUBLIC_ADJUST_EVENT_TOKENS');
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    console.warn('[tracking] EXPO_PUBLIC_ADJUST_EVENT_TOKENS is not valid JSON — ignoring.');
    return {};
  }
}

export const PROVIDERS_CONFIG: ProvidersConfig = {
  appsflyer: {
    enabled: bool('EXPO_PUBLIC_AF_ENABLED', true),
    devKey: env('EXPO_PUBLIC_AF_DEV_KEY'),
    appId: env('EXPO_PUBLIC_AF_APP_ID'),
    isDebug: bool('EXPO_PUBLIC_AF_DEBUG', true),
  },
  adjust: {
    enabled: bool('EXPO_PUBLIC_ADJUST_ENABLED', false),
    appToken: env('EXPO_PUBLIC_ADJUST_APP_TOKEN'),
    environment: (env('EXPO_PUBLIC_ADJUST_ENV', 'sandbox') as 'sandbox' | 'production'),
    eventTokens: parseAdjustTokens(),
  },
};
