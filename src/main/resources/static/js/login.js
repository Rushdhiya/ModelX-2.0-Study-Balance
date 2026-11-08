document.addEventListener("DOMContentLoaded", function () {

    const loginForm = document.getElementById("loginForm");
    const passwordInput = document.getElementById("password");
    const togglePassword = document.getElementById("togglePassword");
    const message = document.getElementById("loginMessage");
    const forgotPassword = document.getElementById("forgotPassword");

    // Show / hide password
    togglePassword.addEventListener("click", function () {
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            togglePassword.textContent = "Hide";
        } else {
            passwordInput.type = "password";
            togglePassword.textContent = "Show";
        }
    });

    // Login with Spring Boot backend
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
            // Step 1: Get CSRF token
            const csrfResponse = await fetch("/api/csrf", {
                method: "GET",
                credentials: "same-origin"
            });

            if (!csrfResponse.ok) {
                throw new Error("Failed to fetch CSRF token");
            }

            const csrf = await csrfResponse.json();

            // Step 2: Login with CSRF token
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    [csrf.headerName]: csrf.token
                },
                credentials: "same-origin",
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok) {
                showMessage(
                    "Login successful! Welcome " + data.fullName,
                    "success"
                );

                window.location.href = "/dashboard.html";
            } else {
                showMessage(
                    data.message || "Invalid email or password.",
                    "error"
                );
            }

        } catch (error) {
            showMessage(
                "Cannot connect to backend. Please try again.",
                "error"
            );
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