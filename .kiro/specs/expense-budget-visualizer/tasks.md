# Implementation Plan: Expense & Budget Visualizer

## Overview

Build a single-page, zero-backend expense tracker as three files (`index.html`, `css/styles.css`, `js/app.js`) using Tailwind CSS, Chart.js, and Bootstrap Icons via CDN. All state is held in memory and persisted to `localStorage`. Every user action triggers a full synchronous re-render.

## Tasks

- [x] 1. Scaffold project files and CDN wiring
  - Create `index.html` with `<head>` containing Tailwind CDN script (with `tailwind.config = { darkMode: 'class' }`), Chart.js CDN script, Bootstrap Icons CDN link, and a `<link>` to `css/styles.css` and `<script defer>` to `js/app.js`
  - Add the full DOM skeleton: `<header>`, `<main>` with sections `#balance-section`, `#input-section`, `#sort-section`, `#list-section`, `#chart-section`, and `<footer>`
  - Create `css/styles.css` as an empty file (populated in task 3)
  - Create `js/app.js` with the `DEFAULT_CATEGORIES` constant and the mutable `state` singleton
  - _Requirements: 10.4, 10.5, 12.2_

- [x] 2. Implement Header and Footer
  - In `index.html`, populate `<header>` with the title "Expense & Budget Visualizer" and a theme-toggle button (Bootstrap Icons sun/moon icon)
  - Populate `<footer>` with copyright notice, contact info, and a Bootstrap Icons GitHub icon link
  - Apply Tailwind utility classes for layout and spacing
  - _Requirements: 11.1, 11.2, 11.3_

- [x] 3. Implement Neomorphism styles and theme variables in `css/styles.css`
  - Define `.neo` class with light-mode neomorphic `box-shadow` and `border-radius`
  - Define `.dark .neo` override for dark-mode neomorphic shadows
  - Define `.neo-btn` with `transition` for `box-shadow` and `transform`
  - Define `.neo-btn:hover` (lift) and `.neo-btn:active` (inset press) states
  - _Requirements: 10.1, 10.2_

- [x] 4. Implement state management and localStorage persistence
  - In `js/app.js`, implement `loadState()` — reads `ebv_transactions`, `ebv_categories`, `ebv_theme`, `ebv_sort` from localStorage with `try/catch`; falls back to empty defaults and sets a `state.storageWarning` flag on failure
  - Implement `saveState()`, `saveTransactions()`, `saveCategories()`, `saveTheme()`, `saveSort()` — each wraps its `localStorage.setItem` in a `try/catch`
  - Wire `DOMContentLoaded` initializer: `loadState()` → `applyTheme(state.theme)` → `render()` → `initEventListeners()`
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 5. Implement balance display
  - Add `<p id="balance-display">` inside `#balance-section` in `index.html`
  - Implement `renderBalance()` in `js/app.js`: sum all `state.transactions` amounts and update `#balance-display` text; show `0` when list is empty
  - Call `renderBalance()` from `render()`
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 6. Implement transaction input form
  - In `index.html`, add `<form id="transaction-form">` inside `#input-section` with: text input `#item-name`, number input `#item-amount`, `<select id="category-select">`, submit button, and inline error containers `#name-error`, `#amount-error`, `#category-error`
  - Implement `validateTransactionForm(name, amount, category)` in `js/app.js` returning `{ valid, errors }`
  - Implement `addTransaction(name, amount, category)`: validate → mutate `state.transactions` (push with `crypto.randomUUID()`) → `saveTransactions()` → `render()`
  - Implement `renderCategoryDropdown()`: rebuild `<select>` options from `state.categories`; call from `render()`
  - On successful submit: clear error containers and reset form fields (Requirement 1.5)
  - On failed submit: display inline error messages without adding transaction
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 7. Implement custom category sub-form
  - In `index.html`, add a sub-form `#add-category-form` inside `#input-section` with a text input `#new-category-name`, submit button, and inline error container `#category-name-error`
  - Implement `categoryExists(name)` (case-insensitive check) and `validateCategoryName(name)` returning `{ valid, error }`
  - Implement `addCategory(name)`: validate → push to `state.categories` → `saveCategories()` → `render()`
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 8. Implement transaction list rendering and deletion
  - In `index.html`, add `<ul id="transaction-list">` and an empty-state `<p id="empty-state">` inside `#list-section`
  - Implement `renderTransactionList()`: clear `<ul>`, call `getSortedTransactions()`, build one `<li>` per transaction showing name, amount, category, and a delete button with `data-id`; show/hide `#empty-state`
  - Implement `deleteTransaction(id)`: filter `state.transactions` → `saveTransactions()` → `render()`
  - Wire delete via event delegation on `#transaction-list` in `initEventListeners()`
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 9. Implement sort control
  - In `index.html`, add `<select id="sort-select">` inside `#sort-section` with options: `none`, `amount-asc`, `amount-desc`, `category-asc`
  - Implement `getSortedTransactions()`: return a sorted copy of `state.transactions` based on `state.sortOrder`
  - Implement `setSortOrder(order)`: update `state.sortOrder` → `saveSort()` → `render()`
  - Restore `state.sortOrder` to `#sort-select` value on `render()`
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 10. Implement Chart.js pie chart
  - In `index.html`, add `<canvas id="spending-chart">` and a `<p id="chart-placeholder">` inside `#chart-section`
  - Implement `CATEGORY_COLORS` map and deterministic fallback color generator (hash-based)
  - Implement `buildChartData()`: aggregate amounts per category, return `{ labels, data, colors }` with no duplicate colors
  - Implement `renderChart()`: if no transactions → `chartInstance?.destroy()`, set to `null`, show placeholder; else if `chartInstance` exists → mutate `.data` and call `.update()`; else create new `Chart` instance; guard with `typeof Chart === 'undefined'` check
  - Call `renderChart()` from `render()`
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 11. Implement dark/light mode toggle
  - Implement `applyTheme(theme)`: add/remove `dark` class on `<html>`; update toggle button icon (sun ↔ moon)
  - Implement `toggleTheme()`: flip `state.theme` → `saveTheme()` → `applyTheme(state.theme)`
  - Wire theme toggle button click in `initEventListeners()`
  - Default to `"light"` when no persisted value exists
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 12. Implement responsive layout and touch targets
  - Apply Tailwind responsive classes (`sm:`, `md:`) to `index.html` sections for single-column mobile and multi-column desktop layouts
  - Ensure all interactive elements (buttons, inputs, select) have `min-h-[44px] min-w-[44px]` or equivalent Tailwind classes
  - Verify layout renders usably at 320px viewport width
  - _Requirements: 9.1, 9.2, 9.3_

- [x] 13. Implement error handling for localStorage and CDN failures
  - In `loadState()`, wrap `JSON.parse` calls in `try/catch`; on any error set `state.storageWarning = true` and fall back to empty defaults
  - In `render()`, show/hide a `#storage-warning` banner based on `state.storageWarning`
  - Add `typeof Chart === 'undefined'` guard in `renderChart()`; if true, hide `#chart-section` and show a fallback text node
  - _Requirements: 5.4_

- [x] 14. Final checkpoint — wire everything together and verify
  - Confirm `initEventListeners()` wires all events: form submit, add-category submit, delete delegation, sort change, theme toggle
  - Confirm `render()` calls `renderBalance()`, `renderTransactionList()`, `renderChart()`, `renderCategoryDropdown()` in order
  - Confirm `DOMContentLoaded` sequence: `loadState` → `applyTheme` → `render` → `initEventListeners`
  - Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 1.1–1.5, 2.1–2.5, 3.1–3.4, 4.1–4.5, 5.1–5.4, 6.1–6.4, 7.1–7.3, 8.1–8.5, 9.1–9.3, 10.1–10.5, 11.1–11.3_

## Notes

- No test setup or test files are required (NFR-1). All tasks are pure implementation tasks.
- Tasks are ordered so each step builds on the previous — scaffold first, then state, then each UI section, then wiring.
- The three output files are `index.html`, `css/styles.css`, and `js/app.js` — no build step needed.
