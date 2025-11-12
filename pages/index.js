document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("expense__form");
  const incomeForm = document.getElementById("income__form");
  const countryForm = document.getElementById("country__form");
  const expenseList = document.getElementById("expense__list");
  const totalsContainer = document.getElementById("expense__totals_container");
  const incomeInput = document.getElementById("income");
  const countrySelect = document.getElementById("country");
  const locationStatus = document.getElementById("location__status");

  //  load from localStorage
  let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
  let userIncome = parseFloat(localStorage.getItem("income")) || 0;
  let benchmarkData = {};
  let selectedCountry = localStorage.getItem("country") || "";
  let currencySymbol = "";
  let chart = null;
  let allData = {};

  // Load benchmark
  fetch("Data-Science/all_country_user_data.json")
    .then((res) => res.json())
    .then((data) => {
      allData = data;
      detectUserCountry();
    })
    .catch((err) => console.error("Error loading benchmark:", err));

  // Detect user location
  async function detectUserCountry() {
    locationStatus.innerHTML = "<p>Detecting your location...</p>";
    try {
      const response = await fetch("https://ipapi.co/json/");
      const geo = await response.json();
      const countryName = geo.country_name;
      const simplified = countryName === "United States" ? "USA" : countryName;
      selectedCountry = simplified;
      countrySelect.innerHTML = "";
      for (const c of Object.keys(allData)) {
        const option = document.createElement("option");
        option.value = c;
        option.textContent = c;
        if (c === simplified) option.selected = true;
        countrySelect.appendChild(option);
      }
      // Show country info
      locationStatus.innerHTML = `<p>🌎 Detected Country: <strong>${simplified}</strong></p>`;
      countryForm.style.display = "flex";
      localStorage.setItem("country", simplified);
      loadCountryData(simplified);
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
  // Add expense
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!category.value || !amount.value || !date.value) {
      alert("Please fill all required fields");
      return;
    }

    const newExpense = {
      category: category.value,
      amount: parseFloat(amount.value).toFixed(2),
      date: date.value,
      description: description.value || "—",
    };

    expenses.push(newExpense);
    localStorage.setItem("expenses", JSON.stringify(expenses));

    renderExpenses();

    form.reset();
  });

  function renderExpenses() {
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
        <span>$${exp.amount.toFixed(2)}</span>
        <span>${exp.date}</span>
        <span>${exp.description}</span>
      `;
      expenseList.appendChild(item);
    });
    calculateTotals();
  }
  function calculateTotals() {
    const totals = {};
    expenses.forEach((exp) => {
      totals[exp.category] = (totals[exp.category] || 0) + exp.amount;
    });
    totalsContainer.innerHTML = `<h3>Totals & Comparison</h3>`;

    for (const [cat, total] of Object.entries(totals)) {
      const avg = benchmarkData[cat]?.cat_mean || 0;
      const diff = avg ? (((total - avg) / avg) * 100).toFixed(1) : 0;
      const status =
        diff > 0
          ? `<span class="above">↑ ${diff}% above avg ($${avg})</span>`
          : `<span class="below">↓ ${Math.abs(
              diff
            )}% below avg ($${avg})</span>`;

      const row = document.createElement("div");
      row.classList.add("totals__row");
      row.innerHTML = `<strong>${cat}</strong>: $${total.toFixed(2)} ${status}`;
      totalsContainer.appendChild(row);
    }
  }
});
