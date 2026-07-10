# Pocket 💚

A personal finance tracker for daily spending, weekly check-ins, and budget/debt planning. Built with Expo (React Native), TypeScript, Expo Router, and Zustand. Design lives in `design-reference.html`.

## Run it

```bash
npm install
npx expo start
```

Then scan the QR code with the **Expo Go** app ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779)) — your phone and PC must be on the same Wi-Fi network.

## Screens

- **Home** — total balance, in/out this week, safe-to-spend today, recent activity
- **Daily** — spending ring vs daily budget, mood picker, today's transactions
- **Weekly** — 7-day bar chart, income/spending totals, delta vs last week, top categories
- **Budget** — monthly available, salary & savings-goal steppers, fixed bills, debts
- **Add (center + button)** — expense/income toggle, category chips, keypad, save

Daily budget formula: `(salary − bills − debt payments − savings goal) / 31`.
