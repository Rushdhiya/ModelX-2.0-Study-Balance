
"use strict";

document.addEventListener("DOMContentLoaded", async () => {
    const API_URL = "/api/activities";

    const form = document.getElementById("dailyEntryForm");
    const dateInput = document.getElementById("recordDate");
    const dateDisplay = document.getElementById("entryDate");
    const message = document.getElementById("entryMessage");

    if (!form || !dateInput || !message) {
        console.error("Daily Entry HTML elements missing.");
        return;
    }

    const getField = (id) => document.getElementById(id);

    const params = new URLSearchParams(window.location.search);
    const editId = params.get("id");
    const isEditMode = Boolean(editId);

    const submitButton = form.querySelector(
        'button[type="submit"], input[type="submit"]'
    );

    function setButtonText(text) {
        if (!submitButton) return;

        if (submitButton.tagName === "INPUT") {
            submitButton.value = text;
        } else {
            submitButton.textContent = text;
        }
    }

    setButtonText(isEditMode ? "Update Entry" : "Save Entry");

    // Prevent Enter key from automatically submitting the form
    form.addEventListener("keydown", (event) => {
        if (
            event.key === "Enter" &&
            event.target.tagName !== "TEXTAREA"
        ) {
            event.preventDefault();
        }
    });

    const today = new Date();
    const localDate = new Date(
        today.getTime() - today.getTimezoneOffset() * 60000
    ).toISOString().split("T")[0];

    dateInput.value = localDate;
    dateInput.max = localDate;

    if (dateDisplay) {
        dateDisplay.textContent = today.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    }

    function showMessage(text, type) {
        message.textContent = text;
        message.className = "entry-message " + type;
    }

    function setField(id, value) {
        const field = getField(id);
        if (field) field.value = value ?? "";
    }

    function readNumber(id) {
        const field = getField(id);

        if (!field || field.value.trim() === "") {
            return NaN;
        }

        return Number(field.value);
    }

    const moodToScore = {
        "Sad": 1,
        "Stressed": 2,
        "Normal": 3,
        "Happy": 4,
        "Very Happy": 5
    };

    const scoreToMood = {
        1: "Sad",
        2: "Stressed",
        3: "Normal",
        4: "Happy",
        5: "Very Happy"
    };

    // LOAD EXISTING ENTRY
    if (isEditMode) {
        try {
            const response = await fetch(API_URL, {
                credentials: "same-origin"
            });

            if (!response.ok) {
                throw new Error("HTTP " + response.status);
            }

            const activities = await response.json();

            const activity = activities.find(
                item => String(item.id) === String(editId)
            );

            if (!activity) {
                showMessage("Entry not found.", "error");

                if (submitButton) {
                    submitButton.disabled = true;
                }

                return;
            }

            dateInput.value = activity.activityDate;

            setField("studyHours", activity.studyHours);
            setField("sleepHours", activity.sleepHours);
            setField("activityMinutes", activity.exerciseMinutes);
            setField("screenHours", activity.screenTimeHours);

            setField(
                "mood",
                scoreToMood[activity.wellbeingScore] || ""
            );

            setField("notes", activity.notes || "");

            const heading = document.querySelector(
                ".entry-intro h2"
            );

            if (heading) {
                heading.textContent = "Edit Your Daily Entry";
            }

            setButtonText("Update Entry");

        } catch (error) {
            console.error("Entry load failed:", error);

            showMessage(
                "Could not load entry: " + error.message,
                "error"
            );

            if (submitButton) {
                submitButton.disabled = true;
            }

            return;
        }
    }

    // SAVE OR UPDATE
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const studyHours = readNumber("studyHours");
        const sleepHours = readNumber("sleepHours");
        const activityMinutes = readNumber("activityMinutes");
        const screenHours = readNumber("screenHours");

        const values = [
            studyHours,
            sleepHours,
            activityMinutes,
            screenHours
        ];

        if (
            values.some(value =>
                !Number.isFinite(value) || value < 0
            )
        ) {
            showMessage(
                "Please fill all activity fields with valid numbers.",
                "error"
            );
            return;
        }

        if (
            studyHours > 24 ||
            sleepHours > 24 ||
            screenHours > 24 ||
            activityMinutes > 1440
        ) {
            showMessage(
                "Activity durations exceed valid limits.",
                "error"
            );
            return;
        }

        if (studyHours + sleepHours + screenHours > 24) {
            showMessage(
                "Study, sleep and screen time cannot exceed 24 hours.",
                "error"
            );
            return;
        }

        if (!dateInput.value || dateInput.value > localDate) {
            showMessage(
                "Please select a valid date.",
                "error"
            );
            return;
        }

        const moodField = getField("mood");
        const mood = moodField ? moodField.value : "";
        const wellbeingScore = moodToScore[mood];

        if (!wellbeingScore) {
            showMessage(
                "Please select your mood.",
                "error"
            );
            return;
        }

        const apiEntry = {
            activityDate: dateInput.value,
            studyHours: studyHours,
            sleepHours: sleepHours,
            exerciseMinutes: activityMinutes,
            screenTimeHours: screenHours,
            wellbeingScore: wellbeingScore
        };

        if (submitButton) {
            submitButton.disabled = true;
        }

        showMessage(
            isEditMode ? "Updating..." : "Saving...",
            "info"
        );

        try {
            const url = isEditMode
                ? API_URL + "/" + encodeURIComponent(editId)
                : API_URL;

           const csrfResponse = await fetch("/api/csrf", {
    method: "GET",
    credentials: "same-origin"
});

if (!csrfResponse.ok) {
    throw new Error("Unable to get CSRF token.");
}

const csrf = await csrfResponse.json();

const response = await fetch(url, {
    method: isEditMode ? "PUT" : "POST",
    credentials: "same-origin",
    headers: {
        "Content-Type": "application/json",
        [csrf.headerName]: csrf.token
    },
    body: JSON.stringify(apiEntry),
    redirect: "manual"
});
            if (response.type === "opaqueredirect") {
                throw new Error(
                    "Login session expired. Please log in again."
                );
            }

            if (!response.ok) {
                const errorBody = await response.text();

                console.error(
                    "Backend error:",
                    response.status,
                    errorBody
                );

                throw new Error("HTTP " + response.status);
            }

            if (!isEditMode) {
                form.reset();
                dateInput.value = localDate;
            }

            showMessage(
                isEditMode
                    ? "Daily entry updated successfully!"
                    : "Daily entry saved successfully!",
                "success"
            );

            console.log(
                isEditMode
                    ? "Entry updated successfully."
                    : "Entry saved successfully."
            );

        } catch (error) {
            console.error("Save error:", error);

            showMessage(
                "Could not save to database: " + error.message,
                "error"
            );

        } finally {
            if (submitButton) {
                submitButton.disabled = false;
            }

            setButtonText(
                isEditMode ? "Update Entry" : "Save Entry"
            );
        }
    });

    form.addEventListener("reset", () => {
        message.textContent = "";
        message.className = "entry-message";
    });

    console.log("Daily Entry JavaScript loaded successfully!");
});
