// Fan-out coordinator. Builds the set of enabled providers from config and
// forwards every canonical event to all of them. Per-provider errors are
// isolated so one failing MMP never breaks the others (or the UI).

import { createAdjustProvider } from './providers/adjust';
import { createAppsFlyerProvider } from './providers/appsflyer';
import { getSettings } from './settings';
import type { CanonicalEvent, TrackingProvider } from './types';

export type EventLogEntry = {
  at: number;
  event: CanonicalEvent;
  providers: string[];
};

class TrackingManager {
  private providers: TrackingProvider[] = [];
  private started = false;
  private log: EventLogEntry[] = [];
  private listeners = new Set<(log: EventLogEntry[]) => void>();

  init(): void {
    if (this.started) return;
    this.started = true;
    this.buildAndInit();
  }

  /** Rebuild providers from the current settings and (re)initialize them.
   *  Used by the admin after saving config. Note: some native SDKs fully apply
   *  new credentials only on a fresh app launch. */
  reinit(): void {
    this.started = true;
    this.buildAndInit();
  }

  private buildAndInit(): void {
    const cfg = getSettings();
    const candidates: Array<[boolean, () => TrackingProvider]> = [
      [cfg.appsflyer.enabled, () => createAppsFlyerProvider(cfg.appsflyer)],
      [cfg.adjust.enabled, () => createAdjustProvider(cfg.adjust)],
    ];

    this.providers = candidates.filter(([on]) => on).map(([, make]) => make());

    for (const p of this.providers) {
      try {
        p.init();
      } catch (e) {
        console.warn(`[tracking] provider "${p.key}" failed to init`, e);
      }
    }
    console.log(
      `[tracking] initialized providers: ${this.providers.map((p) => p.key).join(', ') || '(none)'}`,
    );
  }

  clearLog(): void {
    this.log = [];
    this.listeners.forEach((fn) => fn(this.log));
  }

  track(event: CanonicalEvent): void {
    const dispatched: string[] = [];
    for (const p of this.providers) {
      try {
        p.logEvent(event);
        dispatched.push(p.key);
      } catch (e) {
        console.warn(`[tracking] provider "${p.key}" failed on ${event.name}`, e);
      }
    }
    const entry: EventLogEntry = { at: Date.now(), event, providers: dispatched };
    this.log = [entry, ...this.log].slice(0, 50);
    this.listeners.forEach((fn) => fn(this.log));
    console.log(`[tracking] ${event.name} -> [${dispatched.join(', ') || 'no provider'}]`);
  }

  setUserId(id: string): void {
    for (const p of this.providers) p.setUserId?.(id);
  }

  activeProviders(): string[] {
    return this.providers.map((p) => p.key);
  }

  getLog(): EventLogEntry[] {
    return this.log;
  }

  subscribe(fn: (log: EventLogEntry[]) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
}

export const tracking = new TrackingManager();
