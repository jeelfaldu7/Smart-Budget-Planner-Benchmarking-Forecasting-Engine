import "../pages/index.css";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("expense__form");
  const expenseList = document.getElementById("expense__list");
  const category = document.getElementById("category");
  const amount = document.getElementById("amount");
  const date = document.getElementById("date");
  const description = document.getElementById("description");

  // Optional: load from localStorage
  let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

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
        <span>$${exp.amount}</span>
        <span>${exp.date}</span>
        <span>${exp.description}</span>
      `;
      expenseList.appendChild(item);
    });
  }
});
