# Enabling and adding MMPs

This app is **MMP-agnostic**. Screens never call an SDK — they emit canonical
events to a façade (`lib/tracking`) that fans out to the enabled providers.

There are two very different operations. Don't confuse them.

---

## 1. "Installed" vs "enabled" — the mental model

- **Installed** = the SDK is a project dependency + Expo config plugin, so it is
  **compiled into every native build**. Today **AppsFlyer and Adjust are already
  installed** (see `package.json` and the `plugins` array in `app.json`).
- **Enabled** = at **runtime** you turn a provider on and give it its key. This is
  done from the in-app **Admin** (the ⚙️ screen) or via `.env`. No code, no rebuild.

> In Expo Go / web the native SDKs are **not** in the binary, so providers run in
> "log-only" mode. To actually forward events you need a **dev build or EAS build**.

---

## 2. Enable an already-installed MMP (AppsFlyer / Adjust)

No code. Two ways:

**A) In-app Admin (recommended for testing)**
1. Open the app, tap the ⚙️ icon (top-left of Home).
2. Toggle the provider **Enabled**.
3. Paste its credentials:
   - AppsFlyer: **Dev key** (+ **iOS App ID** for iOS).
   - Adjust: **App token**, choose **sandbox/production**, and the **event tokens**
     JSON (canonical event → Adjust token, created in the Adjust dashboard).
4. **Save & apply**. (Native SDKs fully apply new keys after an app restart.)

**B) `.env`** (baked defaults) — see [`.env.example`](../.env.example):
```
EXPO_PUBLIC_AF_ENABLED=true
EXPO_PUBLIC_AF_DEV_KEY=...
EXPO_PUBLIC_ADJUST_ENABLED=true
EXPO_PUBLIC_ADJUST_APP_TOKEN=...
EXPO_PUBLIC_ADJUST_EVENT_TOKENS={"purchase":"abc123","add_to_cart":"def456"}
```

You can enable **one, the other, or both at once** (simultaneous fan-out).

---

## 3. Add a brand-new MMP (e.g. Branch, Singular, Kochava)

Four steps. Screens don't change. Example: adding **Singular**.

### Step 1 — Install the SDK + config plugin
```bash
npx expo install singular-react-native          # the vendor SDK
# add its Expo config plugin to app.json "plugins": [...]
```
If the SDK has no Expo plugin, add a community one (`@config-plugins/...`) or a
local plugin. Then it will be compiled into the next native build.

### Step 2 — Extend the config
In [`lib/tracking/config.ts`](../lib/tracking/config.ts):
- add a `SingularConfig` type,
- add `singular` to `ProvidersConfig`,
- read its env vars into `ENV_PROVIDERS_CONFIG.singular`.

Add the vars to [`.env.example`](../.env.example).

### Step 3 — Write the adapter
Create `lib/tracking/providers/singular.ts` implementing `TrackingProvider`
(see [`types.ts`](../lib/tracking/types.ts)). Mirror the AppsFlyer/Adjust adapters:
guard the native `require`, and map canonical events to the SDK's calls.

```ts
export function createSingularProvider(cfg: SingularConfig): TrackingProvider {
  return {
    key: 'singular',
    isAvailable() { /* try require */ },
    init() { /* SDK init with cfg */ },
    logEvent(event) { /* map canonical -> SDK event */ },
  };
}
```

### Step 4 — Register it
In [`lib/tracking/manager.ts`](../lib/tracking/manager.ts) add one line to the
`candidates` array:
```ts
[cfg.singular.enabled, () => createSingularProvider(cfg.singular)],
```
Update the `merge()` in [`settings.ts`](../lib/tracking/settings.ts) to include
`singular`, and (optionally) add its fields to the Admin screen
[`app/settings.tsx`](../app/settings.tsx).

Rebuild (`eas build`) and it appears alongside AppsFlyer/Adjust.

---

## 4. Remove an MMP

- **Temporarily**: set its provider `enabled: false` (Admin or `.env`). It stays
  compiled in but never initializes.
- **Permanently**: remove its `candidates` entry + adapter + config block, and
  `npm uninstall` the SDK + remove its plugin from `app.json`. Rebuild.

---

## 5. Where each partner (Meta / TikTok / Criteo) is turned on

Meta, TikTok and Criteo are **not** SDKs in this app — they are **Integrated
Partners inside each MMP**. You enable them in the **MMP dashboard** (AppsFlyer
and/or Adjust), connect the ad accounts + partner app IDs, and the MMP forwards
installs/events to them. The app only needs the MMP enabled; the partner routing
lives in the MMP.
