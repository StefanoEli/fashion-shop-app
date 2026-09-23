// Canonical, MMP-agnostic event model.
// Screens emit ONLY these events. Providers (AppsFlyer, Adjust, ...) translate
// them into their own SDK-specific event names/tokens.

export type CanonicalEventName =
  | 'view_item'
  | 'view_item_list'
  | 'add_to_cart'
  | 'view_cart'
  | 'begin_checkout'
  | 'purchase';

export type CanonicalItem = {
  id: string;
  name: string;
  brand?: string;
  category?: string;
  price: number;
  quantity: number;
};

export type CanonicalEvent = {
  name: CanonicalEventName;
  currency: string;
  /** Total monetary value of the event, when applicable (cart/purchase). */
  value?: number;
  items?: CanonicalItem[];
  /** Order id for purchase events. */
  transactionId?: string;
  /** Free-form extra context (e.g. list name). */
  meta?: Record<string, string | number | boolean>;
};

/**
 * Common contract every MMP adapter implements. Adding a new MMP = a new file
 * that implements this interface + one entry in the provider config.
 */
export interface TrackingProvider {
  /** Stable identifier, e.g. "appsflyer" | "adjust". */
  readonly key: string;
  /** Whether the underlying native SDK is available (false in Expo Go). */
  isAvailable(): boolean;
  /** Initialize the SDK. Called once at app start. */
  init(): Promise<void> | void;
  /** Forward one canonical event to the SDK. */
  logEvent(event: CanonicalEvent): Promise<void> | void;
  /** Optional: attach a customer/user id for stronger matching. */
  setUserId?(id: string): void;
}
