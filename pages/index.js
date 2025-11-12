document.addEventListener("DOMContentLoaded", () => {
  /* ==============================
      ELEMENT REFERENCES
  ===============================*/
  const sidebarButtons = document.querySelectorAll(".sidebar__btn");
  const allSections = document.querySelectorAll("section");
  const expenseForm = document.getElementById("expense__form");
  const incomeForm = document.getElementById("income__form");
  const countryForm = document.getElementById("country__form");
  const expenseList = document.getElementById("expense__list");
  const totalsContainer = document.getElementById("expense__totals_container");
  const incomeInput = document.getElementById("income");
  const incomeValue = document.getElementById("income__value");
  const incomePercent = document.getElementById("income__percent");
  const expenseTotal = document.getElementById("expense__total");
  const countrySelect = document.getElementById("country__name");
  const locationStatus = document.getElementById("location__status");
  const insightsContent = document.getElementById("insights__content");
  const categorySelect = document.getElementById("category");
  const subcategorySelect = document.getElementById("subcategory");
  const userForm = document.getElementById("user__form");
  const userSelect = document.getElementById("user__select");
  const userSummaryContainer = document.getElementById("user__summary");
  const countryNameEl = document.getElementById("country__name");
  const currencySymbolEl = document.getElementById("currency__symbol");

  /* ==============================
      STATE
  ===============================*/
  let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
  let userIncome = parseFloat(localStorage.getItem("income")) || 0;
  incomeValue.textContent = `$${userIncome.toLocaleString()}`;

  let selectedCountry = localStorage.getItem("country") || "";
  let selectedUser = localStorage.getItem("selectedUser") || null;
  let chartInstance = null;
  let allData = {};
  let currency = "";
  let countryData = {};
  let userData = {};

  const subCategories = {
    Restaurant: ["fast_food", "casual", "premium"],
    Retail: ["physical", "online"],
    Grocery: ["physical", "online"],
    Gas: ["local", "major"],
    Entertainment: ["events", "gaming", "streaming"],
    Healthcare: ["medical", "pharmacy"],
    Education: ["online", "supplies"],
    Travel: ["transport", "hotels", "booking", "airlines"],
  };

  /* ==============================
      NAVIGATION HANDLING
  ===============================*/
  sidebarButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.section;

      sidebarButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      allSections.forEach((section) => section.classList.remove("active"));
      document.getElementById(target).classList.add("active");
    });
  });

  /* ==============================
      LOAD DATA
  ===============================*/
  fetch("Data-Science/all_country_user_data.json")
    .then((res) => res.json())
    .then((data) => {
      allData = data;
      detectUserCountry();
    })
    .catch((err) => {
      console.error("Error loading data:", err);
      locationStatus.innerHTML =
        "<p>⚠️ Could not load data file. Please check your JSON path.</p>";
    });

  /* ==============================
      GEO DETECTION
  ===============================*/
  async function detectUserCountry() {
    try {
      const response = await fetch("https://ipwho.is/");
      const geo = await response.json();
      const countryName = geo.country || "USA";
      const simplified = countryName === "United States" ? "USA" : countryName;
      selectedCountry = simplified;
      localStorage.setItem("country", simplified);

      if (allData[simplified]) {
        countryData = allData[simplified].country_aggregate_data;
        currency = countryData.Currency;
      }

      // Update location card
      countryNameEl.textContent = simplified;
      currencySymbolEl.textContent = currency;

      // Populate country dropdown
      countrySelect.innerHTML = "";
      Object.keys(allData).forEach((c) => {
        const opt = document.createElement("option");
        opt.value = c;
        opt.textContent = c;
        if (c === selectedCountry) opt.selected = true;
        countrySelect.appendChild(opt);
      });

      // Load user & benchmark data
      loadCountryAndUser(selectedCountry, selectedUser);
    } catch (error) {
      console.error("Geo detection failed:", error);
      selectedCountry = "USA";
      currency = "USD";
      countryNameEl.textContent = selectedCountry;
      currencySymbolEl.textContent = currency;
      loadCountryAndUser(selectedCountry, selectedUser);
    }

    /* ==============================
      LOAD COUNTRY + USER
  ===============================*/
    function loadCountryAndUser(country, userId) {
      const data = allData[country];
      if (!data) return;

      countryData = data.country_aggregate_data;
      const users = data.users;
      populateUserDropdown(users);

      userData = users?.[userId] || users?.[Object.keys(users)[0]];
      currency = countryData.Currency;

      if (!userData) {
        totalsContainer.innerHTML = `<p>No user data for ${country}.</p>`;
        return;
      }

      renderUserSummary(userData, countryData, userId, country);
      renderTotals(userData.total_spending, currency);
      renderCategories(userData.categories, countryData.Categories, currency);
      renderInsights(userData.categories);
      updateIncomeStats();
    }

    /* ==============================
      MANUAL COUNTRY/USER SELECTION
  ===============================*/
    if (countryForm) {
      countryForm.addEventListener("submit", (e) => {
        e.preventDefault();
        selectedCountry = countrySelect.value;
        localStorage.setItem("country", selectedCountry);
        loadCountryAndUser(selectedCountry, selectedUser);
      });
    }

    if (userForm) {
      userForm.addEventListener("submit", (e) => {
        e.preventDefault();
        selectedUser = userSelect.value;
        localStorage.setItem("selectedUser", selectedUser);
        loadCountryAndUser(selectedCountry, selectedUser);
      });
    }

    /* ==============================
      INCOME FORM
  ===============================*/
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

    /* ==============================
      CATEGORY + SUBCATEGORY
  ===============================*/
    if (categorySelect) {
      categorySelect.addEventListener("change", (e) => {
        const selected = e.target.value;
        subcategorySelect.innerHTML = `<option value="">Select Subcategory</option>`;
        if (subCategories[selected]) {
          subCategories[selected].forEach((sub) => {
            const opt = document.createElement("option");
            opt.value = sub;
            opt.textContent = sub;
            subcategorySelect.appendChild(opt);
          });
        }
      });
    }

    /* ==============================
      ADD EXPENSE
  ===============================*/
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

    /* ==============================
      RENDER FUNCTIONS
  ===============================*/
    function renderTotals(totalSpending, currency) {
      totalsContainer.innerHTML = `
      <h3>Total Spending</h3>
      <p><strong>${currency} ${totalSpending.toLocaleString()}</strong></p>
    `;
    }

    function renderCategories(userCats, benchmarkCats, currency) {
      totalsContainer.innerHTML += `<h3>Category Comparison</h3>`;
      const categories = Object.keys(userCats);
      const userTotals = [];

      categories.forEach((cat) => {
        const userSpent = userCats[cat].total_cat_spending;
        const benchmarkMean = benchmarkCats[cat]?.mean_spent || 0;
        const over = userCats[cat].cat_over_benchmark;
        const status = over
          ? `<span class="above">↑ Above avg (${benchmarkMean.toFixed(
              0
            )})</span>`
          : `<span class="below">↓ Below avg (${benchmarkMean.toFixed(
              0
            )})</span>`;
        const row = document.createElement("div");
        row.classList.add("totals__row");
        row.innerHTML = `<strong>${cat}</strong>: ${currency} ${userSpent.toLocaleString()} ${status}`;
        totalsContainer.appendChild(row);
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
                "#85BB6580",
                "#2EC4B680",
                "#FF8C4280",
                "#28A74580",
                "#DC354580",
                "#6EA55680",
                "#1F2A4480",
                "#007BFF80",
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
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

    function populateUserDropdown(usersObj) {
      if (!userSelect) return;
      userSelect.innerHTML = "";
      const userKeys = Object.keys(usersObj);
      userKeys.forEach((userId) => {
        const option = document.createElement("option");
        option.value = userId;
        option.textContent = `User ${userKeys.indexOf(userId) + 1}`;
        if (userId === selectedUser) option.selected = true;
        userSelect.appendChild(option);
      });
      if (!selectedUser && userKeys.length > 0) {
        selectedUser = userKeys[0];
        localStorage.setItem("selectedUser", selectedUser);
      }
    }

    function renderUserSummary(userData, countryData, userId, country) {
      if (!userSummaryContainer) return;
      if (!userData || !countryData) {
        userSummaryContainer.innerHTML = `<p>No user data available.</p>`;
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

      userSummaryContainer.innerHTML = `
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
  }
});
