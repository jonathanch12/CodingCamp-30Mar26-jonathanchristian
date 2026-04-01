# Requirements Document

## Introduction

The Expense & Budget Visualizer is a mobile-friendly, single-page web application that helps users track daily spending. It displays a running total balance, a scrollable transaction history, and a pie chart of spending by category. The app runs entirely in the browser with no backend, persisting all data via the Local Storage API. It is built with HTML, Tailwind CSS, and Vanilla JavaScript, and supports a Neomorphism design style with dark/light mode toggle.

## Glossary

- **App**: The Expense & Budget Visualizer single-page web application.
- **Transaction**: A single spending record consisting of an item name, amount, and category.
- **Category**: A label grouping transactions (e.g., Food, Transport, Fun, or a user-defined custom category).
- **Balance**: The sum of all transaction amounts currently stored.
- **Transaction_List**: The scrollable UI component that displays all stored transactions.
- **Input_Form**: The UI form used to enter a new transaction.
- **Chart**: The pie chart component that visualises spending distribution by category.
- **Storage**: The browser's Local Storage API used to persist transaction data.
- **Theme**: The visual mode of the App, either light or dark.
- **Header**: The top section of the App displaying the application title.
- **Footer**: The bottom section of the App displaying copyright, contact information, and secondary links.

## Requirements

### Requirement 1: Transaction Input

**User Story:** As a user, I want to enter a transaction with a name, amount, and category, so that I can record my spending.

#### Acceptance Criteria

1. THE Input_Form SHALL contain a text field for item name, a numeric field for amount, and a dropdown for category selection.
2. WHEN the user submits the Input_Form with all fields filled, THE App SHALL add the transaction to the Transaction_List and persist it to Storage.
3. IF the user submits the Input_Form with one or more empty fields, THEN THE Input_Form SHALL display a validation error message and SHALL NOT add the transaction.
4. IF the user enters a non-positive or non-numeric value in the amount field, THEN THE Input_Form SHALL display a validation error and SHALL NOT add the transaction.
5. WHEN a transaction is successfully added, THE Input_Form SHALL reset all fields to their default empty state.

---

### Requirement 2: Transaction List

**User Story:** As a user, I want to see a scrollable list of all my transactions, so that I can review my spending history.

#### Acceptance Criteria

1. THE Transaction_List SHALL display each transaction's item name, amount, and category.
2. THE Transaction_List SHALL be scrollable when the number of transactions exceeds the visible area.
3. WHEN the user clicks the delete control on a transaction, THE App SHALL remove that transaction from the Transaction_List and from Storage.
4. WHEN the Transaction_List contains no transactions, THE App SHALL display an empty-state message indicating no transactions have been recorded.
5. WHEN the App loads, THE Transaction_List SHALL render all transactions previously persisted in Storage.

---

### Requirement 3: Total Balance Display

**User Story:** As a user, I want to see my total balance at the top of the page, so that I always know how much I have spent in total.

#### Acceptance Criteria

1. THE App SHALL display the total balance as the sum of all transaction amounts at the top of the page.
2. WHEN a transaction is added, THE App SHALL update the displayed balance within 100ms.
3. WHEN a transaction is deleted, THE App SHALL update the displayed balance within 100ms.
4. WHEN the Transaction_List is empty, THE App SHALL display a balance of 0.

---

### Requirement 4: Visual Spending Chart

**User Story:** As a user, I want to see a pie chart of my spending by category, so that I can understand where my money is going.

#### Acceptance Criteria

1. THE Chart SHALL display a pie chart representing the proportion of total spending per category using Chart.js.
2. WHEN a transaction is added, THE Chart SHALL update to reflect the new spending distribution within 100ms.
3. WHEN a transaction is deleted, THE Chart SHALL update to reflect the revised spending distribution within 100ms.
4. WHEN the Transaction_List is empty, THE Chart SHALL display an empty or placeholder state.
5. THE Chart SHALL assign a distinct colour to each category so that categories are visually distinguishable.

---

### Requirement 5: Data Persistence

**User Story:** As a user, I want my transactions to be saved between sessions, so that I do not lose my data when I close or refresh the browser.

#### Acceptance Criteria

1. WHEN a transaction is added, THE Storage SHALL persist the updated transaction list to Local Storage.
2. WHEN a transaction is deleted, THE Storage SHALL persist the updated transaction list to Local Storage.
3. WHEN the App initialises, THE App SHALL read all transactions from Local Storage and restore the Transaction_List, balance, and Chart to the persisted state.
4. IF Local Storage is unavailable or returns malformed data, THEN THE App SHALL initialise with an empty transaction list and display a warning message to the user.

---

### Requirement 6: Custom Categories

**User Story:** As a user, I want to add custom spending categories, so that I can organise transactions beyond the default options.

#### Acceptance Criteria

1. THE Input_Form SHALL provide a mechanism for the user to create a new custom category by entering a category name.
2. WHEN the user creates a custom category, THE App SHALL add it to the category dropdown and persist it to Storage.
3. WHEN the App initialises, THE App SHALL restore all previously created custom categories from Storage.
4. IF the user attempts to create a category with a name that already exists (case-insensitive), THEN THE App SHALL display an error and SHALL NOT create a duplicate category.

---

### Requirement 7: Transaction Sorting

**User Story:** As a user, I want to sort my transactions by amount or category, so that I can find and analyse my spending more easily.

#### Acceptance Criteria

1. THE Transaction_List SHALL provide a sort control allowing the user to sort transactions by amount (ascending or descending) or by category (alphabetical).
2. WHEN the user selects a sort option, THE Transaction_List SHALL re-render in the selected order within 100ms.
3. WHEN a new transaction is added while a sort order is active, THE Transaction_List SHALL insert the new transaction in the correct sorted position.

---

### Requirement 8: Dark/Light Mode Toggle

**User Story:** As a user, I want to switch between dark and light mode, so that I can use the app comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE App SHALL default to light mode on first load.
2. THE App SHALL provide a toggle control in the Header to switch between light and dark Theme.
3. WHEN the user activates the toggle, THE App SHALL apply the selected Theme to all UI components within 100ms.
4. WHEN the user activates the toggle, THE App SHALL persist the selected Theme preference to Storage.
5. WHEN the App initialises, THE App SHALL restore the previously persisted Theme preference from Storage.

---

### Requirement 9: Responsive Mobile-Friendly Layout

**User Story:** As a user, I want the app to work well on my phone, so that I can track spending on the go.

#### Acceptance Criteria

1. THE App SHALL render a usable layout on viewport widths from 320px to 2560px.
2. THE App SHALL use Tailwind CSS utility classes to implement a responsive layout.
3. THE App SHALL meet touch-target size guidelines, with interactive elements having a minimum tap target of 44x44 CSS pixels.

---

### Requirement 10: Visual Design and Theming

**User Story:** As a user, I want a clean, visually appealing interface, so that the app is pleasant to use.

#### Acceptance Criteria

1. THE App SHALL implement a Neomorphism design style using soft shadows and subtle depth effects on UI components.
2. THE App SHALL apply hover animation effects to interactive elements to provide visual feedback.
3. THE App SHALL use a primary colour palette of blue, white, and black, with additional accent colours permitted to enhance visual clarity.
4. THE App SHALL use Tailwind CSS for all layout and utility styling, with a single CSS file for custom Neomorphism and animation styles.
5. THE App SHALL use a single JavaScript file for all application logic.

---

### Requirement 11: Header and Footer

**User Story:** As a user, I want a clear header and footer, so that I can identify the app and access secondary information.

#### Acceptance Criteria

1. THE Header SHALL display the title "Expense & Budget Visualizer".
2. THE Footer SHALL display copyright notice, contact information, and secondary links.
3. THE Footer SHALL include a GitHub icon sourced from Bootstrap Icons via CDN (`https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css`).

---

### Requirement 12: Browser Compatibility

**User Story:** As a developer, I want the app to work across modern browsers, so that users are not restricted to a single browser.

#### Acceptance Criteria

1. THE App SHALL function correctly in the current stable releases of Chrome, Firefox, Edge, and Safari.
2. THE App SHALL function as a standalone web page opened directly in a browser without a server.
