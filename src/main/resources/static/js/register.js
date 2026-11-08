
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

        try {
            showMessage("Creating your account...", "success");

            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    fullName: fullName,
                    email: email,
                    password: password,
                    confirmPassword: confirmPassword
                })
            });

            const result = await response.json();

            if (response.ok) {
                showMessage(result.message, "success");
                registerForm.reset();
            } else {
                showMessage(
                    result.message || "Registration failed. Please try again.",
                    "error"
                );
            }

        } catch (error) {
            showMessage(
                "Cannot connect to the server. Please try again.",
                "error"
            );
            console.error("Registration error:", error);
        }

    });

    function showMessage(text, type) {
        message.textContent = text;
        message.classList.add(type);
    }

});
