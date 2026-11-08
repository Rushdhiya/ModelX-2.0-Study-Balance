
"use strict";

document.addEventListener("DOMContentLoaded", function () {

    const historyTableBody = document.getElementById("historyTableBody");
    const emptyHistory = document.getElementById("emptyHistory");

    if (!historyTableBody || !emptyHistory) {
        console.error("History HTML elements missing.");
        return;
    }

    // Success message displayed above the history table
    const successMessage = document.createElement("div");
    successMessage.id = "historySuccessMessage";
    successMessage.setAttribute("role", "status");
    successMessage.setAttribute("aria-live", "polite");
    successMessage.hidden = true;

    successMessage.style.cssText = `
        padding: 12px 16px;
        margin: 15px 0;
        background-color: #e8f5e9;
        color: #176b32;
        border: 1px solid #a5d6a7;
        border-radius: 8px;
        font-weight: 600;
    `;

    const historyTable = historyTableBody.closest("table");

    if (historyTable) {
        historyTable.parentNode.insertBefore(
            successMessage,
            historyTable
        );
    } else {
        historyTableBody.parentNode.insertBefore(
            successMessage,
            historyTableBody
        );
    }

    function showSuccessMessage(text) {
        successMessage.textContent = text;
        successMessage.hidden = false;
    }

    // Load history records from MySQL
    async function getEntries() {
        const response = await fetch("/api/activities", {
            credentials: "same-origin"
        });

        if (!response.ok) {
            throw new Error("Failed to load history");
        }

        const activities = await response.json();

        return activities.map(activity => ({
            id: activity.id,
            date: activity.activityDate,
            studyHours: activity.studyHours,
            sleepHours: activity.sleepHours,
            activityMinutes: activity.exerciseMinutes,
            screenHours: activity.screenTimeHours,
            mood: [
                "",
                "Sad",
                "Stressed",
                "Normal",
                "Happy",
                "Very Happy"
            ][activity.wellbeingScore] || "Not specified",
            notes: ""
        }));
    }

    // Display all history entries
    async function displayHistory() {

        let entries;

        try {
            entries = await getEntries();
        } catch (error) {
            console.error("History load error:", error);
            alert("Could not load history from database.");
            return false;
        }

        // Sort entries from newest to oldest
        entries.sort((a, b) => {
            return new Date(b.date || 0) -
                   new Date(a.date || 0);
        });

        // Clear existing table rows
        historyTableBody.innerHTML = "";

        // Update summary information
        updateSummary(entries);

        // Show empty message if there are no entries
        if (entries.length === 0) {
            emptyHistory.hidden = false;
            return true;
        }

        emptyHistory.hidden = true;

        // Create a row for each entry
        entries.forEach(function (entry) {

            const row = document.createElement("tr");

            const values = [
                entry.date || "No date",
                entry.studyHours + " Hours",
                entry.sleepHours + " Hours",
                entry.activityMinutes + " Min",
                entry.screenHours + " Hours",
                entry.mood || "Not specified",
                entry.notes || "No notes"
            ];

            values.forEach(function (value) {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });

            // Actions cell
            const actionsCell = document.createElement("td");
            actionsCell.className = "history-actions";

            // Edit button
            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.textContent = "Edit";
            editButton.className = "edit-btn";

            editButton.addEventListener("click", function () {
                window.location.href =
                    "daily-entry.html?id=" +
                    encodeURIComponent(entry.id);
            });

            // Delete button
            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.textContent = "Delete";
            deleteButton.className = "delete-btn";

            deleteButton.addEventListener("click", async function () {

                const confirmDelete = confirm(
                    "Are you sure you want to delete this daily entry?"
                );

                if (!confirmDelete) {
                    return;
                }

               deleteButton.disabled = true;

try {
    const csrfResponse = await fetch("/api/csrf", {
    method: "GET",
    credentials: "same-origin"
});

if (!csrfResponse.ok) {
    throw new Error("Unable to get CSRF token.");
}

const csrf = await csrfResponse.json();

const response = await fetch(
    "/api/activities/" + encodeURIComponent(entry.id),
    {
        method: "DELETE",
        credentials: "same-origin",
        headers: {
            [csrf.headerName]: csrf.token
        }
    }
);

                    if (!response.ok) {
                        throw new Error(
                            "Delete failed: HTTP " + response.status
                        );
                    }

                    // Refresh history after deletion
                    const refreshed = await displayHistory();

                    if (refreshed) {
                        showSuccessMessage(
                            "Entry deleted successfully!"
                        );
                    } else {
                        alert(
                            "Entry deleted, but history could not be refreshed."
                        );
                    }

                } catch (error) {
                    console.error("Delete error:", error);
                    alert("Could not delete entry from database.");
                    deleteButton.disabled = false;
                }
            });

            actionsCell.appendChild(editButton);
            actionsCell.appendChild(deleteButton);

            row.appendChild(actionsCell);
            historyTableBody.appendChild(row);
        });

        return true;
    }

    // Update summary cards
    function updateSummary(entries) {

        const totalRecords = entries.length;

        const totalStudy = entries.reduce(
            (sum, entry) =>
                sum + Number(entry.studyHours || 0), 0
        );

        const averageSleep = totalRecords > 0
            ? entries.reduce(
                (sum, entry) =>
                    sum + Number(entry.sleepHours || 0), 0
            ) / totalRecords
            : 0;

        const totalRecordsElement =
            document.getElementById("totalRecords");

        const totalStudyElement =
            document.getElementById("totalStudyHours");

        const averageSleepElement =
            document.getElementById("averageSleep");

        if (totalRecordsElement) {
            totalRecordsElement.textContent = totalRecords;
        }

        if (totalStudyElement) {
            totalStudyElement.textContent =
                totalStudy.toFixed(1) + " Hours";
        }

        if (averageSleepElement) {
            averageSleepElement.textContent =
                averageSleep.toFixed(1) + " Hours";
        }
    }

    // Load history when the page opens
    displayHistory();

    console.log(
        "Study Balance History Loaded Successfully!"
    );
});
