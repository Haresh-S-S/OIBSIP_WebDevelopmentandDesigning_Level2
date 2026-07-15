/* =========================================================
   CALCULATOR — Vanilla JS, no eval()
   All arithmetic is done manually with parseFloat() and a
   switch statement. State is tracked in a handful of plain
   variables so the flow is easy to follow.
========================================================= */

// ----- DOM references -----
const expressionEl = document.querySelector("#expression");
const currentEl = document.querySelector("#current");
const keys = document.querySelectorAll(".key");

// ----- Calculator state -----
let currentInput = "0";     // the number currently being typed/shown
let previousValue = null;   // the operand captured before an operator
let activeOperator = null;  // "+" "−" "×" "÷"
let overwrite = true;       // true = next digit press starts a fresh number
let isError = false;        // true after a divide-by-zero message

// For repeating "=" (e.g. press 5, +, 3, =, = ... keeps adding 3)
let lastOperator = null;
let lastOperand = null;

/**
 * Renders the current state onto the screen.
 */
function updateDisplay() {
  currentEl.textContent = currentInput;
  currentEl.classList.toggle("is-error", isError);

  if (activeOperator && previousValue !== null && !isError) {
    expressionEl.textContent = `${formatNumber(previousValue)} ${activeOperator}`;
  } else {
    expressionEl.textContent = "";
  }
}

/**
 * Trims trailing floating point noise for nicer display,
 * without altering the underlying precision used to compute.
 */
function formatNumber(value) {
  if (!isFinite(value)) return "0";
  // Round to 10 significant decimal places to avoid binary float noise
  const rounded = Math.round((value + Number.EPSILON) * 1e10) / 1e10;
  return rounded.toString();
}

/**
 * Resets the calculator to its initial state.
 */
function clearAll() {
  currentInput = "0";
  previousValue = null;
  activeOperator = null;
  overwrite = true;
  isError = false;
  lastOperator = null;
  lastOperand = null;
  updateDisplay();
}

/**
 * Removes the last character of the current input (⌫).
 */
function backspace() {
  if (isError) {
    clearAll();
    return;
  }
  if (overwrite) return; // nothing typed yet to delete

  currentInput = currentInput.slice(0, -1);
  if (currentInput === "" || currentInput === "-") {
    currentInput = "0";
    overwrite = true;
  }
  updateDisplay();
}

/**
 * Appends a digit (0-9) to the current input.
 */
function appendNumber(digit) {
  if (isError) clearAll();

  if (overwrite) {
    currentInput = digit === "0" ? "0" : digit;
    overwrite = false;
    return updateDisplay();
  }

  // Avoid meaningless leading zeros like "007"
  if (currentInput === "0") {
    currentInput = digit;
  } else {
    currentInput += digit;
  }
  updateDisplay();
}

/**
 * Appends a decimal point, guarding against duplicates.
 */
function appendDecimal() {
  if (isError) clearAll();

  if (overwrite) {
    currentInput = "0.";
    overwrite = false;
    return updateDisplay();
  }

  if (!currentInput.includes(".")) {
    currentInput += ".";
  }
  updateDisplay();
}

/**
 * Handles an operator press: stores the operand, or, if an
 * operator is already active, replaces it (no chaining of
 * symbols like "5 ++ 3").
 */
function chooseOperator(symbol) {
  if (isError) clearAll();

  if (activeOperator && !overwrite) {
    // A full expression is pending (e.g. "5 + 3") -> resolve it first,
    // then keep chaining with the new operator, e.g. 5 + 3 × 2
    const result = compute();
    if (result === null) return; // divide-by-zero already handled

    previousValue = result;
    currentInput = formatNumber(result);
  } else {
    previousValue = parseFloat(currentInput);
  }

  activeOperator = symbol;
  overwrite = true;
  highlightOperator(symbol);
  updateDisplay();
}

/**
 * Visually marks the active operator key so the user can see
 * which operation is queued up.
 */
function highlightOperator(symbol) {
  document.querySelectorAll(".key--operator").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.value === symbol);
  });
}

/**
 * Performs the arithmetic for the pending operator using
 * manual logic (switch + parseFloat), never eval().
 * Returns the numeric result, or null if a divide-by-zero
 * error was raised (and displayed) instead.
 */
function compute() {
  const a = previousValue;
  const b = parseFloat(currentInput);

  if (a === null || activeOperator === null || isNaN(b)) {
    return parseFloat(currentInput);
  }

  let result;
  switch (activeOperator) {
    case "+":
      result = a + b;
      break;
    case "−":
      result = a - b;
      break;
    case "×":
      result = a * b;
      break;
    case "÷":
      if (b === 0) {
        showDivideByZeroError();
        return null;
      }
      result = a / b;
      break;
    default:
      result = b;
  }

  return result;
}

/**
 * Displays the divide-by-zero message and resets just enough
 * state so the user can keep calculating afterwards.
 */
function showDivideByZeroError() {
  currentInput = "Error: Cannot divide by zero";
  isError = true;
  previousValue = null;
  activeOperator = null;
  lastOperator = null;
  lastOperand = null;
  overwrite = true;
  highlightOperator(null);
  updateDisplay();
}

/**
 * Handles "=" presses, including repeated presses that should
 * keep re-applying the last operation to the latest result.
 */
function evaluateEquals() {
  if (isError) return;

  if (activeOperator === null) {
    // Nothing queued: repeating "=" re-applies the last op/operand
    if (lastOperator && lastOperand !== null) {
      const operandBefore = currentInput;
      previousValue = parseFloat(currentInput);
      activeOperator = lastOperator;
      const result = compute();
      if (result === null) return;
      currentInput = formatNumber(result);
      saveHistoryEntry(
        `${formatNumber(parseFloat(operandBefore))} ${lastOperator} ${formatNumber(parseFloat(operandBefore))}`,
        currentInput
      );
      previousValue = null;
      activeOperator = null;
      overwrite = true;
      updateDisplay();
    }
    return;
  }

  // Remember this operation in case "=" is pressed again afterwards
  lastOperator = activeOperator;
  lastOperand = parseFloat(currentInput);

  const expressionBefore = `${formatNumber(previousValue)} ${activeOperator} ${formatNumber(lastOperand)}`;

  const result = compute();
  if (result === null) return; // divide-by-zero already displayed

  currentInput = formatNumber(result);
  saveHistoryEntry(expressionBefore, currentInput);
  previousValue = null;
  activeOperator = null;
  overwrite = true;
  highlightOperator(null);
  updateDisplay();
}

/**
 * Central click handler: reads each button's data-action and
 * data-value attributes and routes to the right function.
 * No inline onclick attributes are used anywhere in the HTML.
 */
function handleKeyPress(event) {
  const button = event.currentTarget;
  const action = button.dataset.action;
  const value = button.dataset.value;

  switch (action) {
    case "number":
      appendNumber(value);
      break;
    case "decimal":
      appendDecimal();
      break;
    case "operator":
      chooseOperator(value);
      break;
    case "equals":
      evaluateEquals();
      break;
    case "clear":
      clearAll();
      break;
    case "backspace":
      backspace();
      break;
    default:
      break;
  }
}

// ----- Wire up event listeners dynamically (no inline handlers) -----
keys.forEach((key) => key.addEventListener("click", handleKeyPress));

// ----- Optional: physical keyboard support for a nicer UX -----
window.addEventListener("keydown", (event) => {
  const { key } = event;

  if (/^[0-9]$/.test(key)) {
    appendNumber(key);
  } else if (key === ".") {
    appendDecimal();
  } else if (key === "+" || key === "-" || key === "*" || key === "/") {
    const map = { "+": "+", "-": "−", "*": "×", "/": "÷" };
    chooseOperator(map[key]);
  } else if (key === "Enter" || key === "=") {
    event.preventDefault();
    evaluateEquals();
  } else if (key === "Backspace") {
    backspace();
  } else if (key === "Escape") {
    clearAll();
  }
});

// ----- Initial paint -----
updateDisplay();

/* =========================================================
   NAVIGATION — switch between Home / Calculator /
   Formula Cheat Sheet / History without reloading the page.
========================================================= */
const PAGE_IDS = ["home", "calculator", "formulas", "history"];

function goToPage(pageName) {
  if (!PAGE_IDS.includes(pageName)) return;

  PAGE_IDS.forEach((name) => {
    const section = document.getElementById(`page-${name}`);
    if (!section) return;
    section.classList.toggle("page--active", name === pageName);
  });

  if (pageName === "history") {
    renderHistory();
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll("[data-nav]").forEach((el) => {
  el.addEventListener("click", () => goToPage(el.dataset.nav));
});

/* =========================================================
   CALCULATION HISTORY — persisted in localStorage, newest
   first, capped at 15 entries.
========================================================= */
const HISTORY_KEY = "calculatorHistory";
const HISTORY_LIMIT = 15;

/**
 * Reads the saved history array from localStorage.
 * Returns [] if nothing is saved yet or data is corrupted.
 */
function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
}

/**
 * Persists the given history array to localStorage.
 */
function persistHistory(history) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (err) {
    // localStorage may be unavailable (e.g. private browsing quota) —
    // fail silently so the calculator keeps working either way.
  }
}

/**
 * Adds a new calculation to the front of history, trims it to
 * the latest 15 entries, saves it, and refreshes the History
 * page if it happens to be open.
 */
function saveHistoryEntry(expression, answer) {
  const history = loadHistory();

  history.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    expression,
    answer,
    timestamp: new Date().toISOString(),
  });

  const trimmed = history.slice(0, HISTORY_LIMIT);
  persistHistory(trimmed);

  const historyPage = document.getElementById("page-history");
  if (historyPage && historyPage.classList.contains("page--active")) {
    renderHistory();
  }
}

/**
 * Formats an ISO timestamp into a short, readable label.
 */
function formatTimestamp(isoString) {
  try {
    const date = new Date(isoString);
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (err) {
    return "";
  }
}

/**
 * Renders the full history list (or an empty-state message)
 * into the History page.
 */
function renderHistory() {
  const listEl = document.getElementById("historyList");
  const emptyEl = document.getElementById("historyEmpty");
  if (!listEl || !emptyEl) return;

  const history = loadHistory();
  listEl.innerHTML = "";

  if (history.length === 0) {
    emptyEl.classList.add("is-visible");
    return;
  }
  emptyEl.classList.remove("is-visible");

  history.forEach((entry) => {
    const item = document.createElement("div");
    item.className = "history-item";
    item.dataset.id = entry.id;

    const main = document.createElement("div");
    main.className = "history-item__main";

    const expressionEl = document.createElement("div");
    expressionEl.className = "history-item__expression";
    expressionEl.textContent = entry.expression;

    const resultEl = document.createElement("div");
    resultEl.className = "history-item__result";
    resultEl.textContent = `= ${entry.answer}`;

    main.appendChild(expressionEl);
    main.appendChild(resultEl);

    if (entry.timestamp) {
      const timeEl = document.createElement("div");
      timeEl.className = "history-item__time";
      timeEl.textContent = formatTimestamp(entry.timestamp);
      main.appendChild(timeEl);
    }

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "history-item__delete";
    deleteBtn.setAttribute("aria-label", "Delete this entry");
    deleteBtn.textContent = "✕";
    deleteBtn.addEventListener("click", () => deleteHistoryEntry(entry.id));

    item.appendChild(main);
    item.appendChild(deleteBtn);
    listEl.appendChild(item);
  });
}

/**
 * Removes a single history entry by id and re-renders.
 */
function deleteHistoryEntry(id) {
  const history = loadHistory().filter((entry) => entry.id !== id);
  persistHistory(history);
  renderHistory();
}

/**
 * Clears the entire history after saving and re-renders.
 */
function clearAllHistory() {
  persistHistory([]);
  renderHistory();
}

const clearHistoryBtn = document.getElementById("clearHistoryBtn");
if (clearHistoryBtn) {
  clearHistoryBtn.addEventListener("click", clearAllHistory);
}

// Paint history once on load so it's ready the moment the page is opened.
renderHistory();
