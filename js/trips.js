
if (!window.travelMateSession) {
    window.location.replace("login.html");
} else {
const tripForm = document.getElementById("tripForm");
const tripModal = document.getElementById("tripModal");
const tripList = document.getElementById("tripList");
const confirmModal = document.getElementById("confirmModal");
const confirmMessage = document.getElementById("confirmMessage");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

let trips = loadCurrentUserTrips();
let editingTripId = null;
let pendingDeleteTripId = null;

if (typeof showCustomAlert !== "function") {
    window.showCustomAlert = function(message) {
        const modal = document.getElementById("customAlertModal");
        const text = document.getElementById("customAlertText");

        if (modal && text) {
            text.textContent = message;
            modal.showModal();
            return;
        }

        alert(message);
    };
}

const today = new Date();
today.setHours(0, 0, 0, 0);

function saveTrips() {
    saveCurrentUserTrips(trips);
}

function closeDeleteConfirm() {
    pendingDeleteTripId = null;
    confirmModal.close();
}

function openDeleteConfirm(id) {
    pendingDeleteTripId = id;
    confirmMessage.textContent = "Are you sure you want to delete this trip?";
    confirmModal.showModal();
}

function openTripModal() {
    tripForm.reset();
    editingTripId = null;
    document.getElementById("modalTitle").textContent = "Create New Trip";
    document.getElementById("travelers").value = 1;
    tripModal.showModal();
}

function closeTripModal() {
    tripModal.close();
}

document.getElementById("openTripModal").addEventListener("click", openTripModal);
document.getElementById("emptyAddButton").addEventListener("click", openTripModal);
document.getElementById("closeTripModal").addEventListener("click", closeTripModal);
document.getElementById("cancelTrip").addEventListener("click", closeTripModal);
document.getElementById("closeConfirmModal").addEventListener("click", closeDeleteConfirm);
document.getElementById("cancelConfirmDelete").addEventListener("click", closeDeleteConfirm);

confirmDeleteBtn.addEventListener("click", function() {
    if (pendingDeleteTripId === null) return;

    trips = trips.filter(item => item.id !== pendingDeleteTripId);
    saveTrips();
    renderTrips();
    closeDeleteConfirm();
});

// Close when clicking outside the popup
tripModal.addEventListener("click", function(event) {
    if (event.target === tripModal) {
        closeTripModal();
    }
});

confirmModal.addEventListener("click", function(event) {
    if (event.target === confirmModal) {
        closeDeleteConfirm();
    }
});

// Add or update a trip
tripForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const isNewTrip = editingTripId === null;
    const trip = {
        id: editingTripId || Date.now(),
        name: document.getElementById("tripName").value.trim(),
        destination: document.getElementById("destination").value.trim(),
        startDate: document.getElementById("startDate").value,
        endDate: document.getElementById("endDate").value,
        travelers: Number(document.getElementById("travelers").value),
        budget: Number(document.getElementById("budget").value) || 0,
        notes: document.getElementById("notes").value.trim()
    };

    if (trip.endDate < trip.startDate) {
        if (typeof showCustomAlert === "function") {
            showCustomAlert("End date cannot be earlier than start date.");
        } else {
            alert("End date cannot be earlier than start date.");
        }
        return;
    }

    if (editingTripId) {
        trips = trips.map(item =>
            item.id === editingTripId ? trip : item
        );
    } else {
        trips.push(trip);
    }

    saveTrips();
    if (isNewTrip) {
        document.getElementById("tripSearch").value = "";
        document.getElementById("tripFilter").value = "all";
    }
    renderTrips();
    closeTripModal();
});

// Edit trip
function editTrip(id) {
    const trip = trips.find(item => item.id === id);
    if (!trip) return;

    editingTripId = id;

    document.getElementById("modalTitle").textContent = "Edit Trip";
    document.getElementById("tripName").value = trip.name;
    document.getElementById("destination").value = trip.destination;
    document.getElementById("startDate").value = trip.startDate;
    document.getElementById("endDate").value = trip.endDate;
    document.getElementById("travelers").value = trip.travelers;
    document.getElementById("budget").value = trip.budget;
    document.getElementById("notes").value = trip.notes || "";

    tripModal.showModal();
}

// Delete trip
function deleteTrip(id) {
    openDeleteConfirm(id);
}

// Determine trip status
function getTripStatus(trip) {
    const endDate = new Date(trip.endDate + "T00:00:00");
    return endDate < today ? "Completed" : "Upcoming";
}

// Render trip cards
function renderTrips() {
    const searchText = document.getElementById("tripSearch").value.toLowerCase();
    const filter = document.getElementById("tripFilter").value;

    const upcoming = trips.filter(trip => getTripStatus(trip) === "Upcoming");
    const completed = trips.filter(trip => getTripStatus(trip) === "Completed");

    document.getElementById("totalTrips").textContent = trips.length;
    document.getElementById("upcomingTrips").textContent = upcoming.length;
    document.getElementById("completedTrips").textContent = completed.length;

    const filteredTrips = trips.filter(trip => {
        const matchesSearch =
            String(trip.name || "").toLowerCase().includes(searchText) ||
            String(trip.destination || "").toLowerCase().includes(searchText);

        const status = getTripStatus(trip).toLowerCase();
        const matchesFilter = filter === "all" || status === filter;

        return matchesSearch && matchesFilter;
    });

    tripList.innerHTML = "";

    document.getElementById("emptyState").style.display =
        filteredTrips.length === 0 ? "block" : "none";

    filteredTrips.forEach(trip => {
        const card = document.createElement("article");
        card.className = "trip-card";

        const title = document.createElement("h3");
        title.textContent = trip.name || "Untitled trip";

        const destination = document.createElement("p");
        destination.className = "trip-destination";
        destination.textContent = "📍 " + (trip.destination || "Destination not set");

        const dates = document.createElement("p");
        dates.className = "trip-detail";
        dates.textContent = "📅 " + (trip.startDate || "Start date not set") +
            " to " + (trip.endDate || "End date not set");

        const travelers = document.createElement("p");
        travelers.className = "trip-detail";
        travelers.textContent = "👥 " + (Number(trip.travelers) || 1) + " traveler(s)";

        const budget = document.createElement("p");
        budget.className = "trip-detail";
        budget.textContent = "₹ " + (Number(trip.budget) || 0).toLocaleString("en-IN");

        const status = document.createElement("span");
        status.className = "trip-status";
        status.textContent = getTripStatus(trip);

        const actions = document.createElement("div");
        actions.className = "trip-actions";

        const editButton = document.createElement("button");
        const editIcon = document.createElement("span");
        editIcon.className = "trip-action-icon";
        editIcon.setAttribute("aria-hidden", "true");
        editIcon.textContent = "✎";
        editButton.append(editIcon, document.createTextNode("Edit"));
        editButton.setAttribute("aria-label", "Edit trip");
        editButton.addEventListener("click", () => editTrip(trip.id));

        const deleteButton = document.createElement("button");
        const deleteIcon = document.createElement("span");
        deleteIcon.className = "trip-action-icon";
        deleteIcon.setAttribute("aria-hidden", "true");
        deleteIcon.textContent = "🗑";
        deleteButton.append(deleteIcon, document.createTextNode("Delete"));
        deleteButton.className = "delete-btn";
        deleteButton.setAttribute("aria-label", "Delete trip");
        deleteButton.addEventListener("click", () => deleteTrip(trip.id));

        actions.append(editButton, deleteButton);
        card.append(title, destination, dates, travelers, budget, status, actions);
        tripList.appendChild(card);
    });
}

// Search and filter
document.getElementById("tripSearch").addEventListener("input", renderTrips);
document.getElementById("tripFilter").addEventListener("change", renderTrips);

// Mobile sidebar
document.getElementById("menuToggle").addEventListener("click", function() {
    document.getElementById("sidebar").classList.toggle("open");
});

// Initial display
renderTrips();
}
