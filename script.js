let expenses = [];
let expenseForm = document.getElementById("expense-form");
let expenseName = document.getElementById("expense-name");
let expenseAmount = document.getElementById("expense-amount");
let expenseCategory = document.getElementById("expense-category");
const expenseList = document.getElementById("expense-list");
const filterCategory = document.getElementById("filter-category");
const clearBtn = document.getElementById("clear-btn");
const transactionType = document.getElementById("transaction-type");

function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function renderDashboard() {
  const activeFilter = filterCategory.value;
  let displayExpenses = expenses;
  if (activeFilter !== "All") {
    displayExpenses = expenses.filter(function (expense) {
      return expense.category === activeFilter;
    });
  }
  expenseList.innerHTML = "";
  displayExpenses.forEach(function (expense) {
    const li = document.createElement("li");

    let sign = "-";
    let textColor = "#f43f5e";

    if (expense.type === "income") {
      sign = "+";
      textColor = "#10b981";
    }

    li.innerHTML = `
          <div style="display: flex; align-items: center; gap: 2rem; flex: 1;">
            
            <div style="display: flex; flex-direction: column; gap: 0.3rem; width: 75px; flex-shrink: 0;">
              <span class="expense-date" style="font-size: 0.8rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; line-height: 1;">${formatDate(expense.id)}</span>
              <span class="expense-tag" style="font-size: 0.75rem; color: var(--text-muted); background: #334155; padding: 2px 6px; border-radius: 12px; display: inline-block; width: max-content;">${expense.category}</span>
            </div>

            <span class="expense-title" style="font-weight: 500; font-size: 0.95rem; color: var(--text-main);">
              ${expense.name}
            </span>

          </div>

          <div style="display: flex; align-items: center; gap: 1rem; flex-shrink: 0;">
            <strong class="expense-value" style="color: ${textColor}; font-size: 1.1rem;">${sign}$${expense.amount.toFixed(2)}</strong>
            <button class="btn-delete" onclick="deleteExpense(${expense.id})" style="background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.1rem;">&times;</button>
          </div>
        `;
    expenseList.appendChild(li);
  });
  let totalIncome = 0;
  let totalExpense = 0;
  displayExpenses.forEach(function (item) {
    if (item.type === "income") {
      totalIncome += item.amount;
    } else {
      totalExpense += item.amount;
    }
  });
  let netBalance = totalIncome - totalExpense;
  document.getElementById("total-income").innerText = totalIncome.toFixed(2);
  document.getElementById("total-expense").innerText = totalExpense.toFixed(2);
  document.getElementById("total-amount").innerText = netBalance.toFixed(2);
  const budgetLimit = 1000;
  const visualPercentage = Math.min((totalExpense / budgetLimit) * 100, 100);
  const truePercentage = (totalExpense / budgetLimit) * 100;

  document.getElementById("budget-percentage").innerText =
    truePercentage.toFixed(0);
  const barFill = document.getElementById("progress-bar-fill");

  barFill.style.width = visualPercentage + "%";

  if (truePercentage >= 100) {
    barFill.style.backgroundColor = "#f43f5e";
  } else if (truePercentage >= 70) {
    barFill.style.backgroundColor = "#f59e0b";
  } else {
    barFill.style.backgroundColor = "#10b981";
  }
}

function deleteExpense(id) {
  expenses = expenses.filter(function (expense) {
    return expense.id !== id;
  });
  saveData();
  renderDashboard();
}

expenseForm.addEventListener("submit", function (e) {
  e.preventDefault();
  console.log("testing");

  const newExpense = {
    id: Date.now(),
    name: expenseName.value,
    amount: parseFloat(expenseAmount.value),
    category: expenseCategory.value,
    type: transactionType.value,
  };

  expenses.push(newExpense);
  saveData();
  renderDashboard();
  console.log(expenses);
  expenseForm.reset();
});

function saveData() {
  localStorage.setItem("myExpenses", JSON.stringify(expenses));
}

function loadData() {
  let savedData = localStorage.getItem("myExpenses");

  if (savedData) {
    expenses = JSON.parse(savedData);
  }
  renderDashboard();
}

filterCategory.addEventListener("change", function () {
  renderDashboard();
});

clearBtn.addEventListener("click", function () {
  if (confirm("Are you sure you want to completely clear your ledger?")) {
    expenses = [];
    localStorage.removeItem("myExpenses");
    renderDashboard();
  }
});

loadData();
