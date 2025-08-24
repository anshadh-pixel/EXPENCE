// ===== Config =====
const CURRENCY = "₹";

// ===== State =====
let balance = 0;
let totalIncome = 0;
let totalExpense = 0;

const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("totalIncome");
const expenseEl = document.getElementById("totalExpense");
const listEl = document.getElementById("list");
const addBtn = document.getElementById("addBtn");
const reportBtn = document.getElementById("reportBtn");
const closeModalBtn = document.getElementById("closeModal");

let transactions = JSON.parse(localStorage.getItem("transactions") || "[]");

// ===== Utils =====
const fmt = n => `${CURRENCY}${Number(n).toLocaleString("en-IN")}`;
function save() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

// ===== Init =====
function init() {
  balance = 0; totalIncome = 0; totalExpense = 0;
  listEl.innerHTML = "";
  transactions.forEach(t => {
    if (t.type === "income") { balance += t.amount; totalIncome += t.amount; }
    else { balance -= t.amount; totalExpense += t.amount; }
    renderTransaction(t);
  });
  updateSummary();
}
init();

// ===== Add =====
addBtn.addEventListener("click", addTransaction);
function addTransaction() {
  const noteEl = document.getElementById("note");
  const amtEl = document.getElementById("amount");
  const typeEl = document.getElementById("type");

  const note = (noteEl.value || "").trim();
  const amount = Number(amtEl.value);
  const type = typeEl.value;

  if (!note || !(amount > 0)) {
    alert("Please enter a valid note and amount!");
    return;
  }

  const transaction = {
    id: Date.now(),
    note,
    amount,
    type,
    date: new Date().toISOString()
  };

  transactions.push(transaction);
  if (type === "income") { balance += amount; totalIncome += amount; }
  else { balance -= amount; totalExpense += amount; }
  save();
  updateSummary();
  renderTransaction(transaction);

  noteEl.value = "";
  amtEl.value = "";
}

// ===== Render item =====
function renderTransaction(t) {
  const li = document.createElement("li");
  li.className = t.type;

  const left = document.createElement("div");
  left.className = "item-left";
  const noteSpan = document.createElement("span");
  noteSpan.className = "item-note";
  noteSpan.textContent = t.note;
  const meta = document.createElement("span");
  meta.className = "item-meta";
  const d = new Date(t.date);
  meta.textContent = `${d.toLocaleDateString()} • ${t.type === "income" ? "Income" : "Expense"}`;

  left.appendChild(noteSpan);
  left.appendChild(meta);

  const actions = document.createElement("div");
  actions.className = "actions";

  const amountSpan = document.createElement("span");
  amountSpan.className = "amount";
  amountSpan.textContent = fmt(t.amount);

  const del = document.createElement("button");
  del.className = "delete-btn";
  del.setAttribute("aria-label", "Delete");
  del.textContent = "❌";
  del.addEventListener("click", () => deleteTransaction(t.id));

  actions.appendChild(amountSpan);
  actions.appendChild(del);

  li.appendChild(left);
  li.appendChild(actions);
  listEl.appendChild(li);
}

// ===== Summary =====
function updateSummary() {
  balanceEl.textContent = fmt(balance);
  incomeEl.textContent = fmt(totalIncome);
  expenseEl.textContent = fmt(totalExpense);
}

// ===== Delete =====
function deleteTransaction(id) {
  const t = transactions.find(x => x.id === id);
  if (!t) return;
  if (t.type === "income") { balance -= t.amount; totalIncome -= t.amount; }
  else { balance += t.amount; totalExpense -= t.amount; }
  transactions = transactions.filter(x => x.id !== id);
  save();
  // Re-render list
  listEl.innerHTML = "";
  transactions.forEach(renderTransaction);
  updateSummary();
}

// ===== Monthly Report (Popup) =====
reportBtn.addEventListener("click", openReport);
closeModalBtn.addEventListener("click", closeReport);
document.getElementById("reportModal").addEventListener("click", (e) => {
  if (e.target.id === "reportModal") closeReport();
});

function openReport() {
  const now = new Date();
  const m = now.getMonth();
  const y = now.getFullYear();
  let monthIncome = 0, monthExpense = 0;

  transactions.forEach(t => {
    const d = new Date(t.date);
    if (d.getMonth() === m && d.getFullYear() === y) {
      if (t.type === "income") monthIncome += t.amount;
      else monthExpense += t.amount;
    }
  });

  document.getElementById("monthlyIncome").textContent = fmt(monthIncome);
  document.getElementById("monthlyExpense").textContent = fmt(monthExpense);
  document.getElementById("monthlyBalance").textContent = fmt(monthIncome - monthExpense);

  document.getElementById("reportModal").classList.add("show");
  document.getElementById("reportModal").setAttribute("aria-hidden", "false");
}

function closeReport() {
  document.getElementById("reportModal").classList.remove("show");
  document.getElementById("reportModal").setAttribute("aria-hidden", "true");
}
