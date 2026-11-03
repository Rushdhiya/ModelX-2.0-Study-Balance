
document.addEventListener("DOMContentLoaded", function () {

    const historyTableBody = document.getElementById("historyTableBody");
    const emptyHistory = document.getElementById("emptyHistory");

    // Load history records from MySQL
    async function getEntries() {
        const response = await fetch("/api/activities");

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
            mood: ["", "Sad", "Stressed", "Normal", "Happy", "Very Happy"][
                activity.wellbeingScore
            ] || "Not specified",
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
            return;
        }

        // Sort entries from newest to oldest
        entries.sort((a, b) => {
            return new Date(b.date || 0) - new Date(a.date || 0);
        });

        // Clear existing table rows
        historyTableBody.innerHTML = "";

        // Update summary information
        updateSummary(entries);

        // Show empty message if there are no entries
        if (entries.length === 0) {
            emptyHistory.hidden = false;
            return;
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

            // Add normal data cells
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
            editButton.textContent = "Edit";
            editButton.className = "edit-btn";

            editButton.addEventListener("click", function () {
                window.location.href =
                    "daily-entry.html?id=" +
                    encodeURIComponent(entry.id);
            });

            // Delete button
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.className = "delete-btn";

            deleteButton.addEventListener("click", async function () {

                const confirmDelete = confirm(
                    "Are you sure you want to delete this daily entry?"
                );

                if (!confirmDelete) {
                    return;
                }

                try {
                    const response = await fetch(
                        "/api/activities/" + entry.id,
                        { method: "DELETE" }
                    );

                    if (!response.ok) {
                        throw new Error("Delete failed");
                    }

                    // Refresh history after deletion
                    await displayHistory();

                } catch (error) {
                    console.error("Delete error:", error);
                    alert("Could not delete entry from database.");
                }
            });

            // Add buttons to Actions cell
            actionsCell.appendChild(editButton);
            actionsCell.appendChild(deleteButton);

            row.appendChild(actionsCell);

            // Add row to table
            historyTableBody.appendChild(row);
        });
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

        document.getElementById("totalRecords").textContent =
            totalRecords;

        document.getElementById("totalStudyHours").textContent =
            totalStudy.toFixed(1) + " Hours";

        document.getElementById("averageSleep").textContent =
            averageSleep.toFixed(1) + " Hours";
    }

    // Load history when the page opens
    displayHistory();

    console.log("Study Balance History Loaded Successfully!");

});
