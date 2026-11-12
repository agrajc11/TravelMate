
const tripSelect = document.getElementById("selectedTrip");
const activityForm = document.getElementById("activityForm");
const activityModal = document.getElementById("activityModal");
const activityList = document.getElementById("activityList");
const confirmModal = document.getElementById("confirmModal");
const confirmMessage = document.getElementById("confirmMessage");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

let trips = JSON.parse(localStorage.getItem("travelMateTrips")) || [];
let itineraries = JSON.parse(localStorage.getItem("travelMateItineraries")) || {};

let editingActivityId = null;
let pendingDeleteActivityId = null;

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

function closeDeleteConfirm() {
    pendingDeleteActivityId = null;
    confirmModal.close();
}

function openDeleteConfirm(id) {
    pendingDeleteActivityId = id;
    confirmMessage.textContent = "Are you sure you want to delete this activity?";
    confirmModal.showModal();
}

// Get activities belonging to the selected trip
function getActivities() {
    const tripId = tripSelect.value;

    if (!tripId || !Array.isArray(itineraries[tripId])) {
        return [];
    }

    return itineraries[tripId];
}

// Save itinerary data
function saveItineraries() {
    localStorage.setItem(
        "travelMateItineraries",
        JSON.stringify(itineraries)
    );
}

// Load saved trips into dropdown
function loadTrips() {
    tripSelect.innerHTML = '<option value="">Select a saved trip</option>';

    trips.forEach(trip => {
        const option = document.createElement("option");
        option.value = String(trip.id);
        option.textContent = trip.name + " - " + trip.destination;
        tripSelect.appendChild(option);
    });
}

// Open popup
function openActivityModal() {
    const tripId = tripSelect.value;

    if (!tripId) {
        if (typeof showCustomAlert === "function") {
            showCustomAlert("Please select a trip first.");
        } else {
            alert("Please select a trip first.");
        }
        return;
    }

    const selectedTrip = trips.find(
        trip => String(trip.id) === tripId
    );

    if (!selectedTrip) return;

    activityForm.reset();
    editingActivityId = null;

    document.getElementById("modalTitle").textContent =
        "Add New Activity";

    // Keep activity dates inside the trip dates
    document.getElementById("activityDate").min = selectedTrip.startDate;
    document.getElementById("activityDate").max = selectedTrip.endDate;

    activityModal.showModal();
}

// Close popup
function closeActivityModal() {
    activityModal.close();
}

document.getElementById("openActivityModal")
    .addEventListener("click", openActivityModal);

document.getElementById("emptyAddButton")
    .addEventListener("click", openActivityModal);

document.getElementById("closeActivityModal")
    .addEventListener("click", closeActivityModal);

document.getElementById("cancelActivity")
    .addEventListener("click", closeActivityModal);
document.getElementById("closeConfirmModal")
    .addEventListener("click", closeDeleteConfirm);
document.getElementById("cancelConfirmDelete")
    .addEventListener("click", closeDeleteConfirm);

confirmDeleteBtn.addEventListener("click", function() {
    if (pendingDeleteActivityId === null) return;

    const tripId = tripSelect.value;
    const activities = getActivities();

    itineraries[tripId] = activities.filter(
        item => item.id !== pendingDeleteActivityId
    );

    saveItineraries();
    renderActivities();
    closeDeleteConfirm();
});

// Close popup when clicking outside it
activityModal.addEventListener("click", function(event) {
    if (event.target === activityModal) {
        closeActivityModal();
    }
});

confirmModal.addEventListener("click", function(event) {
    if (event.target === confirmModal) {
        closeDeleteConfirm();
    }
});

// Add or update activity
activityForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const tripId = tripSelect.value;
    const selectedTrip = trips.find(
        trip => String(trip.id) === tripId
    );

    if (!selectedTrip) {
        if (typeof showCustomAlert === "function") {
            showCustomAlert("Please select a valid trip.");
        } else {
            alert("Please select a valid trip.");
        }
        return;
    }

    const activity = {
        id: editingActivityId || Date.now(),
        name: document.getElementById("activityName").value.trim(),
        date: document.getElementById("activityDate").value,
        time: document.getElementById("activityTime").value,
        location: document.getElementById("activityLocation").value.trim(),
        notes: document.getElementById("activityNotes").value.trim()
    };

    if (
        activity.date < selectedTrip.startDate ||
        activity.date > selectedTrip.endDate
    ) {
        if (typeof showCustomAlert === "function") {
            showCustomAlert("Activity date must be within your trip dates.");
        } else {
            alert("Activity date must be within your trip dates.");
        }
        return;
    }

    if (!Array.isArray(itineraries[tripId])) {
        itineraries[tripId] = [];
    }

    if (editingActivityId) {
        itineraries[tripId] = itineraries[tripId].map(item =>
            item.id === editingActivityId ? activity : item
        );
    } else {
        itineraries[tripId].push(activity);
    }

    saveItineraries();
    renderActivities();
    closeActivityModal();
});

// Edit activity
function editActivity(id) {
    const activity = getActivities().find(
        item => item.id === id
    );

    const selectedTrip = trips.find(
        trip => String(trip.id) === tripSelect.value
    );

    if (!activity || !selectedTrip) return;

    editingActivityId = id;

    document.getElementById("modalTitle").textContent =
        "Edit Activity";

    document.getElementById("activityName").value = activity.name;
    document.getElementById("activityDate").value = activity.date;
    document.getElementById("activityTime").value = activity.time;
    document.getElementById("activityLocation").value = activity.location;
    document.getElementById("activityNotes").value = activity.notes || "";

    document.getElementById("activityDate").min = selectedTrip.startDate;
    document.getElementById("activityDate").max = selectedTrip.endDate;

    activityModal.showModal();
}

// Delete activity
function deleteActivity(id) {
    openDeleteConfirm(id);
}

// Display activity cards
function renderActivities() {
    const searchText = document
        .getElementById("activitySearch")
        .value.toLowerCase();

    const selectedDate = document
        .getElementById("activityDateFilter")
        .value;

    const activities = getActivities();

    const filteredActivities = activities
        .filter(activity => {
            const matchesSearch =
                activity.name.toLowerCase().includes(searchText) ||
                activity.location.toLowerCase().includes(searchText);

            const matchesDate =
                !selectedDate || activity.date === selectedDate;

            return matchesSearch && matchesDate;
        })
        .sort((a, b) =>
            (a.date + a.time).localeCompare(b.date + b.time)
        );

    document.getElementById("totalActivities").textContent =
        activities.length;

    activityList.innerHTML = "";

    document.getElementById("emptyState").style.display =
        filteredActivities.length === 0 ? "block" : "none";

    filteredActivities.forEach(activity => {
        const card = document.createElement("article");
        card.className = "activity-card";

        const title = document.createElement("h3");
        title.textContent = activity.name;

        const date = document.createElement("p");
        date.className = "activity-detail";
        date.textContent = "📅 " + activity.date;

        const time = document.createElement("p");
        time.className = "activity-detail";
        time.textContent = "🕒 " + activity.time;

        const location = document.createElement("p");
        location.className = "activity-detail";
        location.textContent = "📍 " + activity.location;

        const notes = document.createElement("p");
        notes.className = "activity-notes";
        notes.textContent = activity.notes || "No additional notes.";

        const actions = document.createElement("div");
        actions.className = "activity-actions";

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () =>
            editActivity(activity.id)
        );

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";
        deleteButton.addEventListener("click", () =>
            deleteActivity(activity.id)
        );

        actions.append(editButton, deleteButton);
        card.append(title, date, time, location, notes, actions);

        activityList.appendChild(card);
    });
}

// Trip selection
tripSelect.addEventListener("change", function() {
    document.getElementById("activitySearch").value = "";
    document.getElementById("activityDateFilter").value = "";
    renderActivities();
});

// Search and date filter
document.getElementById("activitySearch")
    .addEventListener("input", renderActivities);

document.getElementById("activityDateFilter")
    .addEventListener("change", renderActivities);

// Mobile sidebar
document.getElementById("menuToggle")
    .addEventListener("click", function() {
        document.getElementById("sidebar").classList.toggle("open");
    });

// Initial setup
loadTrips();
renderActivities();
