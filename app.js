const categories = [
  { id: 'food', label: 'Food', color: '#B5563C', tint: '#F6E5DF' },
  { id: 'transport', label: 'Transport', color: '#C99A2E', tint: '#F6EEDA' },
  { id: 'bills', label: 'Bills', color: '#355E3B', tint: '#E5EEE2' },
  { id: 'shopping', label: 'Shopping', color: '#6B5B95', tint: '#E9E5F1' },
  { id: 'health', label: 'Health', color: '#3C7A89', tint: '#DFEAEC' },
  { id: 'other', label: 'Other', color: '#9A9486', tint: '#EFEDE7' },
];

const STORAGE_KEY = 'tally-expenses-v1';
const BUDGET_KEY = 'tally-budget-v1';
const INCOME_KEY = 'tally-income-v1';
const THEME_KEY = 'tally-theme-v1';
const CAT_BUDGET_KEY = 'tally-cat-budget-v1';

let expenses = loadExpenses();
let budgets = loadBudgets();
let incomes = loadIncomes();
let catBudgets = loadCatBudgets();
let currentMonth = new Date();
currentMonth.setDate(1);

let trendChart = null;
let selectedCategory = categories[0].id;
let editingId = null;
let searchTerm = '';
let filterCategoryValue = 'all';
let activeTab = 'dashboard';

function loadExpenses() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return seedData();
}

function loadBudgets() {
  try {
    const raw = localStorage.getItem(BUDGET_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {};
}

function persistExpenses() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

function persistBudgets() {
  localStorage.setItem(BUDGET_KEY, JSON.stringify(budgets));
}

function loadIncomes() {
  try {
    const raw = localStorage.getItem(INCOME_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {};
}

function persistIncomes() {
  localStorage.setItem(INCOME_KEY, JSON.stringify(incomes));
}

function loadCatBudgets() {
  try {
    const raw = localStorage.getItem(CAT_BUDGET_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {};
}

function persistCatBudgets() {
  localStorage.setItem(CAT_BUDGET_KEY, JSON.stringify(catBudgets));
}

function loadTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || 'light';
  } catch (e) {
    return 'light';
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.getElementById('themeToggle').classList.toggle('on', theme === 'dark');
  localStorage.setItem(THEME_KEY, theme);
}

function seedData() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const pad = (n) => String(n).padStart(2, '0');
  const d = (day) => `${y}-${pad(m + 1)}-${pad(day)}`;
  return [
    { id: cryptoId(), amount: 420, note: 'Groceries', category: 'food', date: d(2) },
    { id: cryptoId(), amount: 180, note: 'Auto fare', category: 'transport', date: d(3) },
    { id: cryptoId(), amount: 1499, note: 'Electricity bill', category: 'bills', date: d(5) },
    { id: cryptoId(), amount: 650, note: 'Dinner with friends', category: 'food', date: d(7) },
    { id: cryptoId(), amount: 2200, note: 'New shoes', category: 'shopping', date: d(9) },
    { id: cryptoId(), amount: 300, note: 'Pharmacy', category: 'health', date: d(12) },
    { id: cryptoId(), amount: 90, note: 'Coffee', category: 'food', date: d(14) },
    { id: cryptoId(), amount: 540, note: 'Cab to airport', category: 'transport', date: d(16) },
    { id: cryptoId(), amount: 1200, note: 'Internet bill', category: 'bills', date: d(18) },
    { id: cryptoId(), amount: 75, note: 'Snacks', category: 'food', date: d(20) },
  ];
}

function cryptoId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function monthKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function formatMonth(date) {
  return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

function formatCurrency(n) {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

function getCategory(id) {
  return categories.find((c) => c.id === id) || categories[categories.length - 1];
}

function expensesForMonth(date) {
  const y = date.getFullYear();
  const m = date.getMonth();
  return expenses.filter((e) => {
    const ed = new Date(e.date + 'T00:00:00');
    return ed.getFullYear() === y && ed.getMonth() === m;
  });
}

function renderCategoryPicker() {
  const wrap = document.getElementById('catPick');
  wrap.innerHTML = '';
  categories.forEach((cat) => {
    const chip = document.createElement('div');
    chip.className = 'cat-chip' + (cat.id === selectedCategory ? ' active' : '');
    chip.innerHTML = `<span class="dot" style="background:${cat.color}"></span>${cat.label}`;
    chip.addEventListener('click', () => {
      selectedCategory = cat.id;
      renderCategoryPicker();
    });
    wrap.appendChild(chip);
  });
}

function populateFilterCategories() {
  const select = document.getElementById('filterCategory');
  const current = select.value;
  select.innerHTML = '<option value="all">All categories</option>' + categories.map((c) => `<option value="${c.id}">${c.label}</option>`).join('');
  select.value = current || 'all';
}

function daysInMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function renderSummary() {
  const monthExpenses = expensesForMonth(currentMonth);
  const total = monthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const today = new Date();
  const isCurrentMonth = monthKey(today) === monthKey(currentMonth);
  const daysElapsed = isCurrentMonth ? today.getDate() : daysInMonth(currentMonth);
  const avg = daysElapsed > 0 ? total / daysElapsed : 0;

  const byCategory = {};
  monthExpenses.forEach((e) => {
    byCategory[e.category] = (byCategory[e.category] || 0) + Number(e.amount);
  });
  let topCat = null;
  let topAmt = 0;
  Object.entries(byCategory).forEach(([id, amt]) => {
    if (amt > topAmt) {
      topAmt = amt;
      topCat = id;
    }
  });

  const budget = budgets[monthKey(currentMonth)] || 0;
  const remaining = budget - total;
  const overBudget = budget > 0 && remaining < 0;
  const income = incomes[monthKey(currentMonth)] || 0;
  const balance = income - total;

  const row = document.getElementById('summaryRow');
  row.innerHTML = `
    <div class="stat-card">
      <p class="label">Total spent</p>
      <p class="value">${formatCurrency(total)}</p>
      <p class="sub">${monthExpenses.length} transaction${monthExpenses.length === 1 ? '' : 's'}</p>
    </div>
    <div class="stat-card">
      <p class="label">Daily average</p>
      <p class="value">${formatCurrency(avg)}</p>
      <p class="sub">across ${daysElapsed} day${daysElapsed === 1 ? '' : 's'}</p>
    </div>
    <div class="stat-card">
      <p class="label">Top category</p>
      <p class="value" style="font-size:22px;">${topCat ? getCategory(topCat).label : '—'}</p>
      <p class="sub">${topCat ? formatCurrency(topAmt) + ' so far' : 'No spending yet'}</p>
    </div>
    <div class="stat-card ${overBudget ? 'warn' : ''}">
      <p class="label">${budget > 0 ? 'Budget remaining' : 'Budget'}</p>
      <p class="value">${budget > 0 ? formatCurrency(Math.abs(remaining)) : 'Not set'}</p>
      <p class="sub">${budget > 0 ? (overBudget ? 'over this month\'s budget' : 'left of ' + formatCurrency(budget)) : 'Set one below'}</p>
      ${budget > 0 ? `<div class="budget-bar"><div class="budget-bar-fill ${overBudget ? 'over' : ''}" style="width:${Math.min(100, (total / budget) * 100)}%"></div></div>` : ''}
    </div>
    <div class="stat-card balance">
      <p class="label">Net balance</p>
      <p class="value ${income > 0 ? (balance < 0 ? 'negative' : 'positive') : ''}">${income > 0 ? formatCurrency(balance) : '—'}</p>
      <p class="sub">${income > 0 ? 'income minus spending' : 'add income to see this'}</p>
    </div>
  `;

  const budgetInput = document.getElementById('budgetInput');
  budgetInput.value = budget || '';
  const incomeInput = document.getElementById('incomeInput');
  incomeInput.value = income || '';
}

let catChartInstances = {};

function renderCategoryChart() {
  renderCategoryChartInto('catChart', 'catLegend');
  renderCategoryChartInto('catChart2', 'catLegend2');
}

function renderCategoryChartInto(canvasId, legendId) {
  const canvasEl = document.getElementById(canvasId);
  if (!canvasEl) return;

  const monthExpenses = expensesForMonth(currentMonth);
  const byCategory = {};
  categories.forEach((c) => (byCategory[c.id] = 0));
  monthExpenses.forEach((e) => {
    byCategory[e.category] = (byCategory[e.category] || 0) + Number(e.amount);
  });

  const activeCats = categories.filter((c) => byCategory[c.id] > 0);
  const labels = activeCats.map((c) => c.label);
  const data = activeCats.map((c) => byCategory[c.id]);
  const colors = activeCats.map((c) => c.color);

  const legend = document.getElementById(legendId);
  const total = data.reduce((a, b) => a + b, 0);

  if (catChartInstances[canvasId]) {
    catChartInstances[canvasId].destroy();
    catChartInstances[canvasId] = null;
  }

  if (activeCats.length === 0) {
    legend.innerHTML = '<span style="color:var(--muted)">No spending logged this month</span>';
    return;
  }

  legend.innerHTML = activeCats
    .map((c) => {
      const pct = total > 0 ? Math.round((byCategory[c.id] / total) * 100) : 0;
      return `<span class="legend-item"><span class="dot" style="background:${c.color}"></span>${c.label} ${pct}%</span>`;
    })
    .join('');

  catChartInstances[canvasId] = new Chart(canvasEl, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors,
          borderRadius: 4,
          maxBarThickness: 28,
        },
      ],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (item) => formatCurrency(item.raw),
          },
        },
      },
      scales: {
        x: {
          grid: { color: '#E5E0D3' },
          ticks: { color: '#9A9486', font: { size: 11 }, callback: (v) => '₹' + v },
        },
        y: {
          grid: { display: false },
          ticks: { color: '#232821', font: { size: 12, weight: 500 } },
        },
      },
    },
  });
}

function renderTrendChart() {
  const monthExpenses = expensesForMonth(currentMonth);
  const totalDays = daysInMonth(currentMonth);
  const dailyTotals = new Array(totalDays).fill(0);

  monthExpenses.forEach((e) => {
    const day = new Date(e.date + 'T00:00:00').getDate();
    dailyTotals[day - 1] += Number(e.amount);
  });

  const cumulative = [];
  let running = 0;
  dailyTotals.forEach((amt) => {
    running += amt;
    cumulative.push(running);
  });

  const labels = Array.from({ length: totalDays }, (_, i) => i + 1);

  const ctx = document.getElementById('trendChart');
  if (trendChart) trendChart.destroy();

  trendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          data: cumulative,
          borderColor: '#355E3B',
          backgroundColor: 'rgba(53,94,59,0.08)',
          fill: true,
          tension: 0.3,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: '#355E3B',
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (items) => `Day ${items[0].label}`,
            label: (item) => formatCurrency(item.raw) + ' cumulative',
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#9A9486', font: { size: 10 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 8 },
        },
        y: {
          grid: { color: '#E5E0D3' },
          ticks: { color: '#9A9486', font: { size: 11 }, callback: (v) => '₹' + v },
        },
      },
    },
  });
}

function renderTransactions() {
  const monthExpenses = expensesForMonth(currentMonth).slice().sort((a, b) => (a.date < b.date ? 1 : -1));
  const term = searchTerm.trim().toLowerCase();
  const filtered = monthExpenses.filter((e) => {
    const matchesTerm = !term || e.note.toLowerCase().includes(term);
    const matchesCategory = filterCategoryValue === 'all' || e.category === filterCategoryValue;
    return matchesTerm && matchesCategory;
  });

  const list = document.getElementById('txList');
  const countLabel = document.getElementById('txCount');

  countLabel.textContent = monthExpenses.length
    ? `${monthExpenses.length} transaction${monthExpenses.length === 1 ? '' : 's'} this month`
    : 'Nothing logged this month yet';

  if (monthExpenses.length === 0) {
    list.innerHTML = '<div class="empty">Add your first expense above to see it here</div>';
    return;
  }

  if (filtered.length === 0) {
    list.innerHTML = '<div class="empty">No transactions match your search</div>';
    return;
  }

  let html = '';
  let lastDate = null;
  filtered.forEach((e) => {
    if (e.date !== lastDate) {
      const dateObj = new Date(e.date + 'T00:00:00');
      const label = dateObj.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
      html += `<div class="tx-day-label">${label}</div>`;
      lastDate = e.date;
    }
    const cat = getCategory(e.category);
    html += `
      <div class="tx-row">
        <div class="tx-icon" style="background:${cat.tint}; color:${cat.color}">${cat.label[0]}</div>
        <div class="tx-info">
          <p class="tx-note">${escapeHtml(e.note)}</p>
          <p class="tx-cat">${cat.label}</p>
        </div>
        <div class="tx-amount">${formatCurrency(e.amount)}</div>
        <div class="tx-actions">
          <button class="tx-edit" data-id="${e.id}" aria-label="Edit expense">Edit</button>
          <button class="tx-del" data-id="${e.id}" aria-label="Delete expense">Remove</button>
        </div>
      </div>
    `;
  });

  list.innerHTML = html;

  list.querySelectorAll('.tx-del').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      expenses = expenses.filter((e) => e.id !== id);
      persistExpenses();
      if (editingId === id) cancelEdit();
      renderAll();
    });
  });

  list.querySelectorAll('.tx-edit').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      startEdit(id);
    });
  });
}

function startEdit(id) {
  const expense = expenses.find((e) => e.id === id);
  if (!expense) return;
  editingId = id;
  document.getElementById('amountInput').value = expense.amount;
  document.getElementById('noteInput').value = expense.note;
  document.getElementById('dateInput').value = expense.date;
  selectedCategory = expense.category;
  renderCategoryPicker();
  document.getElementById('editBanner').classList.remove('hidden');
  document.getElementById('submitBtn').textContent = 'Update expense';
  document.getElementById('expenseForm').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function cancelEdit() {
  editingId = null;
  document.getElementById('expenseForm').reset();
  const today = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  document.getElementById('dateInput').value = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  selectedCategory = categories[0].id;
  renderCategoryPicker();
  document.getElementById('editBanner').classList.add('hidden');
  document.getElementById('submitBtn').textContent = 'Add expense';
}

function renderDashboardActivity() {
  const monthExpenses = expensesForMonth(currentMonth).slice().sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 5);
  const list = document.getElementById('dashTxList');
  const countLabel = document.getElementById('dashTxCount');

  countLabel.textContent = monthExpenses.length ? 'Last 5 logged this month' : 'Nothing logged this month yet';

  if (monthExpenses.length === 0) {
    list.innerHTML = '<div class="empty">Add your first expense to see it here</div>';
    return;
  }

  list.innerHTML = monthExpenses
    .map((e) => {
      const cat = getCategory(e.category);
      const dateObj = new Date(e.date + 'T00:00:00');
      const label = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      return `
        <div class="tx-row">
          <div class="tx-icon" style="background:${cat.tint}; color:${cat.color}">${cat.label[0]}</div>
          <div class="tx-info">
            <p class="tx-note">${escapeHtml(e.note)}</p>
            <p class="tx-cat">${cat.label} · ${label}</p>
          </div>
          <div class="tx-amount">${formatCurrency(e.amount)}</div>
        </div>
      `;
    })
    .join('');
}

function renderCatBudgets() {
  const wrap = document.getElementById('catBudgetList');
  const monthExpenses = expensesForMonth(currentMonth);
  const byCategory = {};
  monthExpenses.forEach((e) => {
    byCategory[e.category] = (byCategory[e.category] || 0) + Number(e.amount);
  });
  const key = monthKey(currentMonth);
  const stored = catBudgets[key] || {};

  wrap.innerHTML = categories
    .map((c) => {
      const spent = byCategory[c.id] || 0;
      const cap = stored[c.id] || '';
      const over = cap && spent > Number(cap);
      return `
        <div class="cat-budget-row">
          <span class="dot" style="background:${c.color}"></span>
          <span class="cat-budget-label">${c.label}<br><span style="font-weight:400; color:var(--muted); font-size:12px;">${formatCurrency(spent)} spent${cap ? (over ? ' · over cap' : '') : ''}</span></span>
          <input type="number" min="0" step="100" placeholder="No cap" value="${cap}" data-cat="${c.id}" class="cat-budget-input" style="${over ? 'border-color:var(--rust);' : ''}">
        </div>
      `;
    })
    .join('');

  wrap.querySelectorAll('.cat-budget-input').forEach((input) => {
    input.addEventListener('change', (e) => {
      const catId = e.target.getAttribute('data-cat');
      const value = Number(e.target.value) || 0;
      if (!catBudgets[key]) catBudgets[key] = {};
      if (value > 0) {
        catBudgets[key][catId] = value;
      } else {
        delete catBudgets[key][catId];
      }
      persistCatBudgets();
      renderCatBudgets();
    });
  });
}

function renderInsights() {
  const monthExpenses = expensesForMonth(currentMonth);
  const wrap = document.getElementById('insightsList');

  if (monthExpenses.length === 0) {
    wrap.innerHTML = '<p class="insight-line">Log a few expenses this month to see insights here.</p>';
    return;
  }

  const total = monthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const byCategory = {};
  monthExpenses.forEach((e) => {
    byCategory[e.category] = (byCategory[e.category] || 0) + Number(e.amount);
  });
  let topCat = null;
  let topAmt = 0;
  Object.entries(byCategory).forEach(([id, amt]) => {
    if (amt > topAmt) {
      topAmt = amt;
      topCat = id;
    }
  });
  const topPct = total > 0 ? Math.round((topAmt / total) * 100) : 0;

  const today = new Date();
  const isCurrentMonth = monthKey(today) === monthKey(currentMonth);
  const daysElapsed = isCurrentMonth ? today.getDate() : daysInMonth(currentMonth);
  const avg = daysElapsed > 0 ? total / daysElapsed : 0;
  const projected = avg * daysInMonth(currentMonth);

  const budget = budgets[monthKey(currentMonth)] || 0;
  const largest = monthExpenses.slice().sort((a, b) => b.amount - a.amount)[0];

  let lines = [];
  lines.push(`<strong>${getCategory(topCat).label}</strong> is your biggest category this month at ${topPct}% of total spending.`);
  lines.push(`Your single largest expense was <strong>${formatCurrency(largest.amount)}</strong> for ${escapeHtml(largest.note)}.`);
  if (isCurrentMonth) {
    lines.push(`At the current pace, you're on track to spend about <strong>${formatCurrency(projected)}</strong> by month end.`);
  }
  if (budget > 0) {
    if (projected > budget && isCurrentMonth) {
      lines.push(`That projected pace is <strong>${formatCurrency(projected - budget)}</strong> over your budget of ${formatCurrency(budget)}.`);
    } else if (total > budget) {
      lines.push(`You've gone <strong>${formatCurrency(total - budget)}</strong> over your budget of ${formatCurrency(budget)}.`);
    } else {
      lines.push(`You're within budget, with <strong>${formatCurrency(budget - total)}</strong> left.`);
    }
  }

  wrap.innerHTML = lines.map((l) => `<p class="insight-line">${l}</p>`).join('');
}

function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tab);
  });
  document.querySelectorAll('.tab-panel').forEach((panel) => {
    panel.classList.toggle('active', panel.id === `tab-${tab}`);
  });
  if (tab === 'insights') {
    renderTrendChart();
    renderCategoryChartInto('catChart2', 'catLegend2');
    renderInsights();
  }
}



function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function exportCsv() {
  const monthExpenses = expensesForMonth(currentMonth).slice().sort((a, b) => (a.date < b.date ? -1 : 1));
  if (monthExpenses.length === 0) return;
  const rows = [['Date', 'Note', 'Category', 'Amount']];
  monthExpenses.forEach((e) => {
    rows.push([e.date, e.note, getCategory(e.category).label, e.amount]);
  });
  const csv = rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tally-${monthKey(currentMonth)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function renderAll() {
  document.getElementById('monthLabel').textContent = formatMonth(currentMonth);
  renderSummary();
  renderCategoryChart();
  renderTrendChart();
  renderTransactions();
  renderDashboardActivity();
  renderCatBudgets();
  if (activeTab === 'insights') renderInsights();
}

document.getElementById('expenseForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const amount = Number(document.getElementById('amountInput').value);
  const note = document.getElementById('noteInput').value.trim();
  const date = document.getElementById('dateInput').value;
  if (!amount || !note || !date) return;

  if (editingId) {
    const expense = expenses.find((ex) => ex.id === editingId);
    if (expense) {
      expense.amount = amount;
      expense.note = note;
      expense.category = selectedCategory;
      expense.date = date;
    }
    persistExpenses();
    cancelEdit();
  } else {
    expenses.push({
      id: cryptoId(),
      amount,
      note,
      category: selectedCategory,
      date,
    });
    persistExpenses();
    document.getElementById('expenseForm').reset();
    document.getElementById('dateInput').value = date;
  }

  const enteredDate = new Date(date + 'T00:00:00');
  currentMonth = new Date(enteredDate.getFullYear(), enteredDate.getMonth(), 1);
  renderAll();
});

document.getElementById('cancelEdit').addEventListener('click', () => {
  cancelEdit();
});

document.getElementById('saveBudget').addEventListener('click', () => {
  const value = Number(document.getElementById('budgetInput').value) || 0;
  budgets[monthKey(currentMonth)] = value;
  persistBudgets();
  renderSummary();
});

document.getElementById('saveIncome').addEventListener('click', () => {
  const value = Number(document.getElementById('incomeInput').value) || 0;
  incomes[monthKey(currentMonth)] = value;
  persistIncomes();
  renderSummary();
});

document.getElementById('prevMonth').addEventListener('click', () => {
  currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
  cancelEdit();
  renderAll();
});

document.getElementById('nextMonth').addEventListener('click', () => {
  currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
  cancelEdit();
  renderAll();
});

document.getElementById('exportCsv').addEventListener('click', exportCsv);

document.querySelectorAll('.tab-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    switchTab(btn.getAttribute('data-tab'));
  });
});

document.getElementById('resetData').addEventListener('click', () => {
  const confirmed = window.confirm('This clears every expense, budget, and income entry on this device. This cannot be undone. Continue?');
  if (!confirmed) return;
  expenses = [];
  budgets = {};
  incomes = {};
  catBudgets = {};
  persistExpenses();
  persistBudgets();
  persistIncomes();
  persistCatBudgets();
  cancelEdit();
  renderAll();
});

document.getElementById('themeToggle').addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

document.getElementById('searchInput').addEventListener('input', (e) => {
  searchTerm = e.target.value;
  renderTransactions();
});

document.getElementById('filterCategory').addEventListener('change', (e) => {
  filterCategoryValue = e.target.value;
  renderTransactions();
});

function init() {
  const today = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  document.getElementById('dateInput').value = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  applyTheme(loadTheme());
  renderCategoryPicker();
  populateFilterCategories();
  renderAll();
}

init();
