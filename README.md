# Pocket 💚

Yet another personal finance tracker, because apparently the seventeen you already ignored weren't enough. This one watches your daily spending, nags you with weekly check-ins, and pretends it can plan your budget and debt like a responsible adult you clearly are not. Built with Expo (React Native), TypeScript, Expo Router, and Zustand — buzzwords included at no extra charge. The design lives in `design-reference.html`, in case you want proof it was ever designed at all.

## Run it (allegedly)

```bash
npm install
npx expo start
```

Then scan the QR code with the **Expo Go** app ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779)). Fair warning: your phone and PC must be on the same Wi-Fi network, because technology peaked in 2010 and never recovered.

## Screens (yes, there are several)

- **Home** — your total balance, the money that came in and fled this week, how much you're "safe to spend" today (spoiler: less than you'd like), and a greatest-hits reel of recent activity
- **Daily** — a spending ring that judges you against your daily budget, a mood picker for when the ring wins, and today's transactions in all their glory
- **Weekly** — a 7-day bar chart, income vs spending totals, a delta vs last week to quantify your regret, and your top categories (it's coffee, isn't it)
- **Budget** — monthly available funds, salary and savings-goal steppers, fixed bills, and debts you'd rather not think about
- **Add (the center + button)** — an expense/income toggle, category chips, a keypad, and a save button that makes it all painfully official

The daily budget is calculated with cold, unfeeling math: `(salary − bills − debt payments − savings goal) / 31`.
