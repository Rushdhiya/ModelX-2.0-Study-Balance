// Wait until the page is fully loaded
document.addEventListener("DOMContentLoaded", function () {

    console.log("Study Balance Home Page Loaded Successfully!");

    // Mobile Navigation Menu
    const menuToggle = document.getElementById("menuToggle");
    const navLinks = document.querySelector(".nav-links");
    const navButtons = document.querySelector(".nav-buttons");

    menuToggle.addEventListener("click", function () {
        navLinks.classList.toggle("active");
        navButtons.classList.toggle("active");
    });

    // Close mobile menu after clicking a navigation link
    const navigationLinks = document.querySelectorAll(".nav-links a");

    navigationLinks.forEach(function (link) {
        link.addEventListener("click", function () {
            navLinks.classList.remove("active");
            navButtons.classList.remove("active");
        });
    });

});