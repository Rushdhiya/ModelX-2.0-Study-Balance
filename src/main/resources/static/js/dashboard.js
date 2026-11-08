
// Study Balance Dashboard

document.addEventListener("DOMContentLoaded", function () {

    // --------------------------------
    // Display Logged-in User's Name
    // --------------------------------

    async function loadUserName() {
        try {
            const response = await fetch("/api/auth/me");

            if (response.status === 401) {
                window.location.href = "login.html";
                return;
            }

            if (!response.ok) {
                throw new Error("Unable to load user details");
            }

            const user = await response.json();

            document.getElementById("dashboardUserName").textContent =
                user.fullName;

        } catch (error) {
            console.error("Error loading user:", error);
        }
    }

    loadUserName();

    // --------------------------------
    // Display Today's Date
    // --------------------------------

    const today = new Date();

    document.getElementById("currentDate").textContent =
        today.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });


    // --------------------------------
    // Get Saved Daily Entries
    // --------------------------------

    const entries = JSON.parse(
        localStorage.getItem("studyBalanceEntries") || "[]"
    );


    // Get today's date in YYYY-MM-DD format
    const localDate = new Date(
        today.getTime() - today.getTimezoneOffset() * 60000
    ).toISOString().split("T")[0];


    // --------------------------------
    // Find Today's Entry
    // --------------------------------

    const todayEntry = entries.find(
        entry => entry.date === localDate
    );


    // --------------------------------
    // Display Today's Overview
    // --------------------------------

    if (todayEntry) {

        // Display today's study hours
        document.getElementById("dashboardStudy").textContent =
            todayEntry.studyHours + " Hours";

        // Display today's sleep hours
        document.getElementById("dashboardSleep").textContent =
            todayEntry.sleepHours + " Hours";

        // Display today's physical activity
        document.getElementById("dashboardActivity").textContent =
            todayEntry.activityMinutes + " Min";

        // Display today's screen time
        document.getElementById("dashboardScreen").textContent =
            todayEntry.screenHours + " Hours";


        // --------------------------------
        // Calculate Balance Score
        // --------------------------------

        let score = 0;

        // Study score: 6–8 hours
        if (todayEntry.studyHours >= 6 && todayEntry.studyHours <= 8) {
            score += 25;
        } else if (todayEntry.studyHours >= 4) {
            score += 15;
        }

        // Sleep score: 7–9 hours
        if (todayEntry.sleepHours >= 7 && todayEntry.sleepHours <= 9) {
            score += 25;
        } else if (todayEntry.sleepHours >= 6) {
            score += 15;
        }

        // Physical activity score: 30 minutes or more
        if (todayEntry.activityMinutes >= 30) {
            score += 25;
        } else if (todayEntry.activityMinutes >= 15) {
            score += 15;
        }

        // Screen time score: 2 hours or less
        if (todayEntry.screenHours <= 2) {
            score += 25;
        } else if (todayEntry.screenHours <= 4) {
            score += 15;
        }

        // Display the final balance score
        document.getElementById("dashboardScore").textContent =
            score + "%";

    } else {

        // Display messages when no entry exists
        document.getElementById("dashboardStudy").textContent = "No Entry";

        document.getElementById("dashboardSleep").textContent = "No Entry";

        document.getElementById("dashboardActivity").textContent = "No Entry";

        document.getElementById("dashboardScreen").textContent = "No Entry";

        document.getElementById("dashboardScore").textContent = "--";
    }


    // --------------------------------
    // Display Recent Activity
    // --------------------------------

    const recentActivityBody =
        document.getElementById("recentActivityBody");

    const noRecentActivity =
        document.getElementById("noRecentActivity");


    // Sort entries from newest to oldest
    const sortedEntries = [...entries].sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
    });


    // Get the latest three records
    const recentEntries = sortedEntries.slice(0, 3);


    // Clear existing table rows
    recentActivityBody.innerHTML = "";


    // Check whether records are available
    if (recentEntries.length === 0) {

        noRecentActivity.hidden = false;

    } else {

        noRecentActivity.hidden = true;

        // Display each recent record
        recentEntries.forEach(function (entry) {

            const row = document.createElement("tr");

            const values = [
                entry.date,
                entry.studyHours + " Hours",
                entry.sleepHours + " Hours",
                entry.mood || "Not specified"
            ];

            // Create table cells
            values.forEach(function (value) {

                const cell = document.createElement("td");

                cell.textContent = value;

                row.appendChild(cell);

            });

            // Add row to the Recent Activity table
            recentActivityBody.appendChild(row);

        });

    }


    console.log("Study Balance Dashboard Loaded Successfully!");

    // Logout functionality
    const logoutButton = document.getElementById("logoutButton");

    if (logoutButton) {
        logoutButton.addEventListener("click", async function (event) {
            event.preventDefault();

        try {
            const response = await fetch("/api/auth/logout", {
                method: "POST"
            });

            if (response.ok) {
                localStorage.clear();
                window.location.href = "login.html";
            } else {
                alert("Logout failed. Please try again.");
            }
        } catch (error) {
            alert("Unable to connect to the server.");
        }
    });
}

});
