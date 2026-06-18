
const SUPABASE_URL = "https://bfvosnflupzngvepkadc.supabase.co";
const SUPABASE_KEY = "sb_publishable_tVHWI7OLSRjeGldt9bPiIQ_aHPNewe6";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Monitor Authentication State changes (Sign In / Sign Out)
supabaseClient.auth.onAuthStateChange((event, session) => {
  const authContainer = document.getElementById("auth-container");
  const appContainer = document.getElementById("app-container");

  if (session) {
    authContainer.style.display = "none";
    appContainer.style.display = "block";
    console.log("Logged in user:", session.user.email);
  } else {
    authContainer.style.display = "block";
    appContainer.style.display = "none";

    console.log("No active user session.");
  }
});

const channel = supabaseClient
  .channel("custom-all-channel")
  .on(
    "postgres_changes",
    { event: "INSERT", schema: "public", table: "transactions" },
    (payload) => {
      console.log("New transaction detected!", payload);
      // Add the new row to your local array and refresh the UI
      expenses.push(payload.new);
      renderDashboard();
    },
  )
  .subscribe();


window.addEventListener('load', async () => {
  const { data, error } = await supabaseClient.auth.getSession();
  
  if (data.session) {
    renderDashboard(); 
  }
});

let expenses = [];
let expenseForm = document.getElementById("expense-form");
let expenseName = document.getElementById("expense-name");
let expenseAmount = document.getElementById("expense-amount");
let expenseCategory = document.getElementById("expense-category");
const expenseList = document.getElementById("expense-list");
const 

filterCategory = document.getElementById("filter-category");
const clearBtn = document.getElementById("clear-btn");
const transactionType = document.getElementById("transaction-type");
const btnSignUp = document.getElementById("btn-signup");
const email = document.getElementById("email");
const password = document.getElementById("password");
const loginForm = document.getElementById("login-form");
const btnGitHubSSO = document.getElementById("btn-github-sso");
const btnLogout = document.getElementById("btn-logout");
const btnGoogleSSO = document.getElementById("btn-google-sso")
function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}


 
function checkBudgetWarning() {
  const budgetLimit = parseFloat(document.getElementById("budget-limit-text").innerText);
  const totalIncome = parseFloat(document.getElementById("total-income").innerText);
  const warningElement = document.getElementById("budget-warning");

  if (budgetLimit > totalIncome) {
    warningElement.style.display = "block";
  } else {
    warningElement.style.display = "none";
  }
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
  const budgetLimit =
    parseFloat(document.getElementById("budget-limit-text").innerText) || 1000;

  const truePercentage =
    budgetLimit > 0 ? (totalExpense / budgetLimit) * 100 : 0;
  const visualPercentage = Math.min(truePercentage, 100);

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

  let netBalance = totalIncome - totalExpense;
  document.getElementById("total-income").innerText = totalIncome.toFixed(2);
  document.getElementById("total-expense").innerText = totalExpense.toFixed(2);
  document.getElementById("total-amount").innerText = netBalance.toFixed(2);
   
 checkBudgetWarning();
}

async function fetchTransactions() {
  const {
    data: { session },
  } = await supabaseClient.auth.getSession();
  if (!session) return;

  const { data, error } = await supabaseClient
    .from("transactions")
    .select("*")
    .eq("user_id", session.user.id); // Only fetch YOUR data

  if (error) {
    console.error("Error fetching data:", error);
  } else {
    // Replace the local array with the data from the cloud
    expenses = data;
    renderDashboard();
  }
}

function deleteExpense(id) {
  expenses = expenses.filter(function (expense) {
    return expense.id !== id;
  });
  renderDashboard();
}
//Submitting transaction form
expenseForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  const {
    data: { session },
    error: sessionError,
  } = await supabaseClient.auth.getSession();

  if (sessionError || !session) {
    alert("No active session found. Please log in again.");
    return;
  }

  const newTransaction = {
    name: expenseName.value,
    amount: parseFloat(expenseAmount.value),
    category: expenseCategory.value,
    type: transactionType.value,
    user_id: session.user.id,
  };

  const { data, error } = await supabaseClient
    .from("transactions")
    .insert([newTransaction])
    .select();

  if (error) {
    alert("Failed to save transaction: " + error.message);
    console.error(error);
  } else {
    console.log("Saved to cloud successfully:", data);
    expenses.push(data[0]);
    renderDashboard();
    expenseForm.reset();
  }
});

filterCategory.addEventListener("change", function () {
  renderDashboard();
});
//Button Function
clearBtn.addEventListener("click", async () => {
  if (confirm("Are you sure you want to completely clear your ledger from the cloud?")) {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) return;
    const { error } = await supabaseClient
      .from("transactions")
      .delete()
      .eq("user_id", session.user.id);
    if (error) {
      alert("Failed to clear ledger: " + error.message);
      return;
    }
    expenses = [];
    renderDashboard();
    console.log("Ledger cleared from cloud and local storage.");
  }
});
//Login form Logic
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault(); // Stop the page from reloading

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  });

  if (error) {
    alert("Login failed: " + error.message);
  } else {
    console.log("Logged in successfully!", data);
  }
});

//Sign up button
btnSignUp.addEventListener("click", async (e) => {
  e.preventDefault();

  const { data, error } = await supabaseClient.auth.signUp({
    email: email.value,
    password: password.value,
  });

  if (error) {
    alert("Signup failed: " + error.message);
  } else {
    alert("Signup successful! Check your email for a confirmation link.");
  }
});


//GitHub SSO button
btnGitHubSSO.addEventListener("click", async () => {
  const { data, error } = await supabaseClient.auth.signInWithOAuth({
    provider: "github",
    options: {
      // Redirects right back to your tracker after they approve github access!
      redirectTo: window.location.origin + window.location.pathname,
    },
  });

  if (error) {
    alert("SSO Login failed: " + error.message);
  }
});

btnGoogleSSO.addEventListener("click", async () => {
  const { error } = await supabaseClient.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin + window.location.pathname,
    },
  });

  if (error) {
    console.error("Error logging in with Google:", error.message);
    alert("Login failed.");
  }
});

//Fetch Transaction
async function fetchTransactions() {
  const {
    data: { session },
  } = await supabaseClient.auth.getSession();
  if (!session) return;

  const { data, error } = await supabaseClient
    .from("transactions")
    .select("*")
    .eq("user_id", session.user.id); // Only fetch YOUR data

  if (error) {
    console.error("Error fetching data:", error);
  } else {
    // Replace the local array with the data from the cloud
    expenses = data;
    renderDashboard();
  }
}
//Log out
btnLogout.addEventListener("click", async () => {
  // 1. Tell Supabase to destroy the session
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    console.error("Error logging out:", error);
  } else {
    expenses = [];
    renderDashboard();
    window.location.reload();
  }
});

//Fetch Budget
async function fetchBudget() {
  const {
    data: { session },
  } = await supabaseClient.auth.getSession();
  const { data, error } = await supabaseClient
    .from("user_settings")
    .select("monthly_budget")
    .eq("user_id", session.user.id)
    .single();

  if (data) {
    document.getElementById("budget-limit-text").innerText =
      data.monthly_budget.toFixed(2);
    return data.monthly_budget;
  }
  return 0;
}
//Update Budget
document.getElementById("btn-update-budget").addEventListener("click", async () => {
  const btn = document.getElementById('btn-update-budget');
  const originalText = btn.innerText;

  btn.innerText = "Saving...";
  btn.disabled = true;

  const newLimit = parseFloat(document.getElementById("budget-input").value);
  const { data: { session } } = await supabaseClient.auth.getSession();
  const { error } = await supabaseClient
    .from("user_settings")
    .upsert({ user_id: session.user.id, monthly_budget: newLimit });
  btn.innerText = originalText;
  btn.disabled = false;

  if (!error) {
    document.getElementById("budget-limit-text").innerText = newLimit.toFixed(2);
    renderDashboard();
  }
});

 
fetchTransactions();
