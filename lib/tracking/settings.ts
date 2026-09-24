// Runtime provider settings: env defaults merged with device-persisted overrides
// edited from the in-app Admin. This is what the TrackingManager reads.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV_PROVIDERS_CONFIG, type ProvidersConfig } from './config';

const STORAGE_KEY = 'mmp_provider_settings_v1';

let current: ProvidersConfig = ENV_PROVIDERS_CONFIG;
let loaded = false;

function merge(base: ProvidersConfig, override: Partial<ProvidersConfig>): ProvidersConfig {
  return {
    appsflyer: { ...base.appsflyer, ...(override.appsflyer ?? {}) },
    adjust: { ...base.adjust, ...(override.adjust ?? {}) },
  };
}

export function getSettings(): ProvidersConfig {
  return current;
}

export async function loadSettings(): Promise<ProvidersConfig> {
  if (loaded) return current;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) current = merge(ENV_PROVIDERS_CONFIG, JSON.parse(raw));
  } catch (e) {
    console.warn('[tracking:settings] load failed', e);
  }
  loaded = true;
  return current;
}

export async function saveSettings(next: ProvidersConfig): Promise<void> {
  current = next;
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (e) {
    console.warn('[tracking:settings] save failed', e);
  }
}

export async function resetSettings(): Promise<ProvidersConfig> {
  current = ENV_PROVIDERS_CONFIG;
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('[tracking:settings] reset failed', e);
  }
  return current;
}
