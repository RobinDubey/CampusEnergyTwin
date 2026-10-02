
let energyChartInstance = null;
let carbonChartInstance = null;

async function loadDashboard() {
    try {
        const response = await fetch("/api/dashboard");

        if (!response.ok) {
            throw new Error("Failed to load campus data");
        }

        const data = await response.json();

        // Update summary cards
        const labels = [...document.querySelectorAll("body *")];

        function updateCard(label, value) {
            const heading = labels.find(el =>
                el.children.length === 0 &&
                el.textContent.trim().toLowerCase() ===
                    label.toLowerCase()
            );

            if (!heading) return;

            let parent = heading.parentElement;

            for (let i = 0; i < 5 && parent; i++) {
                const placeholder = [...parent.querySelectorAll("*")]
                    .find(el =>
                        el.children.length === 0 &&
                        el.textContent.trim() === "--"
                    );

                if (placeholder) {
                    placeholder.textContent = value;
                    return;
                }

                parent = parent.parentElement;
            }
        }

        updateCard(
            "Total Energy Consumption",
            `${data.total_energy_kwh ?? 0} kWh`
        );

        updateCard(
            "Estimated Carbon Emissions",
            `${data.estimated_emissions_kg ?? 0} kg CO₂e`
        );

        updateCard(
            "Anomaly Alerts",
            data.anomaly_count ?? (data.anomalies || []).length
        );

        // Update schedule table
        const scheduleBody = document.getElementById("scheduleBody");

        if (scheduleBody) {
            scheduleBody.innerHTML = "";

            (data.schedule || []).forEach(item => {
                const row = document.createElement("tr");

                [
                    item.task,
                    item.hour,
                    item.energy_kwh,
                    item.carbon_intensity,
                    item.estimated_emissions_kg
                ].forEach(value => {
                    const cell = document.createElement("td");
                    cell.textContent = value ?? "-";
                    row.appendChild(cell);
                });

                scheduleBody.appendChild(row);
            });
        }

        // Update anomaly alerts
        const anomalyContainer =
            document.getElementById("anomalyList") ||
            document.getElementById("anomalies");

        if (anomalyContainer) {
            anomalyContainer.innerHTML = "";

            (data.anomalies || []).forEach(item => {
                const alert = document.createElement("p");
                alert.textContent =
                    `${item.building}: ${item.message}`;
                anomalyContainer.appendChild(alert);
            });
        }

        // Update building cards
        const buildingContainer =
            document.getElementById("buildingTwin");

        if (buildingContainer) {
            buildingContainer.innerHTML = "";

            Object.entries(data.building_totals || {})
                .forEach(([name, energy]) => {
                    const card = document.createElement("div");
                    card.className = "building-card";

                    const title = document.createElement("h4");
                    title.textContent = name;

                    const value = document.createElement("p");
                    value.textContent = `${energy} kWh`;

                    card.append(title, value);
                    buildingContainer.appendChild(card);
                });
        }

        // Draw both charts
        if (typeof Chart === "undefined") {
            throw new Error(
                "Chart.js not loaded. Check your internet connection."
            );
        }

        const energyCanvas =
            document.getElementById("energyChart");

        if (energyCanvas) {
            if (energyChartInstance) {
                energyChartInstance.destroy();
            }

            const buildings = data.building_totals || {};

            energyChartInstance = new Chart(energyCanvas, {
                type: "bar",
                data: {
                    labels: Object.keys(buildings),
                    datasets: [{
                        label: "Energy Consumption (kWh)",
                        data: Object.values(buildings),
                        backgroundColor: [
                            "#4361ee",
                            "#2a9d8f",
                            "#f4a261",
                            "#7b61a8"
                        ],
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: "Energy (kWh)"
                            }
                        }
                    }
                }
            });
        }

        const carbonCanvas =
            document.getElementById("carbonChart");

        if (carbonCanvas) {
            if (carbonChartInstance) {
                carbonChartInstance.destroy();
            }

            const carbonValues = data.carbon_intensity || [];

            carbonChartInstance = new Chart(carbonCanvas, {
                type: "line",
                data: {
                    labels: carbonValues.map(
                        (_, index) => `${index}:00`
                    ),
                    datasets: [{
                        label: "Carbon Intensity",
                        data: carbonValues,
                        borderColor: "#e76f51",
                        backgroundColor: "rgba(231,111,81,0.15)",
                        fill: true,
                        tension: 0.3,
                        pointRadius: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: "Carbon Intensity"
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: "Hour"
                            }
                        }
                    }
                }
            });
        }

        const status = document.getElementById("dataStatus");

        if (status) {
            status.textContent = "Campus data loaded";
        }

        console.log("Campus dashboard data loaded", data);

    } catch (error) {
        console.error("Dashboard loading error:", error);

        const status = document.getElementById("dataStatus");

        if (status) {
            status.textContent = "Unable to load campus data";
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadDashboard();

    const refreshButton = [...document.querySelectorAll("button")]
        .find(button => /refresh data/i.test(button.textContent));

    if (refreshButton) {
        refreshButton.addEventListener("click", loadDashboard);
    }
});
/* ===== ADVANCED CAMPUS DASHBOARD FEATURES ===== */

document.addEventListener("DOMContentLoaded", () => {
    const buildingFilter = document.getElementById("buildingFilter");
    const scheduleSearch = document.getElementById("scheduleSearch");
    const exportCsvBtn = document.getElementById("exportCsvBtn");
    const featureStatus = document.getElementById("featureStatus");

    function setStatus(message) {
        if (featureStatus) {
            featureStatus.textContent = message;
        }
    }

    // 2. BUILDING FILTER
    function updateBuildingOptions() {
        if (!buildingFilter) return;

        const selected = buildingFilter.value;
        const cards = document.querySelectorAll(
            "#buildingTwin .building-card"
        );

        buildingFilter.replaceChildren();

        const allOption = document.createElement("option");
        allOption.value = "all";
        allOption.textContent = "All Buildings";
        buildingFilter.appendChild(allOption);

        const names = [...cards]
            .map(card => card.querySelector("h4")?.textContent.trim())
            .filter(Boolean)
            .sort();

        names.forEach(name => {
            const option = document.createElement("option");
            option.value = name.toLowerCase();
            option.textContent = name;
            buildingFilter.appendChild(option);
        });

        const exists = [...buildingFilter.options].some(
            option => option.value === selected
        );

        buildingFilter.value = exists ? selected : "all";
        applyBuildingFilter();
    }

    function applyBuildingFilter() {
        if (!buildingFilter) return;

        const selected = buildingFilter.value;

        document.querySelectorAll(
            "#buildingTwin .building-card"
        ).forEach(card => {
            const name = card.querySelector("h4")
                ?.textContent.trim().toLowerCase();

            card.hidden = selected !== "all" && name !== selected;
        });
    }

    if (buildingFilter) {
        buildingFilter.addEventListener(
            "change",
            applyBuildingFilter
        );
    }

    // 3. SCHEDULE SEARCH
    function applyScheduleFilter() {
        const query = scheduleSearch?.value.trim().toLowerCase() || "";
        const rows = document.querySelectorAll("#scheduleBody tr");

        rows.forEach(row => {
            row.hidden = !row.textContent.toLowerCase().includes(query);
        });
    }

    if (scheduleSearch) {
        scheduleSearch.addEventListener(
            "input",
            applyScheduleFilter
        );
    }

    // 4. VISUAL ANOMALY ALERTS
    function enhanceAlerts() {
        const alertContainer = document.getElementById("anomalyList");
        if (!alertContainer) return;

        alertContainer.querySelectorAll("p").forEach(alert => {
            alert.classList.add("anomaly-alert");

            if (!alert.querySelector(".alert-badge")) {
                const badge = document.createElement("strong");
                badge.className = "alert-badge";
                badge.textContent = "⚠ WARNING";
                alert.prepend(badge);
            }
        });
    }

    // Existing app.js fills these containers asynchronously.
    const buildingContainer = document.getElementById("buildingTwin");
    const scheduleBody = document.getElementById("scheduleBody");
    const alertContainer = document.getElementById("anomalyList");

    if (buildingContainer) {
        new MutationObserver(updateBuildingOptions).observe(
            buildingContainer,
            { childList: true, subtree: true }
        );
        updateBuildingOptions();
    }

    if (scheduleBody) {
        new MutationObserver(applyScheduleFilter).observe(
            scheduleBody,
            { childList: true }
        );
        applyScheduleFilter();
    }

    if (alertContainer) {
        new MutationObserver(enhanceAlerts).observe(
            alertContainer,
            { childList: true }
        );
        enhanceAlerts();
    }

    // CSV escaping protects commas, quotes and line breaks.
    function csvCell(value) {
        const text = String(value ?? "");
        return '"' + text.replace(/"/g, '""') + '"';
    }

    // 5. EXPORT DASHBOARD REPORT
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener("click", async () => {
            exportCsvBtn.disabled = true;
            setStatus("Preparing your report...");

            try {
                const response = await fetch("/api/dashboard");

                if (!response.ok) {
                    throw new Error("Could not fetch dashboard data.");
                }

                const data = await response.json();
                const rows = [
                    ["Section", "Name", "Energy (kWh)",
                     "Scheduled Time", "Carbon Intensity",
                     "Emissions (kg CO2e)", "Details"]
                ];

                Object.entries(data.building_totals || {}).forEach(
                    ([name, energy]) => {
                        rows.push([
                            "Building", name, energy, "", "", "", ""
                        ]);
                    }
                );

                (data.schedule || []).forEach(item => {
                    rows.push([
                        "Schedule",
                        item.task,
                        item.energy_kwh,
                        item.hour,
                        item.carbon_intensity,
                        item.estimated_emissions_kg,
                        ""
                    ]);
                });

                (data.anomalies || []).forEach(item => {
                    rows.push([
                        "Anomaly",
                        item.building,
                        item.usage ?? "",
                        item.hour ?? "",
                        "",
                        "",
                        item.message
                    ]);
                });

                rows.push([
                    "Summary", "Total Energy",
                    data.total_energy_kwh ?? data.total_energy ?? "",
                    "", "", "", ""
                ]);

                rows.push([
                    "Summary", "Estimated Emissions",
                    "", "", "",
                    data.estimated_emissions_kg ?? "", ""
                ]);

                const csv = "\uFEFF" + rows
                    .map(row => row.map(csvCell).join(","))
                    .join("\r\n");

                const blob = new Blob([csv], {
                    type: "text/csv;charset=utf-8;"
                });

                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");

                link.href = url;
                link.download = "campus-energy-report.csv";
                document.body.appendChild(link);
                link.click();
                link.remove();

                URL.revokeObjectURL(url);

                setStatus("CSV report downloaded successfully.");
            } catch (error) {
                console.error("CSV export error:", error);
                setStatus("Export failed. Please try again.");
            } finally {
                exportCsvBtn.disabled = false;
            }
        });
    }

    setStatus("Advanced dashboard features ready.");
});