import FormValidator from "../components/FormValidator.js";

document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".header__nav_bar-item");
  const sections = document.querySelectorAll(".content");

  const expenseForm = document.getElementById("expense__form");

  const expenseValidationConfig = {
    inputSelector: ".expense__form-input, .expense__form-select",
    submitButtonSelector: "#expense__form-btn",
    inactiveButtonClass: "expense__form-btn_disabled",
    inputErrorClass: "expense__form-input_invalid",
    errorClass: "expense__form-error_visible",
  };

  const expenseFormValidator = new FormValidator(
    expenseValidationConfig,
    expenseForm
  );
  expenseFormValidator.enableValidation();

  const incomeForm = document.getElementById("income__form");
  const countryForm = document.getElementById("country__form");
  const expenseList = document.getElementById("expense__list");
  const totalsContainer = document.getElementById("expense__totals_container");
  const incomeInput = document.getElementById("income");
  const countrySelect = document.getElementById("country");
  const locationStatus = document.getElementById("location__status");
  const insightsContent = document.getElementById("insights__content");
  const categorySelect = document.getElementById("category");
  const subcategorySelect = document.getElementById("subcategory");
  const userForm = document.getElementById("user__form");
  const userSelect = document.getElementById("user__select");

  //  load from localStorage
  let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
  let userIncome = parseFloat(localStorage.getItem("income")) || 0;
  let benchmarkData = {};

  let selectedCountry = localStorage.getItem("country") || "";
  let selectedUser = localStorage.getItem("selectedUser") || null;
  let currencySymbol = "";
  let chartInstance = null;
  let allData = {};
  let currency = "";

  // SubCategory Mapping
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

  //Navigating Hnadling
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = link.dataset.section;

      // Highlight active nav
      navLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");

      // Show active section
      sections.forEach((sec) => sec.classList.remove("active"));
      document.getElementById(target).classList.add("active");
    });
  });

  // Load benchmark data
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

  // Detect user country
  async function detectUserCountry() {
    locationStatus.innerHTML = "<p>Detecting your location...</p>";
    try {
      const response = await fetch("https://ipwho.is/");
      const geo = await response.json();
      const countryName = geo.country;
      const simplified = countryName === "United States" ? "USA" : countryName;
      selectedCountry = simplified;
      countrySelect.innerHTML = "";
      currency = allData[selectedCountry].country_aggregate_data.Currency;
      locationStatus.innerHTML = `<p>🌎 Detected Country: <strong>${simplified}</strong></p>`;

      countrySelect.innerHTML = "";
      Object.keys(allData).forEach((c) => {
        const opt = document.createElement("option");
        opt.value = c;
        opt.textContent = c;
        if (c === selectedCountry) opt.selected = true;
        countrySelect.appendChild(opt);
      });

      countryForm.style.display = "flex";
      loadCountryAndUser(selectedCountry, selectedUser);
    } catch (error) {
      console.error("Geo detection failed:", error);
      locationStatus.innerHTML =
        "<p>⚠️ Unable to detect your location automatically.</p>";
      // Fallback: show dropdown manually
      countryForm.style.display = "flex";
      Object.keys(allData).forEach((c) => {
        const option = document.createElement("option");
        option.value = c;
        option.textContent = c;
        countrySelect.appendChild(option);
      });
    }
  }
  // Load country and user data
  function loadCountryAndUser(country, userId) {
    const countryData = allData[country]?.country_aggregate_data;
    const userData = allData[country]?.users?.[userId];
    populateUserDropdown(allData[country].users);
    if (!countryData || !userData) {
      totalsContainer.innerHTML = `<p>No data available for ${country}.</p>`;
      return;
    }

    currency = countryData.Currency;
    renderTotals(userData.total_spending, currency);
    renderCategories(userData.categories, countryData.Categories, currency);
    renderInsights(userData.categories);
  }
  // manual country switch
  countryForm.addEventListener("submit", (e) => {
    e.preventDefault();
    selectedCountry = countrySelect.value;
    loadCountryAndUser(selectedCountry, selectedUser);
  });
  userForm.addEventListener("submit", (e) => {
    e.preventDefault();
    selectedUser = userSelect.value;
    localStorage.setItem("selectedUser", selectedUser);
    loadCountryAndUser(selectedCountry, selectedUser);
  });
  // income form handling
  incomeForm.addEventListener("submit", (e) => {
    e.preventDefault();
    userIncome = parseFloat(incomeInput.value);
    localStorage.setItem("income", userIncome);
    alert("✅ Income saved!");
  });
  // category logic
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

  // Add expense
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
    renderExpenses();
  });

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
        <span>${currencySymbol}${exp.amount.toFixed(2)}</span>
        <span>${exp.date}</span>
        <span>${exp.description}</span>
      `;
      expenseList.appendChild(item);
    });
  }
  function renderTotals(totalSpending, currency) {
    totalsContainer.innerHTML = `
      <h3>Total Spending</h3>
      <p><strong>${currency} ${totalSpending.toLocaleString()}</strong></p>
    `;
  }
  // compare user vs benchmark
  function renderCategories(userCats, benchmarkCats, currency) {
    totalsContainer.innerHTML += `<h3>Category Comparison</h3>`;

    const categories = Object.keys(userCats);
    const userTotals = [];
    const benchmarks = [];

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
      totalsContainer.appendChild(row);

      userTotals.push(userSpent);
      benchmarks.push(benchmarkMean);
    });

    drawPieChart(categories, userTotals);
  }
  //pie chart
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
              "#007bff80",
              "#28a74580",
              "#ffc10780",
              "#dc354580",
              "#20c99780",
              "#6610f280",
              "#fd7e1480",
              "#6f42c180",
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
  // insights section
  function renderInsights(userCats) {
    const overspends = Object.entries(userCats)
      .filter(([_, data]) => data.cat_over_benchmark)
      .map(([cat]) => cat);

    if (overspends.length === 0) {
      insightsContent.innerHTML = `
        <p>✅ You're spending below or near average in all categories.</p>
      `;
    } else {
      insightsContent.innerHTML = `
        <h3>Overspending Alerts</h3>
        <p>⚠️ You are spending above average in:
        <strong>${overspends.join(", ")}</strong>.</p>
      `;
    }
  }
  // helper function
  function populateUserDropdown(usersObj) {
    userSelect.innerHTML = "";
    const userKeys = Object.keys(usersObj);

    userKeys.forEach((userId) => {
      const option = document.createElement("option");
      option.value = userId;
      option.textContent = userId;
      if (userId === selectedUser) option.selected = true;
      userSelect.appendChild(option);
    });

    // If no user selected yet, pick the first one
    if (!selectedUser && userKeys.length > 0) {
      selectedUser = userKeys[0];
      localStorage.setItem("selectedUser", selectedUser);
    }
  }
});
