let data = JSON.parse(localStorage.getItem("financeData")) || [];

function saveData() {
  localStorage.setItem("financeData", JSON.stringify(data));
}

function addEntry() {
  const amount = parseFloat(document.getElementById("amount").value);
  const type = document.getElementById("type").value;
  const category = document.getElementById("category").value || "other";
  const date = document.getElementById("date").value;

  if (!amount || !date) return alert("Enter valid data");

  data.push({
    id: Date.now(),   // ✅ unique id
    amount,
    type,
    category,
    date
  });

  saveData();
  updateUI();
}
function deleteEntry(id) {
  data = data.filter(entry => entry.id !== id);
  saveData();
  updateUI();
}
function renderEntryList() {
  const container = document.getElementById("entryList");
  if (!container) return;

  container.innerHTML = "";

  data
    .slice()
    .reverse()
    .forEach(entry => {
      const div = document.createElement("div");
      div.className = "entry-item";

      div.innerHTML = `
        <span>
          <b>${entry.type.toUpperCase()}</b> - $${entry.amount} 
          (${entry.category}) on ${entry.date}
        </span>
        <button onclick="deleteEntry(${entry.id})">❌</button>
      `;

      container.appendChild(div);
    });
}
function getCurrentMonth() {
  const now = new Date();
  return now.getMonth();
}

function getCurrentWeek() {
  const now = new Date();
  const first = new Date(now.getFullYear(), 0, 1);
  return Math.ceil((((now - first) / 86400000) + first.getDay() + 1) / 7);
}

function updateUI() {
  const now = new Date();
  const currentMonth = now.getMonth();

  let income = 0;
  let expenses = 0;

  const categoryTotals = {};
  const dailyTotals = {};

  data.forEach(entry => {
const entryDate = new Date(entry.date + "T00:00:00");
    
    // Monthly filter
    if (entryDate.getMonth() === currentMonth) {
      if (entry.type === "income") income += entry.amount;
      else expenses += entry.amount;
    }

    // Category totals
    if (entry.type === "expense") {
      categoryTotals[entry.category] =
        (categoryTotals[entry.category] || 0) + entry.amount;
    }

    // Daily totals
    if (!dailyTotals[entry.date]) {
  dailyTotals[entry.date] = 0;
}

// income adds, expenses subtract → net per day
dailyTotals[entry.date] +=
  entry.type === "income" ? entry.amount : -entry.amount;
  });

  const balance = income - expenses;

  document.getElementById("summary").textContent =
  `💰 Income: $${income} | 💸 Expenses: $${expenses} | 🟢 Balance: $${balance}`;

  // Suggestions
  let suggestion = "";
  if (expenses > income) {
    suggestion = "⚠️ You're spending more than you earn.";
  } else if (expenses > income * 0.7) {
    suggestion = "💡 Try reducing discretionary spending.";
  } else {
    suggestion = "✅ You're in a healthy range!";
  }

  document.getElementById("suggestions").textContent = suggestion;

  renderPieChart(categoryTotals);
  renderBarChart(dailyTotals);
  renderEntryList();
}

let pieChart, barChart;

function renderPieChart(dataObj) {
  const ctx = document.getElementById("pieChart").getContext("2d");

  if (pieChart) {
    pieChart.destroy();
  }

  pieChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: Object.keys(dataObj),
      datasets: [{
        data: Object.values(dataObj),
        backgroundColor: [
          "#ff8fab", "#ffc6ff", "#bde0fe",
          "#caffbf", "#ffd6a5", "#a0c4ff"
        ]
      }]
    },
    options: {
      animation: false
    }
  });
}

function renderBarChart(dataObj) {
  const ctx = document.getElementById("barChart").getContext("2d");

  if (barChart) {
    barChart.destroy();
  }

  // 🔥 sort dates so chart doesn't look broken
  const sortedDates = Object.keys(dataObj).sort();

  barChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: sortedDates,
      datasets: [{
        label: "Daily Spending",
        data: sortedDates.map(d => dataObj[d]),
        backgroundColor: "#ff8fab"
      }]
    },
    options: {
      animation: false
    }
  });
}

updateUI();
