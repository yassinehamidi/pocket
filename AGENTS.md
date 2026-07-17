# Pocket — personal finance tracker

Expo SDK 54 (React Native) + TypeScript + Expo Router. Docs for this exact SDK: https://docs.expo.dev/versions/v54.0.0/

## Layout
- `src/app/` — Expo Router routes guarded in `_layout.tsx` by `Stack.Protected`: `onboarding` (first launch) → `(auth)/` (`sign-up`, `log-in`) → app: `(tabs)/` (Home `index`, `history` — Daily/Weekly views behind a segmented toggle, `goals` — savings challenge + wishlist + no-spend booster, `budget`), modals `add`, `new-bill`, `new-debt`, `new-wish`, pushed `settings` (gear icon) and `account` (avatar)
- `src/components/` — `TabBar` (custom bar with center FAB), `DailySection`/`WeeklySection` (the two History tab views), `TransactionRow`, `PhosphorIcon` (kebab-case name → phosphor-react-native component), `PrimaryButton` (gradient CTA), `FormField`
- `src/store/useFinanceStore.ts` — finance data (transactions, bills, debts, settings), persisted to AsyncStorage; starts EMPTY (seed data only loads via Settings → Load sample data)
- `src/store/useAuthStore.ts` — device-local account (salted SHA-256 hash via expo-crypto, no backend), session flag, hasOnboarded flag; also persisted. Route guards react to it; screens never navigate on login/logout themselves
- `src/lib/selectors.ts` — ALL derived values (balance, daily budget, weekly stats); never store computed numbers
- `src/lib/navigation.ts` — `dismissScreen(router)`: use instead of `router.back()` in modals/pushed screens (deep-link safe)
- `src/theme/colors.ts`, `src/theme/typography.ts` — palette and Nunito text styles extracted from `design-reference.html`; do not invent new colors, check the design file first
- `src/data/seed.ts` — sample data, dates generated relative to the real current day

## Conventions
- Money algorithm: the salary is never assumed — it only enters the balance when the user confirms it on payday (`SalaryConfirmCard` on Home; income tx id `salary-<cycle>`, `skippedSalaryCycle` suppresses the prompt). `getSpendPlan` in selectors.ts is the core formula: (balance − unpaid bills − debt left this month − reserve-mode challenge target) ÷ days to next payday. Savings challenges (`challenge` in the store) run per pay cycle in two modes: `reserve` (protected in balance, banked to the savings pot when the cycle ends — see `settleChallenge`) and `lock` (moved to the pot immediately)
- Currency is region-based (`src/data/currencies.ts`, chosen at sign-up / Account), formatted by `fmtMoney` ("3 200 DH", "$3 200" — space thousands, no decimals). Components showing amounts must subscribe to `settings.currency`
- Dates are local-time ISO strings (YYYY-MM-DD) via helpers in `src/lib/dates.ts`
- Nunito weights are separate font families (`fonts.bold` etc. in typography.ts) — never use `fontWeight`
- Tab bar is platform-split in `(tabs)/_layout.tsx`: iOS uses `NativeTabs` from `expo-router/unstable-native-tabs` (real system bar, Liquid Glass on iOS 26; SF Symbol icons; the "+" is the floating `AddFab`), Android/web use the JS `Tabs` from `expo-router` with the custom `TabBar`. `BottomTabBarProps` from `@react-navigation/bottom-tabs`; navigation theming (`ThemeProvider`, `DarkTheme`) from `@react-navigation/native`
- `design-reference.html` is the pixel source of truth for all five screens

## Commands
- `npx expo start` — dev server (scan QR with Expo Go)
- `npx tsc --noEmit` — type check
