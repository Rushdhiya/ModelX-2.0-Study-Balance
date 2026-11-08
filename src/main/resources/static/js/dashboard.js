
"use strict";

// Study Balance Dashboard

document.addEventListener("DOMContentLoaded", async function () {

    // --------------------------------
    // Display Today's Date
    // --------------------------------

    const today = new Date();

    const currentDateElement =
        document.getElementById("currentDate");

    if (currentDateElement) {
        currentDateElement.textContent =
            today.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            });
    }

    // --------------------------------
    // Get Today's Local Date
    // --------------------------------

    const localDate = new Date(
        today.getTime() - today.getTimezoneOffset() * 60000
    ).toISOString().split("T")[0];

    // --------------------------------
    // Helper Function
    // --------------------------------

    function setText(elementId, value) {
        const element = document.getElementById(elementId);

        if (element) {
            element.textContent = value;
        }
    }

    // --------------------------------
    // Load Daily Entries From MySQL
    // --------------------------------

    let entries = [];
    let loadSuccessful = false;

    try {
        const response = await fetch("/api/activities", {
            method: "GET",
            credentials: "same-origin",
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error(
                "Dashboard API failed: HTTP " + response.status
            );
        }

        const activities = await response.json();

        if (!Array.isArray(activities)) {
            throw new Error("Invalid dashboard data received.");
        }

        entries = activities.map(function (activity) {

            return {
                id: activity.id,
                date: activity.activityDate,
                studyHours: Number(activity.studyHours || 0),
                sleepHours: Number(activity.sleepHours || 0),
                activityMinutes: Number(activity.exerciseMinutes || 0),
                screenHours: Number(activity.screenTimeHours || 0),
                mood: [
                    "",
                    "Sad",
                    "Stressed",
                    "Normal",
                    "Happy",
                    "Very Happy"
                ][activity.wellbeingScore] || "Not specified"
            };

        });

        loadSuccessful = true;

    } catch (error) {
        console.error("Dashboard data load error:", error);
    }

    // --------------------------------
    // Sort Records Newest First
    // --------------------------------

    const sortedEntries = [...entries].sort(function (a, b) {

        const dateComparison =
            String(b.date || "").localeCompare(
                String(a.date || "")
            );

        if (dateComparison !== 0) {
            return dateComparison;
        }

        // Same date: latest saved record first
        return Number(b.id || 0) - Number(a.id || 0);
    });

    // --------------------------------
    // Find Today's Latest Entry
    // --------------------------------

    const todayEntry = sortedEntries.find(function (entry) {
        return entry.date === localDate;
    });

    // --------------------------------
    // Display Today's Overview
    // --------------------------------

    if (todayEntry) {

        setText(
            "dashboardStudy",
            todayEntry.studyHours + " Hours"
        );

        setText(
            "dashboardSleep",
            todayEntry.sleepHours + " Hours"
        );

        setText(
            "dashboardActivity",
            todayEntry.activityMinutes + " Min"
        );

        setText(
            "dashboardScreen",
            todayEntry.screenHours + " Hours"
        );

        // --------------------------------
        // Calculate Balance Score
        // --------------------------------

        let score = 0;

        // Study score: 6-8 hours
        if (
            todayEntry.studyHours >= 6 &&
            todayEntry.studyHours <= 8
        ) {
            score += 25;
        } else if (todayEntry.studyHours >= 4) {
            score += 15;
        }

        // Sleep score: 7-9 hours
        if (
            todayEntry.sleepHours >= 7 &&
            todayEntry.sleepHours <= 9
        ) {
            score += 25;
        } else if (todayEntry.sleepHours >= 6) {
            score += 15;
        }

        // Physical activity: 30+ minutes
        if (todayEntry.activityMinutes >= 30) {
            score += 25;
        } else if (todayEntry.activityMinutes >= 15) {
            score += 15;
        }

        // Screen time: 2 hours or less
        if (todayEntry.screenHours <= 2) {
            score += 25;
        } else if (todayEntry.screenHours <= 4) {
            score += 15;
        }

        // Display balance score
        setText("dashboardScore", score + "%");

    } else {

        // No entry for today, or API failed
        const message = loadSuccessful
            ? "No Entry"
            : "Load Failed";

        setText("dashboardStudy", message);
        setText("dashboardSleep", message);
        setText("dashboardActivity", message);
        setText("dashboardScreen", message);
        setText("dashboardScore", "--");
    }

    // --------------------------------
    // Display Recent Activity
    // --------------------------------

    const recentActivityBody =
        document.getElementById("recentActivityBody");

    const noRecentActivity =
        document.getElementById("noRecentActivity");

    // Latest 3 records
    const recentEntries = sortedEntries.slice(0, 3);

    if (recentActivityBody) {

        // Clear existing rows
        recentActivityBody.innerHTML = "";

        if (recentEntries.length === 0) {

            if (noRecentActivity) {
                noRecentActivity.hidden = false;
            }

        } else {

            if (noRecentActivity) {
                noRecentActivity.hidden = true;
            }

            recentEntries.forEach(function (entry) {

                const row = document.createElement("tr");

                const values = [
                    entry.date || "No date",
                    entry.studyHours + " Hours",
                    entry.sleepHours + " Hours",
                    entry.mood || "Not specified"
                ];

                values.forEach(function (value) {

                    const cell = document.createElement("td");

                    cell.textContent = value;

                    row.appendChild(cell);
                });

                recentActivityBody.appendChild(row);
            });
        }
    }

    console.log(
        "Study Balance Dashboard Loaded Successfully!",
        entries.length,
        "records"
    );

});
