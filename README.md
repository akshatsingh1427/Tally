# Tally — Track what you spend, not what you meant to

Built for Vibeathon, MicroCraft's solo coding hackathon.

## The problem

Most people don't lose money to one big mistake — they lose it to a hundred small ones they never wrote down. Banking apps show you a list of transactions after the fact; budgeting apps demand you link an account and trust a third party with your statements. Tally is the middle ground: a fast, private, zero-setup way to log what you spend, see where it's going, and notice when you're about to blow through your budget — before the month is over, not after.

## What it does

The app is organized into five tabs so each task has its own space instead of one long scroll:

- **Dashboard** — the month at a glance: total spent, daily average, top category, budget headroom, net balance, the add-expense form, a category breakdown chart, and your five most recent entries.
- **Transactions** — the full list for the month, with search, category filtering, inline editing, deletion, and CSV export.
- **Insights** — a cumulative daily spending trend, a second view of the category breakdown, and a plain-language summary (biggest category, single largest expense, projected month-end spend, and how that tracks against budget).
- **Budget** — set an overall monthly budget and income, plus optional per-category spending caps so one category can't quietly eat the whole budget.
- **Settings** — toggle dark mode, and a clearly separated "danger zone" to wipe all stored data from the device.

Within that structure:

- Log an expense in under five seconds: amount, what it was for, a category, a date.
- Edit or remove any past entry inline, no separate screen.
- Track income alongside spending to get a real net balance.
- Set per-category budget caps and see which ones are running over.
- Search and filter the transaction list by keyword or category.
- Export any month's transactions to a CSV file for spreadsheets or taxes.
- Switch between light and dark mode, saved across sessions.
- Switch between months to review past spending patterns.

## Why it's real-world

There's no login wall, no backend, no tracking. Data is saved locally in the browser via `localStorage`, so it persists across sessions without ever leaving the device — genuinely usable the same day you open it, by anyone, on anything with a browser.

## Tech stack

- Vanilla HTML, CSS, and JavaScript — no framework, no build step, no dependencies to install.
- Chart.js (loaded via CDN) for the category and trend visualizations.
- `localStorage` for persistence.
- Google Fonts (Fraunces for numbers and headings, Inter for UI text).

## How to run

1. Download the project folder.
2. Open `index.html` directly in any modern browser. That's it — no server, no `npm install`.

## Design notes

The palette leans into warm ivory, forest green, and a muted gold, deliberately avoiding the cold blue-and-white look most finance dashboards default to — money management shouldn't feel like a spreadsheet. Fraunces, a serif with personality, carries the big numbers; Inter handles the interface so it stays legible and quick to scan.

## What's next

Recurring expenses, CSV export, multi-currency support, and a lightweight income field to turn the monthly view into a true running balance.
