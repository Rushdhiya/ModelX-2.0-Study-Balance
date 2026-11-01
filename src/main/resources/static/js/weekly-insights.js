
// Study Balance - Weekly Insights

document.addEventListener("DOMContentLoaded", function () {

    const today = new Date();

    // Display current date
    document.getElementById("insightsDate").textContent =
        today.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });

    // Get saved daily entries
    const entries = JSON.parse(
        localStorage.getItem("studyBalanceEntries") || "[]"
    );

    // Prepare the last seven days, including today
    const weekDates = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        weekDates.push({
            key: `${year}-${month}-${day}`,
            label: date.toLocaleDateString("en-US", {
                weekday: "short"
            })
        });
    }

    // Find the entry for each date
    const weeklyEntries = weekDates.map(function (day) {
        return entries.find(entry => entry.date === day.key) || null;
    });

    // Convert missing records to zero for chart display
    const studyData = weeklyEntries.map(entry =>
        entry ? Number(entry.studyHours) || 0 : 0
    );

    const sleepData = weeklyEntries.map(entry =>
        entry ? Number(entry.sleepHours) || 0 : 0
    );

    const activityData = weeklyEntries.map(entry =>
        entry ? Number(entry.activityMinutes) || 0 : 0
    );

    const screenData = weeklyEntries.map(entry =>
        entry ? Number(entry.screenHours) || 0 : 0
    );

    // Count only days with saved records for averages
    const recordedDays = weeklyEntries.filter(entry => entry !== null);
    const numberOfDays = recordedDays.length;

    const totalStudy = studyData.reduce((total, value) => total + value, 0);
    const totalSleep = sleepData.reduce((total, value) => total + value, 0);
    const totalActivity = activityData.reduce((total, value) => total + value, 0);
    const totalScreen = screenData.reduce((total, value) => total + value, 0);

    const averageSleep = numberOfDays
        ? (totalSleep / numberOfDays).toFixed(1)
        : "0";

    const averageScreen = numberOfDays
        ? (totalScreen / numberOfDays).toFixed(1)
        : "0";

    // Display weekly summary
    document.getElementById("weeklyStudy").textContent =
        totalStudy.toFixed(1) + " hrs";

    document.getElementById("weeklySleep").textContent =
        averageSleep + " hrs";

    document.getElementById("weeklyActivity").textContent =
        totalActivity + " min";

    document.getElementById("weeklyScreen").textContent =
        averageScreen + " hrs";

    // Show a message if there are no entries
    const insightsMessage = document.getElementById("insightsMessage");

    if (numberOfDays === 0) {
        insightsMessage.hidden = false;
        insightsMessage.textContent =
            "No records found for the last seven days. Add daily entries to see your weekly insights.";
    } else {
        insightsMessage.hidden = true;
    }

    // Check whether Chart.js is available
    if (typeof Chart === "undefined") {
        insightsMessage.hidden = false;
        insightsMessage.textContent =
            "Charts could not be loaded. Please check your internet connection and refresh the page.";
        return;
    }

    const labels = weekDates.map(day => day.label);

    // Shared chart options
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    };

    // Study Hours Chart
    new Chart(document.getElementById("studyChart"), {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Study Hours",
                data: studyData,
                backgroundColor: "#238653",
                borderRadius: 6
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Hours"
                    }
                }
            }
        }
    });

    // Sleep Hours Chart
    new Chart(document.getElementById("sleepChart"), {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Sleep Hours",
                data: sleepData,
                borderColor: "#5687c8",
                backgroundColor: "rgba(86, 135, 200, 0.15)",
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Hours"
                    }
                }
            }
        }
    });

    // Screen Time Chart
    new Chart(document.getElementById("screenChart"), {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Screen Time",
                data: screenData,
                backgroundColor: "#e5a44a",
                borderRadius: 6
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Hours"
                    }
                }
            }
        }
    });

    // Physical Activity Chart
    new Chart(document.getElementById("activityChart"), {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Physical Activity",
                data: activityData,
                borderColor: "#9b6ac8",
                backgroundColor: "rgba(155, 106, 200, 0.15)",
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Minutes"
                    }
                }
            }
        }
    });

    console.log("Weekly Insights Page Loaded Successfully!");

});
