const homeSidebarToggle = document.getElementById("menuToggle");
const homeSidebar = document.getElementById("sidebar");

if (homeSidebarToggle && homeSidebar) {
    homeSidebarToggle.addEventListener("click", function () {
        const isOpen = homeSidebar.classList.toggle("open");
        homeSidebarToggle.setAttribute("aria-expanded", isOpen);
    });

    homeSidebar.querySelectorAll(".nav-link").forEach(function (link) {
        link.addEventListener("click", function () {
            homeSidebar.classList.remove("open");
            homeSidebarToggle.setAttribute("aria-expanded", "false");
        });
    });
}

const dashboardData = document.getElementById("dashboardData");
const dashboardGuestNotice = document.getElementById("dashboardGuestNotice");
const dashboardError = document.getElementById("dashboardError");
const dashboardWelcome = document.getElementById("dashboardWelcome");
const recentActivityList = document.getElementById("recentActivityList");
const recentActivityEmpty = document.getElementById("recentActivityEmpty");

function renderRecentActivities(trips, itineraries) {
    const tripsById = new Map(trips.map(trip => [String(trip.id), trip]));
    const activities = [];

    Object.keys(itineraries).forEach(function (tripId) {
        const tripActivities = itineraries[tripId];
        if (!Array.isArray(tripActivities)) {
            throw new Error("An itinerary has an unexpected format.");
        }

        tripActivities.forEach(function (activity) {
            activities.push({
                activity: activity,
                trip: tripsById.get(String(tripId))
            });
        });
    });

    activities.sort(function (first, second) {
        const firstOrder = String(first.activity.date || "") + String(first.activity.time || "");
        const secondOrder = String(second.activity.date || "") + String(second.activity.time || "");
        return firstOrder.localeCompare(secondOrder);
    });

    document.getElementById("dashboardTotalActivities").textContent = activities.length;
    recentActivityList.replaceChildren();

    activities.slice(0, 5).forEach(function (entry) {
        const card = document.createElement("article");
        card.className = "home-activity-card";

        const details = document.createElement("div");
        details.className = "home-activity-details";

        const name = document.createElement("h3");
        name.textContent = entry.activity.name || "Untitled activity";

        const tripName = document.createElement("p");
        tripName.className = "home-activity-trip";
        tripName.textContent = entry.trip
            ? entry.trip.name + " · " + entry.trip.destination
            : "Trip no longer available";

        const location = document.createElement("p");
        location.className = "home-activity-location";
        location.textContent = entry.activity.location || "Location not set";

        const date = document.createElement("time");
        date.className = "home-activity-date";
        date.dateTime = String(entry.activity.date || "");
        date.textContent = String(entry.activity.date || "Date not set") +
            (entry.activity.time ? " · " + entry.activity.time : "");

        details.append(name, tripName, location);
        card.append(details, date);
        recentActivityList.appendChild(card);
    });

    recentActivityEmpty.hidden = activities.length > 0;
}

function renderHomeDashboard() {
    if (!window.travelMateSession) {
        dashboardGuestNotice.hidden = false;
        dashboardData.hidden = true;
        return;
    }

    try {
        migrateLegacyTravelData(window.travelMateSession.userId);

        const trips = loadCurrentUserTrips();
        const itineraries = loadCurrentUserItineraries();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const completedTrips = trips.filter(function (trip) {
            return new Date(trip.endDate + "T00:00:00") < today;
        }).length;

        document.getElementById("dashboardTotalTrips").textContent = trips.length;
        document.getElementById("dashboardUpcomingTrips").textContent =
            trips.length - completedTrips;
        document.getElementById("dashboardCompletedTrips").textContent =
            completedTrips;

        renderRecentActivities(trips, itineraries);

        const firstName = String(window.travelMateSession.fullName || "Traveler")
            .trim()
            .split(/\s+/)[0];
        dashboardWelcome.textContent = "Welcome back, " + firstName + "!";
        dashboardGuestNotice.hidden = true;
        dashboardError.hidden = true;
        dashboardData.hidden = false;
    } catch (error) {
        dashboardGuestNotice.hidden = true;
        dashboardData.hidden = true;
        dashboardError.hidden = false;
    }
}

renderHomeDashboard();
