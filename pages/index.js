import "../pages/index.css";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("expense__form");
  const expenseList = document.getElementById("expense__list");
  const category = document.getElementById("category");
  const amount = document.getElementById("amount");
  const date = document.getElementById("date");
  const description = document.getElementById("description");
  const totalsContainer = document.createElement("div");
  totalsContainer.classList.add("totals__container");
  expenseList.after(totalsContainer);

  // Optional: load from localStorage
  let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
  let benchmarkData = {};

  // Load benchmark
  fetch("Data-Science/notebook.ipynb")
    .then((res) => res.json())
    .then((data) => {
      benchmarkData = data["USA"].country_aggregate_data.categories;
      renderExpenses();
    })
    .catch((err) => console.error("Error loading benchmark:", err));
  // Render stored expenses
  renderExpenses();

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
