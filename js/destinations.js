
// Get HTML elements
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");

const destinationCards = document.querySelectorAll(".destination-card");
const noResults = document.getElementById("noResults");

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

console.log("Destination module loaded successfully!");
