
// Study Balance - Daily Entry
const API_URL = "/api/activities";

document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("dailyEntryForm");
    const dateInput = document.getElementById("recordDate");
    const dateDisplay = document.getElementById("entryDate");
    const message = document.getElementById("entryMessage");

    // Get today's date in YYYY-MM-DD format
    const today = new Date();

    const localDate = new Date(
        today.getTime() - today.getTimezoneOffset() * 60000
    ).toISOString().split("T")[0];

    // Display today's date
    dateDisplay.textContent = today.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });

    // Set the default date
    dateInput.value = localDate;

    // Prevent selecting a future date
    dateInput.max = localDate;

    // Get saved entries from localStorage
    function getEntries() {
        return JSON.parse(
            localStorage.getItem("studyBalanceEntries") || "[]"
        );
    }

    // Save entries to localStorage
    function saveEntries(entries) {
        localStorage.setItem(
            "studyBalanceEntries",
            JSON.stringify(entries)
        );
    }

    // Display messages
    function showMessage(text, type) {
        message.textContent = text;
        message.className = "entry-message " + type;
    }

    // Check whether the page was opened using Edit from My History
    const urlParams = new URLSearchParams(window.location.search);
    const editDate = urlParams.get("date");

    let editingDate = null;

    // Load existing record when editing
    if (editDate) {

        const entries = getEntries();

        const existingEntry = entries.find(
            entry => entry.date === editDate
        );

        if (existingEntry) {

            editingDate = existingEntry.date;

            // Fill the form with previously saved information
            dateInput.value = existingEntry.date;

            document.getElementById("studyHours").value =
                existingEntry.studyHours;

            document.getElementById("sleepHours").value =
                existingEntry.sleepHours;

            document.getElementById("activityMinutes").value =
                existingEntry.activityMinutes;

            document.getElementById("screenHours").value =
                existingEntry.screenHours;

            document.getElementById("mood").value =
                existingEntry.mood || "";

            document.getElementById("notes").value =
                existingEntry.notes || "";

            // Change the heading when editing
            const heading = document.querySelector(".entry-intro h2");

            if (heading) {
                heading.textContent = "Edit Your Daily Entry";
            }

            // Change the button text
            const saveButton = form.querySelector(
                ".entry-save-button"
            );

            if (saveButton) {
                saveButton.textContent = "Update Daily Entry";
            }

        } else {

            showMessage(
                "The selected daily entry could not be found.",
                "error"
            );

        }
    }

    // Save or update daily entry
    form.addEventListener("submit", async function (event) {

        event.preventDefault();

        const studyHours = Number(
            document.getElementById("studyHours").value
        );

        const sleepHours = Number(
            document.getElementById("sleepHours").value
        );

        const activityMinutes = Number(
            document.getElementById("activityMinutes").value
        );

        const screenHours = Number(
            document.getElementById("screenHours").value
        );

        // Check total hours
        if (studyHours + sleepHours + screenHours > 24) {

            showMessage(
                "Study time, sleep time and screen time cannot total more than 24 hours.",
                "error"
            );

            return;
        }

        // Create the entry object
        const entry = {
            date: dateInput.value,
            studyHours: studyHours,
            sleepHours: sleepHours,
            activityMinutes: activityMinutes,
            screenHours: screenHours,
            mood: document.getElementById("mood").value,
            notes: document.getElementById("notes").value
        };

        const apiEntry = {
    activityDate: entry.date,
    studyHours: entry.studyHours,
    sleepHours: entry.sleepHours,
    exerciseMinutes: entry.activityMinutes,
    screenTimeHours: entry.screenHours,
    wellbeingScore: {
        "Very Happy": 5,
        "Happy": 4,
        "Normal": 3,
        "Stressed": 2,
        "Sad": 1
    }[entry.mood]
};

try {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(apiEntry)
    });

    if (!response.ok) {
        throw new Error("Database save failed");
    }

    const savedData = await response.json();
    console.log("Saved to MySQL:", savedData);

} catch (error) {
    console.error("Backend save failed:", error);
    showMessage("Could not save to database.", "error");
    return;
}

        // Get previously saved entries
        let entries = getEntries();

        // Find the existing record
        const existingIndex = entries.findIndex(
            item => item.date === editingDate
        );

        if (editingDate && existingIndex !== -1) {

            // Update the existing record
            entries[existingIndex] = entry;

        } else {

            // Check whether another record already exists for this date
            const duplicateIndex = entries.findIndex(
                item => item.date === entry.date
            );

            if (duplicateIndex !== -1) {

                // Update that record instead of creating a duplicate
                entries[duplicateIndex] = entry;

            } else {

                // Add a new record
                entries.push(entry);

            }
        }

        // Save updated records
        saveEntries(entries);

        // Remember the saved date
        editingDate = entry.date;

        // Reset the form
        form.reset();

        // Restore the date after resetting
        dateInput.value = localDate;

        // Display success message after reset
        showMessage(
            "Your daily entry has been saved successfully!",
            "success"
        );

        console.log("Daily entry saved:", entry);

    });

    // Clear message when the user resets the form
    form.addEventListener("reset", function () {

        message.textContent = "";
        message.className = "entry-message";

    });

    console.log("Daily Entry Page Loaded Successfully!");

});
