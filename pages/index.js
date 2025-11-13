import FormValidator from "../components/FormValidator.js";
import { expenseValidationConfig } from "../utils/constants.js";

document.addEventListener("DOMContentLoaded", () => {
  /* ========= DOM ELEMENTS ========= */
  const sidebarButtons = document.querySelectorAll(".sidebar__btn");
  const allSections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll(".header__nav_bar-item");
  const sections = document.querySelectorAll(".content");

  const expenseForm = document.getElementById("expense__form");

  const expenseFormValidator = new FormValidator(
    expenseValidationConfig,
    expenseForm
  );
  expenseFormValidator.enableValidation();

  const incomeForm = document.getElementById("income__form");
  const incomeInput = document.getElementById("income");
  const incomeValue = document.getElementById("income__value");
  const incomePercent = document.getElementById("income__percent");
  const expenseTotal = document.getElementById("expense__total");
  const userSummary = document.getElementById("user__summary");
  const insightsContent = document.getElementById("insights__content");
  const countryNameEl = document.getElementById("country__name");
  const currencySymbolEl = document.getElementById("currency__symbol");

  // Expenses
  const expenseForm = document.getElementById("expense__form");
  const expenseList = document.getElementById("expense__list");

  // State variables
  let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
  let userIncome = parseFloat(localStorage.getItem("income")) || 0;
  let selectedCountry = localStorage.getItem("country") || "";
  let chartInstance = null;
  let allData = {};
  let currency = "";

  /* ========= SIDEBAR NAVIGATION ========= */
  sidebarButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.section;
      sidebarButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      allSections.forEach((section) => section.classList.remove("active"));
      document.getElementById(target).classList.add("active");
    });
  });

  /* ========= LOAD BENCHMARK DATA ========= */
  fetch("Data-Science/all_country_user_data.json")
    .then((res) => res.json())
    .then((data) => {
      allData = data;
      detectUserCountry();
    })
    .catch((err) => {
      console.error("❌ Error loading data file:", err);
    });

  /* ========= GEOLOCATION DETECTION ========= */
  async function detectUserCountry() {
    try {
      const response = await fetch("https://ipwho.is/");
      const geo = await response.json();
      const countryName = geo.country || "USA";
      const simplified = countryName === "United States" ? "USA" : countryName;
      selectedCountry = simplified;
      localStorage.setItem("country", simplified);

      if (allData[simplified]) {
        const countryData = allData[simplified].country_aggregate_data;
        currency = countryData.Currency || "USD";
        countryNameEl.textContent = simplified;
        currencySymbolEl.textContent = currency;

        const firstUserId = Object.keys(allData[simplified].users)[0];
        const userData = allData[simplified].users[firstUserId];

        renderUserSummary(userData, countryData, firstUserId, simplified);
        renderTotals(userData.total_spending, currency);
        renderCategories(userData.categories, countryData.Categories, currency);
        renderInsights(userData.categories);
        updateIncomeStats();
      } else {
        countryNameEl.textContent = "Unknown";
        currencySymbolEl.textContent = "—";
      }
    } catch (error) {
      console.error("🌍 Geo detection failed:", error);
      countryNameEl.textContent = "Not detected";
      currencySymbolEl.textContent = "USD";
    }
  }

  /* ========= INCOME FORM ========= */
  if (incomeForm) {
    incomeForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const val = parseFloat(incomeInput.value);
      if (!val || val <= 0) {
        alert("Please enter a valid income amount.");
        return;
      }
      userIncome = val;
      localStorage.setItem("income", userIncome);
      incomeValue.textContent = `$${userIncome.toLocaleString()}`;
      updateIncomeStats();
    });
  }

  function updateIncomeStats() {
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    expenseTotal.textContent = `$${totalExpenses.toLocaleString()}`;
    const percent =
      userIncome > 0 ? ((totalExpenses / userIncome) * 100).toFixed(1) : 0;
    incomePercent.textContent = `${percent}%`;
  }

  /* ========= EXPENSE FORM ========= */
  if (expenseForm) {
    expenseForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const category = document.getElementById("category").value;
      const amount = parseFloat(document.getElementById("amount").value);
      const date = document.getElementById("date").value;
      const description = document.getElementById("description").value || "—";
      if (!category || !amount || !date) {
        alert("Please fill all required fields");
        return;
      }

      const newExpense = { category, amount, date, description };
      expenses.push(newExpense);
      localStorage.setItem("expenses", JSON.stringify(expenses));
      expenseForm.reset();
      renderUserExpenses();
      updateIncomeStats();
    });
  }

  function renderUserExpenses() {
    expenseList.innerHTML = "";
    if (expenses.length === 0) {
      expenseList.innerHTML = "<p>No expenses added yet.</p>";
      return;
    }

    expenses.forEach((exp) => {
      const item = document.createElement("div");
      item.classList.add("expense__list_item");
      item.innerHTML = `
        <span><strong>${exp.category}</strong></span>
        <span>${currency} ${exp.amount.toFixed(2)}</span>
        <span>${exp.date}</span>
        <span>${exp.description}</span>
      `;
      expenseList.appendChild(item);
    });
  }

  /* ========= RENDER FUNCTIONS ========= */
  function renderUserSummary(userData, countryData, userId, country) {
    if (!userSummary) return;
    if (!userData || !countryData) {
      userSummary.innerHTML = `<p>No user data available.</p>`;
      return;
    }

    const totalSpending = userData.total_spending || 0;
    const categories = userData.categories || {};
    let topCategory = "—";
    let maxSpend = 0;

    Object.entries(categories).forEach(([cat, info]) => {
      if (info.total_cat_spending > maxSpend) {
        maxSpend = info.total_cat_spending;
        topCategory = cat;
      }
    });

    const overspentCount = Object.values(categories).filter(
      (c) => c.cat_over_benchmark
    ).length;

    userSummary.innerHTML = `
      <div class="user__summary__grid">
        <div><strong>User ID:</strong><br>${userId}</div>
        <div><strong>Total Spending:</strong><br>${
          countryData.Currency
        } ${totalSpending.toLocaleString()}</div>
        <div><strong>Top Category:</strong><br>${topCategory}</div>
        <div><strong>Overspent Categories:</strong><br>${overspentCount}</div>
        <div><strong>Currency:</strong><br>${
          countryData.Currency
        } (${country})</div>
      </div>
    `;
  }

  function renderTotals(totalSpending, currency) {
    expenseList.insertAdjacentHTML(
      "beforebegin",
      `<div class="total__summary">
        <h3>Total Spending</h3>
        <p><strong>${currency} ${totalSpending.toLocaleString()}</strong></p>
      </div>`
    );
  }

  function renderCategories(userCats, benchmarkCats, currency) {
    const categories = Object.keys(userCats);
    const userTotals = [];

    categories.forEach((cat) => {
      const userSpent = userCats[cat].total_cat_spending;
      const benchmarkMean = benchmarkCats[cat]?.mean_spent || 0;
      const over = userCats[cat].cat_over_benchmark;
      const status = over
        ? `<span class="above">↑ Above avg (${benchmarkMean.toFixed(0)})</span>`
        : `<span class="below">↓ Below avg (${benchmarkMean.toFixed(
            0
          )})</span>`;
      const row = document.createElement("div");
      row.classList.add("totals__row");
      row.innerHTML = `<strong>${cat}</strong>: ${currency} ${userSpent.toLocaleString()} ${status}`;
      expenseList.appendChild(row);
      userTotals.push(userSpent);
    });

    drawPieChart(categories, userTotals);
  }

  function drawPieChart(categories, userTotals) {
    const ctx = document.getElementById("pieChart").getContext("2d");
    if (chartInstance) chartInstance.destroy();
    chartInstance = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: categories,
        datasets: [
          {
            label: "Your Spending",
            data: userTotals,
            backgroundColor: [
              "#85BB65B3",
              "#2EC4B6B3",
              "#FF8C42B3",
              "#28A745B3",
              "#DC3545B3",
              "#6EA556B3",
              "#1F2A44B3",
              "#007BFFB3",
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: "Spending by Category" },
          legend: { position: "bottom" },
        },
      },
    });
  }

  function renderInsights(userCats) {
    const overspends = Object.entries(userCats)
      .filter(([_, data]) => data.cat_over_benchmark)
      .map(([cat]) => cat);

    if (overspends.length === 0) {
      insightsContent.innerHTML = `
        <p style="color:#28a745;">✅ You're spending below or near average in all categories.</p>
      `;
    } else {
      insightsContent.innerHTML = `
        <h4 style="color:#ff8c42;">⚠️ Overspending Alerts</h4>
        <p>You are spending above average in:
        <strong>${overspends.join(", ")}</strong>.</p>
      `;
    }
  }
});
