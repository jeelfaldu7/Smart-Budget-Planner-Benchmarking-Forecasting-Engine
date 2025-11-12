export default class FormValidator {
  constructor(config, formEl) {
    this._config = config;
    this._formEl = formEl;
    this._inputs = Array.from(formEl.querySelectorAll(config.inputSelector));
    this._submitBtn = formEl.querySelector(config.submitButtonSelector);
    this._todayISO = new Date().toISOString().slice(0, 10);
  }

  enableValidation() {
    this._toggleButton();
    this._setEventListeners();
  }

  _setEventListeners() {
    this._inputs.forEach((input) => {
      input.addEventListener("input", () => {
        this._validateField(input);
        this._toggleButton();
      });
      input.addEventListener("blur", () => {
        this._validateField(input);
        this._toggleButton();
      });
    });
  }

  _toggleButton() {
    if (this._hasInvalidInput()) {
      this._submitBtn.disabled = true;
      this._submitBtn.classList.add(this._config.inactiveButtonClass);
    } else {
      this._submitBtn.disabled = false;
      this._submitBtn.classList.remove(this._config.inactiveButtonClass);
    }
  }

  _hasInvalidInput() {
    const category = this._formEl.querySelector("#category");
    const amount = this._formEl.querySelector("#amount");
    const date = this._formEl.querySelector("#date");
    const description = this._formEl.querySelector("#description");

    const categoryValid = category.value.trim() !== "";

    const amountVal = parseFloat(amount.value);
    const amountValid = !Number.isNaN(amountVal) && amountVal > 0;

    const dateVal = date.value;
    const dateValid = !!dateVal && dateVal <= this._todayISO; // not in the future

    // optional: empty OK, else at least 3 chars
    const descVal = description.value.trim();
    const descriptionValid = descVal.length === 0 || descVal.length >= 3;

    return !(categoryValid && amountValid && dateValid && descriptionValid);
  }

  _validateField(input) {
    let errorMessage = "";

    if (input.id === "category") {
      if (input.value.trim() === "") errorMessage = "Please select a category.";
    }

    if (input.id === "amount") {
      const n = parseFloat(input.value);
      if (Number.isNaN(n)) errorMessage = "Enter a number.";
      else if (n <= 0) errorMessage = "Amount must be greater than 0.";
    }

    if (input.id === "date") {
      if (!input.value) errorMessage = "Please pick a date.";
      else if (input.value > this._todayISO)
        errorMessage = "Date cannot be in the future.";
    }

    if (input.id === "description") {
      const t = input.value.trim();
      if (t.length > 0 && t.length < 3)
        errorMessage = "Min 3 characters or leave it empty.";
    }

    const errorEl = this._formEl.querySelector(`#${input.id}-error`);

    if (errorMessage) {
      input.classList.add(this._config.inputErrorClass);
      errorEl.textContent = errorMessage;
      errorEl.classList.add(this._config.errorClass);
    } else {
      input.classList.remove(this._config.inputErrorClass);
      errorEl.textContent = "";
      errorEl.classList.remove(this._config.errorClass);
    }
  }
}
