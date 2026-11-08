document.addEventListener("DOMContentLoaded", function () {

    const registerForm = document.getElementById("registerForm");
    const message = document.getElementById("registerMessage");

    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const fullName = document.getElementById("fullName").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword =
            document.getElementById("confirmPassword").value;

        message.textContent = "";
        message.className = "form-message";

        // Validate registration fields
        if (!fullName || !email || !password || !confirmPassword) {
            showMessage("Please fill in all fields.", "error");
            return;
        }

        if (password.length < 8) {
            showMessage(
                "Password must contain at least 8 characters.",
                "error"
            );
            return;
        }

        if (password !== confirmPassword) {
            showMessage(
                "Passwords do not match. Please try again.",
                "error"
            );
            return;
        }

        try {
            // Step 1: Fetch CSRF token
            const csrfResponse = await fetch("/api/csrf", {
                method: "GET",
                credentials: "same-origin"
            });

            if (!csrfResponse.ok) {
                throw new Error("Failed to fetch CSRF token");
            }

            const csrf = await csrfResponse.json();

            // Step 2: Register with backend
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    [csrf.headerName]: csrf.token
                },
                credentials: "same-origin",
                body: JSON.stringify({
                    fullName: fullName,
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok) {
                showMessage(
                    "Registration successful! Please login.",
                    "success"
                );

                registerForm.reset();

                setTimeout(function () {
                    window.location.href = "/login.html";
                }, 1500);

            } else {
                showMessage(
                    data.message || "Registration failed. Please try again.",
                    "error"
                );
            }

        } catch (error) {
            showMessage(
                "Unable to connect to the server. Please try again.",
                "error"
            );
        }
    });

    function showMessage(text, type) {
        message.textContent = text;
        message.className = "form-message " + type;
    }

});