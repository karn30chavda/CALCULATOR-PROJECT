if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("./service-worker.js") // Use relative path
    .then((registration) => {
      console.log("Service Worker registered with scope:", registration.scope);
    })
    .catch((error) => {
      console.log("Service Worker registration failed:", error);
    });
}

let currentInput = "";
let history = JSON.parse(localStorage.getItem("calculatorHistory")) || [];

function appendValue(value) {
  if (value === "." && currentInput.includes(".")) return;
  currentInput += value;
  updateDisplay();
}

function clearDisplay() {
  currentInput = "";
  updateDisplay();
}

function deleteLast() {
  currentInput = currentInput.slice(0, -1);
  updateDisplay();
}

function calculateResult() {
  try {
    const expression = currentInput;
    currentInput = eval(currentInput).toString();
    addToHistory(expression, currentInput);
    updateDisplay();
  } catch (e) {
    currentInput = "Error";
    updateDisplay();
  }
}

function calculatePercentage() {
  try {
    currentInput = (eval(currentInput) / 100).toString();
    updateDisplay();
  } catch (e) {
    currentInput = "Error";
    updateDisplay();
  }
}

function updateDisplay() {
  document.getElementById("result").innerText = currentInput || "0";
}

function toggleTheme() {
  document.body.classList.toggle("light-theme");
  const themeIcon = document.querySelector(".theme-toggle i");
  themeIcon.classList.toggle("fa-moon");
  themeIcon.classList.toggle("fa-sun");
}

function addToHistory(expression, result) {
  const now = new Date();
  const timestamp = now.toLocaleString([], {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  history.push({ expression, result, timestamp });
  if (history.length > 10) history.shift();
  localStorage.setItem("calculatorHistory", JSON.stringify(history));
}

function updateHistoryList() {
  const historyList = document.getElementById("history-list");
  historyList.innerHTML = history
    .map(
      (entry) => `
      <li>
        <span>${entry.expression} = ${entry.result}</span>
        <span class="timestamp">${entry.timestamp}</span>
      </li>
    `
    )
    .join("");
}

function toggleHistory() {
  const historyPanel = document.getElementById("history-panel");
  historyPanel.classList.toggle("active");
  if (historyPanel.classList.contains("active")) {
    updateHistoryList();
  }
}

function clearHistory() {
  history = [];
  localStorage.removeItem("calculatorHistory");
  updateHistoryList();
}

// Prevent zooming
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && (e.key === "+" || e.key === "-" || e.key === "0")) {
    e.preventDefault();
  }
});

document.addEventListener(
  "wheel",
  (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
    }
  },
  { passive: false }
);
