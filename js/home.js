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
