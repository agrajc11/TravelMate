const favoritesSidebar = document.getElementById("sidebar");
const favoritesMenuToggle = document.getElementById("menuToggle");

if (favoritesSidebar && favoritesMenuToggle) {
    favoritesMenuToggle.addEventListener("click", function () {
        const isOpen = favoritesSidebar.classList.toggle("open");
        favoritesMenuToggle.setAttribute("aria-expanded", String(isOpen));
    });
}

const favoritesData = document.getElementById("favoritesData");
const favoritesError = document.getElementById("favoritesError");
const favoritesContainer = document.getElementById("favoritesContainer");
const favoritesEmpty = document.getElementById("favoritesEmpty");
const favoritesControls = document.getElementById("favoritesControls");
const favoritesSearch = document.getElementById("favoritesSearch");
const favoritesCategory = document.getElementById("favoritesCategory");
const favoritesNoResults = document.getElementById("favoritesNoResults");
const favoritesStatus = document.getElementById("favoritesStatus");

let favorites = [];

function renderFavorites() {
    const searchValue = favoritesSearch.value.trim().toLowerCase();
    const selectedCategory = favoritesCategory.value;
    const visibleFavorites = favorites.filter(function (favorite) {
        const searchableText = [
            favorite.name || "",
            favorite.location || "",
            favorite.categoryLabel || ""
        ].join(" ").toLowerCase();
        const matchesSearch = searchableText.includes(searchValue);
        const matchesCategory =
            selectedCategory === "all" || favorite.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    favoritesContainer.replaceChildren();

    visibleFavorites.forEach(function (favorite) {
        const card = document.createElement("article");
        card.className = "destination-card";
        card.dataset.category = favorite.category || "other";

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.className = "favorite-toggle";
        removeButton.textContent = "♥";
        removeButton.setAttribute("aria-pressed", "true");
        removeButton.setAttribute(
            "aria-label",
            "Remove " + (favorite.name || "destination") + " from favorites"
        );
        removeButton.addEventListener("click", function () {
            const updatedFavorites = favorites.filter(function (item) {
                return item.id !== favorite.id;
            });

            try {
                saveCurrentUserFavorites(updatedFavorites);
                favorites = updatedFavorites;
                renderFavorites();
                favoritesStatus.textContent =
                    (favorite.name || "Destination") + " removed from favorites.";
            } catch (error) {
                showCustomAlert("Could not update your favorites. Please try again.");
            }
        });

        const image = document.createElement("img");
        image.src = favorite.image || "";
        image.alt = favorite.imageAlt || (favorite.name || "Favorite destination");

        const info = document.createElement("div");
        info.className = "destination-info";

        const category = document.createElement("span");
        category.className = "destination-category";
        category.textContent = favorite.categoryLabel || "Destination";

        const title = document.createElement("h3");
        title.textContent = favorite.name || "Untitled destination";

        const location = document.createElement("p");
        location.textContent = favorite.location || "Location not set";

        info.append(category, title, location);
        card.append(removeButton, image, info);
        favoritesContainer.appendChild(card);
    });

    favoritesEmpty.hidden = favorites.length > 0;
    favoritesControls.hidden = favorites.length === 0;
    favoritesNoResults.hidden =
        favorites.length === 0 || visibleFavorites.length > 0;
}

favoritesSearch.addEventListener("input", renderFavorites);
favoritesCategory.addEventListener("change", renderFavorites);

try {
    favorites = loadCurrentUserFavorites();
    renderFavorites();
    favoritesData.hidden = false;
} catch (error) {
    favoritesError.textContent = "Could not load favorites: " + error.message;
    favoritesError.hidden = false;
}
