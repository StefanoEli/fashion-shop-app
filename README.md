# Fashion Shop — MMP-agnostic test app

A real React Native + Expo fashion e-commerce app used to test **Mobile Measurement Partner (MMP)** integrations. Screens emit **canonical events** to a tracking façade; pluggable **MMP providers** (AppsFlyer, Adjust, …) translate and forward them. From each MMP you test the **Meta / TikTok / Criteo** integrations via that MMP's dashboard (Integrated Partners).

Content (catalog + images) is reused from the `criteo-dynamic-test-shop` test website.

## Why a layer instead of calling an SDK directly

Screens never call an SDK. They call helpers in [`lib/tracking`](lib/tracking) which build a **canonical event** and hand it to the `TrackingManager`, which fans out to every enabled provider.

```
screens ──logEvent(canonical)──▶ TrackingManager ──▶ AppsFlyerProvider ──▶ AppsFlyer ──▶ Meta/TikTok/Criteo
                                               └──▶ AdjustProvider    ──▶ Adjust    ──▶ Meta/TikTok/Criteo
```

- Remove an MMP → set `enabled: false`.
- Add Adjust → set `enabled: true` + tokens.
- Run more than one at once → enable multiple (simultaneous fan-out).
- Add a brand-new MMP → new adapter in `lib/tracking/providers/` + one config entry. No screen changes.

## Canonical events

`view_item`, `view_item_list`, `add_to_cart`, `view_cart`, `begin_checkout`, `purchase` (see [`lib/tracking/types.ts`](lib/tracking/types.ts)). Per-provider mapping lives in each adapter, e.g. AppsFlyer `purchase → af_purchase`, Adjust `purchase → <event token>`.

## Setup

```bash
npm install
cp .env.example .env    # fill in AppsFlyer dev key / app id, optional Adjust tokens
```

### Run the UI (Expo Go — events are logged only)

```bash
npx expo start
```

The MMP SDKs are native and **not available in Expo Go**; the app still runs and logs events (see the ⚙️ Tracking inspector). To actually forward to AppsFlyer/Adjust you need a dev/EAS build.

### Dev build with native SDKs

```bash
npx expo start --dev-client        # after installing a development build (below)
```

## Build & install on a phone (EAS Cloud — default)

Cloud builds need no local Android Studio/Xcode.

- **Android (start here, no store, no cost):**
  ```bash
  npm i -g eas-cli && eas login
  eas build -p android --profile preview   # → downloadable APK link/QR, install directly
  ```
- **iOS (after enrolling in the Apple Developer Program, $99/yr):**
  ```bash
  eas build -p ios --profile preview        # → TestFlight / ad-hoc, no public release
  ```

Local builds are an option for faster iteration: `eas build --local` or `npx expo run:android` (requires Android Studio / Xcode).

## Testing the Meta / TikTok / Criteo integrations

1. In your MMP dashboard (AppsFlyer and/or Adjust) enable **Integrated Partners**: Facebook (Meta), TikTok, Criteo; connect the ad accounts and partner app IDs.
2. Register the phone as a **test device** (GAID on Android, IDFA on iOS).
3. Do a **clean install** of the build, then browse: open a product (`view_item`) → add to cart (`add_to_cart`) → checkout → place order (`purchase`).
4. Verify in the MMP that install + in-app events are recorded and **forwarded to the partners**; cross-check each partner console.

### iOS note (ATT)

On iOS the app shows the **App Tracking Transparency** prompt before initializing the MMPs (so they can use the IDFA). Without consent, attribution falls back to SKAdNetwork/probabilistic.

## Config reference

All config is env-driven, see [`.env.example`](.env.example) and [`lib/tracking/config.ts`](lib/tracking/config.ts):

| Var | Meaning |
|-----|---------|
| `EXPO_PUBLIC_AF_ENABLED` | enable AppsFlyer |
| `EXPO_PUBLIC_AF_DEV_KEY` | AppsFlyer dev key |
| `EXPO_PUBLIC_AF_APP_ID` | iOS App Store id (required on iOS) |
| `EXPO_PUBLIC_ADJUST_ENABLED` | enable Adjust |
| `EXPO_PUBLIC_ADJUST_APP_TOKEN` | Adjust app token |
| `EXPO_PUBLIC_ADJUST_ENV` | `sandbox` \| `production` |
| `EXPO_PUBLIC_ADJUST_EVENT_TOKENS` | JSON map canonical event → Adjust event token |

## Regenerating catalog data

`data/catalog.ts` and `data/images.ts` are generated from the source CSV:

```bash
node scripts/generate-data.mjs
```

## Notes / known gaps

- **Adjust Expo config plugin**: `react-native-adjust` ships without an Expo config plugin. Autolinking via prebuild covers basic use; if iOS needs extra native setup, add a community config plugin. The `AdjustProvider` guards all calls so the app runs regardless.
- The purchase flow is a **test** flow (no real payment); it only fires the `purchase` event.
