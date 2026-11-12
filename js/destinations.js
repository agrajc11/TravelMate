
// Get HTML elements
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");

const destinationCards = document.querySelectorAll(".destination-card");
const noResults = document.getElementById("noResults");
const destinationSidebarToggle = document.getElementById("menuToggle");
const destinationSidebar = document.getElementById("sidebar");
const favoriteStatus = document.getElementById("favoriteStatus");

let favorites = [];
let favoritesAvailable = true;

try {
    favorites = loadCurrentUserFavorites();
} catch (error) {
    favoritesAvailable = false;
    showCustomAlert("Could not load your favorites: " + error.message);
}

function updateFavoriteButton(button, destination) {
    const isFavorite = favorites.some(function (favorite) {
        return favorite.id === destination.id;
    });

    button.textContent = isFavorite ? "♥" : "♡";
    button.setAttribute("aria-pressed", String(isFavorite));
    button.setAttribute(
        "aria-label",
        (isFavorite ? "Remove " : "Add ") + destination.name + " " +
            (isFavorite ? "from" : "to") + " favorites"
    );
}

destinationCards.forEach(function (card) {
    const image = card.querySelector("img");
    const destination = {
        id: card.dataset.destinationId,
        name: card.querySelector("h3").textContent,
        location: card.querySelector(".destination-info p").textContent,
        category: card.dataset.category,
        categoryLabel: card.querySelector(".destination-category").textContent,
        image: image.getAttribute("src"),
        imageAlt: image.alt
    };

    const favoriteButton = document.createElement("button");
    favoriteButton.type = "button";
    favoriteButton.className = "favorite-toggle";
    favoriteButton.setAttribute("aria-pressed", "false");
    favoriteButton.disabled = !favoritesAvailable;
    updateFavoriteButton(favoriteButton, destination);
    card.insertBefore(favoriteButton, card.firstChild);

    favoriteButton.addEventListener("click", function () {
        const alreadyFavorite = favorites.some(function (favorite) {
            return favorite.id === destination.id;
        });
        const updatedFavorites = alreadyFavorite
            ? favorites.filter(favorite => favorite.id !== destination.id)
            : favorites.concat(destination);

        try {
            saveCurrentUserFavorites(updatedFavorites);
            favorites = updatedFavorites;
            updateFavoriteButton(favoriteButton, destination);
            favoriteStatus.textContent = destination.name +
                (alreadyFavorite ? " removed from" : " added to") + " favorites.";
        } catch (error) {
            showCustomAlert("Could not update your favorites. Please try again.");
        }
    });
});

// Function to filter destinations
function filterDestinations() {

    const searchValue = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;

    let visibleCount = 0;

    destinationCards.forEach(function(card) {

        const destinationName =
            card.querySelector("h3").textContent.toLowerCase();

        const destinationLocation =
            card.querySelector("p").textContent.toLowerCase();

        const category = card.dataset.category;

        const matchesSearch =
            destinationName.includes(searchValue) ||
            destinationLocation.includes(searchValue);

        const matchesCategory =
            selectedCategory === "all" ||
            category === selectedCategory;

        if (matchesSearch && matchesCategory) {

            card.style.display = "block";
            visibleCount++;

        } else {

            card.style.display = "none";

        }

    });

    // Show message if no destination matches
    noResults.style.display =
        visibleCount === 0 ? "block" : "none";
}

// Search event
searchInput.addEventListener("input", filterDestinations);

// Category filter event
categoryFilter.addEventListener("change", filterDestinations);

if (destinationSidebarToggle && destinationSidebar) {
    destinationSidebarToggle.addEventListener("click", function() {
        const isOpen = destinationSidebar.classList.toggle("open");
        destinationSidebarToggle.setAttribute("aria-expanded", isOpen);
    });

    destinationSidebar.querySelectorAll(".nav-link").forEach(function(link) {
        link.addEventListener("click", function() {
            destinationSidebar.classList.remove("open");
            destinationSidebarToggle.setAttribute("aria-expanded", "false");
        });
    });
}

console.log("Destination module loaded successfully!");
