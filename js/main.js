
// TravelMate - Main JavaScript

console.log("Welcome to TravelMate!");

function showCustomAlert(message) {
    const alertModal = document.getElementById("customAlertModal");
    const alertText = document.getElementById("customAlertText");

    if (alertModal && alertText) {
        alertText.textContent = message;
        alertModal.showModal();
        return;
    }

    alert(message);
}

// Hamburger Menu Functionality

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (menuToggle && navLinks) {

    menuToggle.addEventListener("click", function () {

        navLinks.classList.toggle("active");

        const isOpen = navLinks.classList.contains("active");

        menuToggle.textContent = isOpen ? "✕" : "☰";

        menuToggle.setAttribute("aria-expanded", isOpen);

    });

    // Close menu after clicking a navigation link
    navLinks.querySelectorAll("a").forEach(function(link) {

        link.addEventListener("click", function() {

            navLinks.classList.remove("active");

            menuToggle.textContent = "☰";

            menuToggle.setAttribute("aria-expanded", "false");

        });

    });

}

const customAlertModal = document.getElementById("customAlertModal");
const closeCustomAlertBtn = document.getElementById("closeCustomAlert");

if (customAlertModal && closeCustomAlertBtn) {
    closeCustomAlertBtn.addEventListener("click", function() {
        customAlertModal.close();
    });

    customAlertModal.addEventListener("click", function(event) {
        if (event.target === customAlertModal) {
            customAlertModal.close();
        }
    });
}
