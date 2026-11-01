document.addEventListener("DOMContentLoaded", function () {

    const loginForm = document.getElementById("loginForm");
    const passwordInput = document.getElementById("password");
    const togglePassword = document.getElementById("togglePassword");
    const message = document.getElementById("loginMessage");
    const forgotPassword = document.getElementById("forgotPassword");

    // Show and hide password
    togglePassword.addEventListener("click", function () {

        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            togglePassword.textContent = "Hide";
        } else {
            passwordInput.type = "password";
            togglePassword.textContent = "Show";
        }

    });

    // Login form validation
    loginForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = passwordInput.value;

        message.textContent = "";
        message.className = "form-message";

        if (!email || !password) {
            showMessage("Please enter your email and password.", "error");
            return;
        }

        showMessage(
            "Your details have been entered. Login will be enabled after backend integration.",
            "success"
        );

    });

    // Forgot password message
    forgotPassword.addEventListener("click", function (event) {

        event.preventDefault();

        showMessage(
            "Password recovery will be available after backend integration.",
            "error"
        );

    });

    function showMessage(text, type) {
        message.textContent = text;
        message.className = "form-message " + type;
    }

});