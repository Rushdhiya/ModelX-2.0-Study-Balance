
document.addEventListener("DOMContentLoaded", function () {

    const historyTableBody = document.getElementById("historyTableBody");
    const emptyHistory = document.getElementById("emptyHistory");

    // Get saved entries from localStorage
    function getEntries() {
        return JSON.parse(
            localStorage.getItem("studyBalanceEntries") || "[]"
        );
    }

    // Display all history entries
    function displayHistory() {

        const entries = getEntries();

        // Sort entries from newest to oldest
        entries.sort((a, b) => new Date(b.date) - new Date(a.date));

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
                entry.date,
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
                    "daily-entry.html?date=" +
                    encodeURIComponent(entry.date);

            });

            // Delete button
            const deleteButton = document.createElement("button");

            deleteButton.textContent = "Delete";
            deleteButton.className = "delete-btn";

            deleteButton.addEventListener("click", function () {

                const confirmDelete = confirm(
                    "Are you sure you want to delete this daily entry?"
                );

                if (confirmDelete) {

                    const updatedEntries = getEntries().filter(
                        item => item.date !== entry.date
                    );

                    localStorage.setItem(
                        "studyBalanceEntries",
                        JSON.stringify(updatedEntries)
                    );

                    // Refresh history after deletion
                    displayHistory();

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

        // Correct HTML ID: totalStudyHours
        document.getElementById("totalStudyHours").textContent =
            totalStudy.toFixed(1) + " Hours";

        document.getElementById("averageSleep").textContent =
            averageSleep.toFixed(1) + " Hours";

    }

    // Load history when the page opens
    displayHistory();

    console.log("Study Balance History Loaded Successfully!");

});
