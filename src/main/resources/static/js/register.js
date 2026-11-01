document.addEventListener("DOMContentLoaded", function () {

    const registerForm = document.getElementById("registerForm");
    const message = document.getElementById("registerMessage");

    registerForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const fullName = document.getElementById("fullName").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword =
            document.getElementById("confirmPassword").value;

        message.textContent = "";
        message.className = "form-message";

        if (!fullName || !email || !password || !confirmPassword) {
            showMessage("Please fill in all fields.", "error");
            return;
        }

        if (password.length < 8) {
            showMessage("Password must contain at least 8 characters.", "error");
            return;
        }

        if (password !== confirmPassword) {
            showMessage("Passwords do not match. Please try again.", "error");
            return;
        }

        showMessage(
            "Your details are valid! Account creation will be enabled after backend integration.",
            "success"
        );

    });

    function showMessage(text, type) {
        message.textContent = text;
        message.classList.add(type);
    }

});