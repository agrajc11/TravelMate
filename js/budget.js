const budgetSidebar = document.getElementById("sidebar");
const budgetMenuToggle = document.getElementById("menuToggle");

if (budgetSidebar && budgetMenuToggle) {
    budgetMenuToggle.addEventListener("click", function () {
        const isOpen = budgetSidebar.classList.toggle("open");
        budgetMenuToggle.setAttribute("aria-expanded", String(isOpen));
    });
}

const budgetData = document.getElementById("budgetData");
const budgetError = document.getElementById("budgetError");
const budgetTripList = document.getElementById("budgetTripList");
const budgetEmpty = document.getElementById("budgetEmpty");
const expenseModal = document.getElementById("expenseModal");
const expenseForm = document.getElementById("expenseForm");
const expenseTrip = document.getElementById("expenseTrip");
const confirmExpenseModal = document.getElementById("confirmExpenseModal");

const currencyFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
});

let trips = [];
let expensesByTrip = {};
let pendingExpenseDelete = null;

function formatCurrency(amount) {
    return currencyFormatter.format(amount);
}

function getTripExpenses(tripId) {
    const expenses = expensesByTrip[String(tripId)] || [];
    if (!Array.isArray(expenses)) {
        throw new Error("Saved expenses for a trip have an unexpected format.");
    }

    return expenses;
}

function renderBudget() {
    let totalBudget = 0;
    let totalExpenses = 0;
    budgetTripList.replaceChildren();

    trips.forEach(function (trip) {
        const tripBudget = Number(trip.budget) || 0;
        const expenses = getTripExpenses(trip.id);
        const tripExpenses = expenses.reduce(function (sum, expense) {
            return sum + (Number(expense.amount) || 0);
        }, 0);
        const remaining = tripBudget - tripExpenses;
        const overBudget = remaining < 0;
        const usagePercent = tripBudget > 0
            ? Math.round((tripExpenses / tripBudget) * 100)
            : (tripExpenses > 0 ? 100 : 0);

        totalBudget += tripBudget;
        totalExpenses += tripExpenses;

        const card = document.createElement("article");
        card.className = "budget-trip-card";

        const header = document.createElement("div");
        header.className = "budget-trip-header";

        const heading = document.createElement("div");
        const title = document.createElement("h3");
        title.textContent = trip.name || "Untitled trip";

        const destination = document.createElement("p");
        destination.className = "budget-trip-destination";
        destination.textContent = trip.destination || "Destination not set";
        heading.append(title, destination);

        const addExpenseButton = document.createElement("button");
        addExpenseButton.type = "button";
        addExpenseButton.className = "budget-add-expense";
        addExpenseButton.textContent = "+ Add Expense";
        addExpenseButton.addEventListener("click", function () {
            openExpenseModal(trip.id);
        });
        header.append(heading, addExpenseButton);

        const metrics = document.createElement("div");
        metrics.className = "budget-trip-metrics";
        metrics.append(
            createBudgetMetric("Trip budget", formatCurrency(tripBudget)),
            createBudgetMetric("Planned expenses", formatCurrency(tripExpenses)),
            createBudgetMetric("Remaining", formatCurrency(remaining), overBudget)
        );

        const progressLabel = document.createElement("div");
        progressLabel.className = "budget-progress-label";
        const usageText = document.createElement("span");
        usageText.textContent = "Budget used";
        const percentText = document.createElement("span");
        percentText.textContent = usagePercent + "%";
        progressLabel.append(usageText, percentText);

        const progressTrack = document.createElement("div");
        progressTrack.className = "budget-progress-track";
        progressTrack.setAttribute("role", "progressbar");
        progressTrack.setAttribute("aria-label", "Budget used for " + (trip.name || "trip"));
        progressTrack.setAttribute("aria-valuemin", "0");
        progressTrack.setAttribute("aria-valuemax", "100");
        progressTrack.setAttribute("aria-valuenow", String(Math.min(usagePercent, 100)));

        const progressFill = document.createElement("div");
        progressFill.className = "budget-progress-fill" + (overBudget ? " over-budget" : "");
        progressFill.style.width = Math.min(usagePercent, 100) + "%";
        progressTrack.appendChild(progressFill);

        const expensesSection = document.createElement("section");
        expensesSection.className = "budget-expenses";
        const expensesTitle = document.createElement("h4");
        expensesTitle.textContent = "Expenses";
        const expenseList = document.createElement("ul");
        expenseList.className = "budget-expense-list";

        if (expenses.length === 0) {
            const noExpenses = document.createElement("p");
            noExpenses.className = "budget-no-expenses";
            noExpenses.textContent = "No expenses added yet.";
            expensesSection.append(expensesTitle, noExpenses);
        } else {
            expenses.forEach(function (expense) {
                expenseList.appendChild(createExpenseRow(trip.id, expense));
            });
            expensesSection.append(expensesTitle, expenseList);
        }

        card.append(header, metrics, progressLabel, progressTrack, expensesSection);
        budgetTripList.appendChild(card);
    });

    const remaining = totalBudget - totalExpenses;
    document.getElementById("totalBudget").textContent = formatCurrency(totalBudget);
    document.getElementById("totalExpenses").textContent = formatCurrency(totalExpenses);
    const totalRemaining = document.getElementById("totalRemaining");
    totalRemaining.textContent = formatCurrency(remaining);
    totalRemaining.classList.toggle("over-budget", remaining < 0);
    budgetEmpty.hidden = trips.length > 0;
}

function createBudgetMetric(label, value, overBudget) {
    const metric = document.createElement("div");
    metric.className = "budget-trip-metric" + (label === "Remaining" ? " remaining" : "");
    if (overBudget) {
        metric.classList.add("over-budget");
    }

    const metricLabel = document.createElement("span");
    metricLabel.textContent = label;
    const metricValue = document.createElement("strong");
    metricValue.textContent = value;
    metric.append(metricLabel, metricValue);
    return metric;
}

function createExpenseRow(tripId, expense) {
    const item = document.createElement("li");
    item.className = "budget-expense-item";

    const details = document.createElement("div");
    details.className = "budget-expense-details";
    const name = document.createElement("strong");
    name.textContent = expense.name || "Untitled expense";
    const meta = document.createElement("span");
    meta.textContent = (expense.category || "Other") + " · " +
        (expense.date || "Date not set");
    details.append(name, meta);

    const actions = document.createElement("div");
    actions.className = "budget-expense-actions";
    const amount = document.createElement("span");
    amount.className = "budget-expense-amount";
    amount.textContent = formatCurrency(Number(expense.amount) || 0);

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "budget-delete-expense";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("aria-label", "Delete expense " + (expense.name || ""));
    deleteButton.addEventListener("click", function () {
        openExpenseDeleteConfirm(tripId, expense.id);
    });
    actions.append(amount, deleteButton);
    item.append(details, actions);
    return item;
}

function openExpenseModal(selectedTripId) {
    expenseForm.reset();
    expenseTrip.replaceChildren();

    trips.forEach(function (trip) {
        const option = document.createElement("option");
        option.value = String(trip.id);
        option.textContent = (trip.name || "Untitled trip") + " — " +
            (trip.destination || "Destination not set");
        expenseTrip.appendChild(option);
    });

    if (selectedTripId !== undefined && selectedTripId !== null) {
        expenseTrip.value = String(selectedTripId);
    }

    const date = new Date();
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    document.getElementById("expenseDate").value = date.toISOString().slice(0, 10);
    expenseModal.showModal();
}

function closeExpenseModal() {
    expenseModal.close();
}

function openExpenseDeleteConfirm(tripId, expenseId) {
    pendingExpenseDelete = {
        tripId: String(tripId),
        expenseId: String(expenseId)
    };
    confirmExpenseModal.showModal();
}

function closeExpenseDeleteConfirm() {
    pendingExpenseDelete = null;
    confirmExpenseModal.close();
}

function showBudgetError(message) {
    showCustomAlert(message);
}

document.getElementById("closeExpenseModal").addEventListener("click", closeExpenseModal);
document.getElementById("cancelExpense").addEventListener("click", closeExpenseModal);
expenseModal.addEventListener("click", function (event) {
    if (event.target === expenseModal) {
        closeExpenseModal();
    }
});

document.getElementById("closeExpenseConfirm").addEventListener("click", closeExpenseDeleteConfirm);
document.getElementById("cancelExpenseDelete").addEventListener("click", closeExpenseDeleteConfirm);
confirmExpenseModal.addEventListener("click", function (event) {
    if (event.target === confirmExpenseModal) {
        closeExpenseDeleteConfirm();
    }
});

document.getElementById("confirmExpenseDelete").addEventListener("click", function () {
    if (!pendingExpenseDelete) return;

    const updatedExpenses = Object.assign({}, expensesByTrip);
    updatedExpenses[pendingExpenseDelete.tripId] = getTripExpenses(pendingExpenseDelete.tripId)
        .filter(function (expense) {
            return String(expense.id) !== pendingExpenseDelete.expenseId;
        });

    try {
        saveCurrentUserExpenses(updatedExpenses);
        expensesByTrip = updatedExpenses;
        renderBudget();
        closeExpenseDeleteConfirm();
    } catch (error) {
        showBudgetError("Could not delete the expense. Your saved data has not been updated.");
    }
});

expenseForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const tripId = expenseTrip.value;
    const amount = Number(document.getElementById("expenseAmount").value);
    if (!trips.some(trip => String(trip.id) === tripId)) {
        showBudgetError("Select a trip before saving this expense.");
        return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
        showBudgetError("Enter an expense amount greater than zero.");
        return;
    }

    const expenseName = document.getElementById("expenseName").value.trim();
    if (!expenseName) {
        showBudgetError("Enter an expense name.");
        return;
    }

    const expense = {
        id: Date.now().toString() + Math.random().toString(36).slice(2),
        name: expenseName,
        category: document.getElementById("expenseCategory").value,
        amount: amount,
        date: document.getElementById("expenseDate").value
    };

    const updatedExpenses = Object.assign({}, expensesByTrip);
    const tripExpenses = getTripExpenses(tripId).slice();
    tripExpenses.unshift(expense);
    updatedExpenses[tripId] = tripExpenses;

    try {
        saveCurrentUserExpenses(updatedExpenses);
        expensesByTrip = updatedExpenses;
        renderBudget();
        closeExpenseModal();
    } catch (error) {
        showBudgetError("Could not save the expense. Your saved data has not been updated.");
    }
});

try {
    trips = loadCurrentUserTrips();
    expensesByTrip = loadCurrentUserExpenses();
    renderBudget();
    budgetData.hidden = false;
} catch (error) {
    budgetError.textContent = "Could not load budget data: " + error.message;
    budgetError.hidden = false;
}
