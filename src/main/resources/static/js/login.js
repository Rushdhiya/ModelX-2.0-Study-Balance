
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

    // Login form
    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = passwordInput.value;

        message.textContent = "";
        message.className = "form-message";

        if (!email || !password) {
            showMessage("Please enter your email and password.", "error");
            return;
        }

        try {
            showMessage("Logging in...", "success");

            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const result = await response.json();

            if (response.ok) {

                showMessage("Login successful! Redirecting...", "success");

                // Save user details for the frontend
                localStorage.setItem("userId", result.userId);
                localStorage.setItem("fullName", result.fullName);
                localStorage.setItem("email", result.email);

                // Open dashboard
                setTimeout(function () {
                    window.location.href = "dashboard.html";
                }, 1000);

            } else {
                showMessage(
                    result.message || "Invalid email or password.",
                    "error"
                );
            }

        } catch (error) {
            showMessage(
                "Cannot connect to the server. Please try again.",
                "error"
            );
            console.error("Login error:", error);
        }

    });

    // Forgot password
    forgotPassword.addEventListener("click", function (event) {

        event.preventDefault();

        showMessage(
            "Password recovery is not available yet.",
            "error"
        );

    });

    function showMessage(text, type) {
        message.textContent = text;
        message.className = "form-message " + type;
    }

});
