# Pocket — personal finance tracker

Expo SDK 57 (React Native) + TypeScript + Expo Router. Docs for this exact SDK: https://docs.expo.dev/versions/v57.0.0/

## Layout
- `src/app/` — Expo Router routes guarded in `_layout.tsx` by `Stack.Protected`: `onboarding` (first launch) → `(auth)/` (`sign-up`, `log-in`) → app: `(tabs)/` (Home `index`, `daily`, `weekly`, `budget`), modals `add`, `new-bill`, `new-debt`, pushed `settings` (gear icon) and `account` (avatar)
- `src/components/` — `TabBar` (custom bar with center FAB), `TransactionRow`, `PhosphorIcon` (kebab-case name → phosphor-react-native component), `PrimaryButton` (gradient CTA), `FormField`
- `src/store/useFinanceStore.ts` — finance data (transactions, bills, debts, settings), persisted to AsyncStorage; starts EMPTY (seed data only loads via Settings → Load sample data)
- `src/store/useAuthStore.ts` — device-local account (salted SHA-256 hash via expo-crypto, no backend), session flag, hasOnboarded flag; also persisted. Route guards react to it; screens never navigate on login/logout themselves
- `src/lib/selectors.ts` — ALL derived values (balance, daily budget, weekly stats); never store computed numbers
- `src/lib/navigation.ts` — `dismissScreen(router)`: use instead of `router.back()` in modals/pushed screens (deep-link safe)
- `src/theme/colors.ts`, `src/theme/typography.ts` — palette and Nunito text styles extracted from `design-reference.html`; do not invent new colors, check the design file first
- `src/data/seed.ts` — sample data, dates generated relative to the real current day

## Conventions
- Currency is Moroccan dirham, formatted by `fmtDH` ("3 200 DH" — space thousands, no decimals)
- Dates are local-time ISO strings (YYYY-MM-DD) via helpers in `src/lib/dates.ts`
- Nunito weights are separate font families (`fonts.bold` etc. in typography.ts) — never use `fontWeight`
- `Tabs`/`BottomTabBarProps` come from `expo-router/js-tabs` (the plain `expo-router` export is deprecated in SDK 57)
- `design-reference.html` is the pixel source of truth for all five screens

## Commands
- `npx expo start` — dev server (scan QR with Expo Go)
- `npx tsc --noEmit` — type check
