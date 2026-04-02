// Expense & Budget Visualizer — app.js

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_CATEGORIES = ["Food", "Transport", "Fun", "Health", "Other"];

// ---------------------------------------------------------------------------
// State singleton
// ---------------------------------------------------------------------------

let state = {
  transactions: [],
  categories: [...DEFAULT_CATEGORIES],
  sortOrder: "none",
  theme: "light",
  storageWarning: false
};

// ---------------------------------------------------------------------------
// State persistence — localStorage
// ---------------------------------------------------------------------------

function loadState() {
  try {
    const transactions = localStorage.getItem("ebv_transactions");
    if (transactions !== null) {
      state.transactions = JSON.parse(transactions);
    }
  } catch (e) {
    state.transactions = [];
    state.storageWarning = true;
  }

  try {
    const categories = localStorage.getItem("ebv_categories");
    if (categories !== null) {
      state.categories = JSON.parse(categories);
    }
  } catch (e) {
    state.categories = [...DEFAULT_CATEGORIES];
    state.storageWarning = true;
  }

  try {
    const theme = localStorage.getItem("ebv_theme");
    if (theme !== null) {
      state.theme = theme;
    }
  } catch (e) {
    state.theme = "light";
    state.storageWarning = true;
  }

  try {
    const sortOrder = localStorage.getItem("ebv_sort");
    if (sortOrder !== null) {
      state.sortOrder = sortOrder;
    }
  } catch (e) {
    state.sortOrder = "none";
    state.storageWarning = true;
  }
}

function saveState() {
  saveTransactions();
  saveCategories();
  saveTheme();
  saveSort();
}

function saveTransactions() {
  try {
    localStorage.setItem("ebv_transactions", JSON.stringify(state.transactions));
  } catch (e) {
    state.storageWarning = true;
  }
}

function saveCategories() {
  try {
    localStorage.setItem("ebv_categories", JSON.stringify(state.categories));
  } catch (e) {
    state.storageWarning = true;
  }
}

function saveTheme() {
  try {
    localStorage.setItem("ebv_theme", state.theme);
  } catch (e) {
    state.storageWarning = true;
  }
}

function saveSort() {
  try {
    localStorage.setItem("ebv_sort", state.sortOrder);
  } catch (e) {
    state.storageWarning = true;
  }
}

// ---------------------------------------------------------------------------
// Theme
// ---------------------------------------------------------------------------

/**
 * Applies the given theme to the document and updates the toggle button icon.
 * @param {"light"|"dark"} theme
 */
function applyTheme(theme) {
  const html = document.documentElement;
  const sunIcon = document.getElementById("theme-icon-sun");
  const moonIcon = document.getElementById("theme-icon-moon");

  if (theme === "dark") {
    html.classList.add("dark");
    if (sunIcon) sunIcon.classList.remove("hidden");
    if (moonIcon) moonIcon.classList.add("hidden");
  } else {
    html.classList.remove("dark");
    if (sunIcon) sunIcon.classList.add("hidden");
    if (moonIcon) moonIcon.classList.remove("hidden");
  }
}

function toggleTheme() {
  state.theme = state.theme === "dark" ? "light" : "dark";
  saveTheme();
  applyTheme(state.theme);
}

/**
 * Sets the theme to a specific value, persists it, and applies it.
 * Exported for testing (Property 12).
 * @param {"light"|"dark"} value
 */
export function setTheme(value) {
  state.theme = value;
  saveTheme();
  applyTheme(value);
}

// ---------------------------------------------------------------------------
// Chart.js pie chart
// ---------------------------------------------------------------------------

const CATEGORY_COLORS = {
  Food:      "#3b82f6",
  Transport: "#10b981",
  Fun:       "#f59e0b",
  Health:    "#ef4444",
  Other:     "#8b5cf6"
};

const CUSTOM_PALETTE = [
  "#06b6d4", "#ec4899", "#f97316", "#84cc16", "#a855f7",
  "#14b8a6", "#e11d48", "#0ea5e9", "#d97706", "#65a30d"
];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function getColorForCategory(category, usedColors) {
  if (CATEGORY_COLORS[category] && !usedColors.has(CATEGORY_COLORS[category])) {
    return CATEGORY_COLORS[category];
  }
  const base = hashString(category);
  for (let i = 0; i < CUSTOM_PALETTE.length; i++) {
    const color = CUSTOM_PALETTE[(base + i) % CUSTOM_PALETTE.length];
    if (!usedColors.has(color)) return color;
  }
  return "hsl(" + (base % 360) + ", 65%, 55%)";
}

/**
 * Aggregates transaction amounts per category and returns chart-ready data.
 * @param {Array} [transactions] - optional override; defaults to state.transactions
 * @returns {{ labels: string[], data: number[], colors: string[] }}
 */
export function buildChartData(transactions) {
  const txns = transactions !== undefined ? transactions : state.transactions;
  const totals = new Map();
  for (const t of txns) {
    totals.set(t.category, (totals.get(t.category) || 0) + t.amount);
  }
  const labels = [], data = [], colors = [];
  const usedColors = new Set();
  for (const [category, amount] of totals) {
    const color = getColorForCategory(category, usedColors);
    usedColors.add(color);
    labels.push(category);
    data.push(amount);
    colors.push(color);
  }
  return { labels, data, colors };
}

let chartInstance = null;

function renderChart() {
  const chartSection = document.getElementById("chart-section");
  const placeholder = document.getElementById("chart-placeholder");
  const canvas = document.getElementById("spending-chart");

  if (typeof Chart === "undefined") {
    if (chartSection) {
      chartSection.style.display = "none";
      const fallback = document.createElement("p");
      fallback.textContent = "Chart unavailable: Chart.js failed to load.";
      chartSection.parentNode.insertBefore(fallback, chartSection.nextSibling);
    }
    return;
  }

  if (state.transactions.length === 0) {
    if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
    if (placeholder) placeholder.classList.remove("hidden");
    if (canvas) canvas.classList.add("hidden");
    return;
  }

  if (placeholder) placeholder.classList.add("hidden");
  if (canvas) canvas.classList.remove("hidden");

  const { labels, data, colors } = buildChartData();

  if (chartInstance) {
    chartInstance.data.labels = labels;
    chartInstance.data.datasets[0].data = data;
    chartInstance.data.datasets[0].backgroundColor = colors;
    chartInstance.update();
  } else {
    chartInstance = new Chart(canvas, {
      type: "pie",
      data: {
        labels,
        datasets: [{ data, backgroundColor: colors, borderWidth: 2 }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "bottom" },
          tooltip: {
            callbacks: {
              label: function(ctx) {
                return ctx.label + ": $" + ctx.parsed.toFixed(2);
              }
            }
          }
        }
      }
    });
  }
}

// ---------------------------------------------------------------------------
// Category operations
// ---------------------------------------------------------------------------

export function categoryExists(name) {
  const lower = name.trim().toLowerCase();
  return state.categories.some(function(cat) { return cat.toLowerCase() === lower; });
}

export function validateCategoryName(name) {
  if (!name || name.trim() === "") {
    return { valid: false, error: "Category name is required." };
  }
  if (categoryExists(name)) {
    return { valid: false, error: "Category already exists." };
  }
  return { valid: true, error: null };
}

export function addCategory(name) {
  const result = validateCategoryName(name);
  if (!result.valid) return false;
  state.categories.push(name.trim());
  saveCategories();
  render();
  return true;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export function validateTransactionForm(name, amount, category) {
  const errors = [];
  if (!name || name.trim() === "") {
    errors.push("Item name is required.");
  }
  const numAmount = Number(amount);
  if (amount === "" || amount === null || amount === undefined || isNaN(numAmount) || numAmount <= 0) {
    errors.push("Amount must be a positive number.");
  }
  if (!category || category.trim() === "") {
    errors.push("Category is required.");
  }
  return { valid: errors.length === 0, errors };
}

// ---------------------------------------------------------------------------
// Transaction operations
// ---------------------------------------------------------------------------

export function addTransaction(name, amount, category) {
  const result = validateTransactionForm(name, amount, category);
  if (!result.valid) return false;
  state.transactions.push({
    id: crypto.randomUUID(),
    name: name.trim(),
    amount: Number(amount),
    category
  });
  saveTransactions();
  render();
  return true;
}

export function deleteTransaction(id) {
  state.transactions = state.transactions.filter(function(t) { return t.id !== id; });
  saveTransactions();
  render();
}

export function getSortedTransactions() {
  const copy = [...state.transactions];
  switch (state.sortOrder) {
    case "amount-asc":  return copy.sort(function(a, b) { return a.amount - b.amount; });
    case "amount-desc": return copy.sort(function(a, b) { return b.amount - a.amount; });
    case "category-asc": return copy.sort(function(a, b) { return a.category.localeCompare(b.category); });
    default: return copy;
  }
}

export function setSortOrder(order) {
  state.sortOrder = order;
  saveSort();
  render();
}

// ---------------------------------------------------------------------------
// Rendering — transaction list
// ---------------------------------------------------------------------------

function renderTransactionList() {
  const ul = document.getElementById("transaction-list");
  const emptyState = document.getElementById("empty-state");
  if (!ul) return;

  ul.innerHTML = "";
  const transactions = getSortedTransactions();

  if (transactions.length === 0) {
    if (emptyState) emptyState.classList.remove("hidden");
    return;
  }
  if (emptyState) emptyState.classList.add("hidden");

  transactions.forEach(function(t) {
    const li = document.createElement("li");
    li.className = "flex items-center justify-between p-3 rounded-xl bg-white dark:bg-[#1e1e22] border border-gray-100 dark:border-gray-800";

    const info = document.createElement("div");
    info.className = "flex flex-col min-w-0 mr-2";

    const nameSpan = document.createElement("span");
    nameSpan.className = "font-medium text-sm truncate";
    nameSpan.textContent = t.name;

    const meta = document.createElement("span");
    meta.className = "text-xs text-gray-400 dark:text-gray-500 mt-0.5";
    meta.textContent = t.category + " \u00b7 $" + t.amount.toFixed(2);

    info.appendChild(nameSpan);
    info.appendChild(meta);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn flex-shrink-0";
    deleteBtn.setAttribute("data-id", t.id);
    deleteBtn.setAttribute("aria-label", "Delete " + t.name);
    deleteBtn.innerHTML = '<i class="bi bi-trash text-sm pointer-events-none"></i>';

    li.appendChild(info);
    li.appendChild(deleteBtn);
    ul.appendChild(li);
  });
}

// ---------------------------------------------------------------------------
// Rendering — category dropdown
// ---------------------------------------------------------------------------

function renderCategoryDropdown() {
  const select = document.getElementById("category-select");
  if (!select) return;

  const current = select.value;
  select.innerHTML = "";

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select a category";
  placeholder.disabled = true;
  select.appendChild(placeholder);

  state.categories.forEach(function(cat) {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });

  if (current && state.categories.includes(current)) {
    select.value = current;
  } else {
    select.value = "";
  }
}

// ---------------------------------------------------------------------------
// Event listeners
// ---------------------------------------------------------------------------

function initEventListeners() {
  // Transaction form submit
  const form = document.getElementById("transaction-form");
  if (form) {
    form.addEventListener("submit", function(e) {
      e.preventDefault();

      const nameInput = document.getElementById("item-name");
      const amountInput = document.getElementById("item-amount");
      const categorySelect = document.getElementById("category-select");

      const name = nameInput ? nameInput.value : "";
      const amount = amountInput ? amountInput.value : "";
      const category = categorySelect ? categorySelect.value : "";

      const nameError = document.getElementById("name-error");
      const amountError = document.getElementById("amount-error");
      const categoryError = document.getElementById("category-error");

      [nameError, amountError, categoryError].forEach(function(el) {
        if (el) { el.textContent = ""; el.classList.add("hidden"); }
      });

      const result = validateTransactionForm(name, amount, category);

      if (!result.valid) {
        if (!name || name.trim() === "") {
          if (nameError) { nameError.textContent = "Item name is required."; nameError.classList.remove("hidden"); }
        }
        const numAmount = Number(amount);
        if (amount === "" || isNaN(numAmount) || numAmount <= 0) {
          if (amountError) { amountError.textContent = "Amount must be a positive number."; amountError.classList.remove("hidden"); }
        }
        if (!category || category.trim() === "") {
          if (categoryError) { categoryError.textContent = "Category is required."; categoryError.classList.remove("hidden"); }
        }
        return;
      }

      state.transactions.push({
        id: crypto.randomUUID(),
        name: name.trim(),
        amount: Number(amount),
        category
      });
      saveTransactions();
      render();

      form.reset();
      const sel = document.getElementById("category-select");
      if (sel) sel.value = "";
    });
  }

  // Add-category form submit
  const addCategoryForm = document.getElementById("add-category-form");
  if (addCategoryForm) {
    addCategoryForm.addEventListener("submit", function(e) {
      e.preventDefault();
      const input = document.getElementById("new-category-name");
      const errorEl = document.getElementById("category-name-error");
      const name = input ? input.value : "";

      if (errorEl) { errorEl.textContent = ""; errorEl.classList.add("hidden"); }

      const result = validateCategoryName(name);
      if (!result.valid) {
        if (errorEl) { errorEl.textContent = result.error; errorEl.classList.remove("hidden"); }
        return;
      }

      addCategory(name);
      if (input) input.value = "";
    });
  }

  // Delete via event delegation
  const transactionList = document.getElementById("transaction-list");
  if (transactionList) {
    transactionList.addEventListener("click", function(e) {
      const target = e.target.closest("[data-id]");
      if (target) deleteTransaction(target.getAttribute("data-id"));
    });
  }

  // Sort change
  const sortSelect = document.getElementById("sort-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", function() {
      setSortOrder(sortSelect.value);
    });
  }

  // Theme toggle
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }
}

// ---------------------------------------------------------------------------
// Balance
// ---------------------------------------------------------------------------

/**
 * Pure function: returns the sum of all transaction amounts.
 * @param {Array<{amount: number}>} transactions
 * @returns {number}
 */
export function computeBalance(transactions) {
  return transactions.reduce(function(sum, t) { return sum + t.amount; }, 0);
}

function renderBalance() {
  const total = computeBalance(state.transactions);
  const el = document.getElementById("balance-display");
  if (el) el.textContent = "$" + total.toFixed(2);
}

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------

function render() {
  renderBalance();
  renderTransactionList();
  renderChart();
  renderCategoryDropdown();

  const sortSelect = document.getElementById("sort-select");
  if (sortSelect) sortSelect.value = state.sortOrder;

  const storageWarning = document.getElementById("storage-warning");
  if (storageWarning) {
    if (state.storageWarning) {
      storageWarning.classList.remove("hidden");
    } else {
      storageWarning.classList.add("hidden");
    }
  }
}

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", function() {
  loadState();
  applyTheme(state.theme);
  render();
  initEventListeners();
});
