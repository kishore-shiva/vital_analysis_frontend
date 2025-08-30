document.addEventListener("DOMContentLoaded", () => {
    fetchVitalsData();
});

function getQueryParams() {
      const params = {};
      const query = window.location.search.substring(1);
      const pairs = query.split("&");
      pairs.forEach(pair => {
        const [key, value] = pair.split("=");
        if (key) params[decodeURIComponent(key)] = decodeURIComponent(value || "");
      });
      return params;
    }

const queryParams = getQueryParams();

// Example usage
const clientId = queryParams.id;

function getClientById(clientId, data) {
  return data.clients.find(c => c.id === clientId);
}

async function fetchVitalsData() {
    try {
        const response = await fetch("vitals.json");
        const data = await response.json();

        const patientData = getClientById(clientId, data)

        renderDashboard(patientData);
    } catch (error) {
        console.error("Error fetching vitals data:", error);
        alert("Failed to load patient data. Please ensure 'vitals.json' is available.");
    }
}

function renderDashboard(patientData) {
    // Update Header Stats
    document.getElementById("healthScore").textContent = "98%"; // Placeholder, can be calculated
    document.getElementById("biomarkersCount").textContent = "24"; // Placeholder, can be calculated
    document.getElementById("alertsCount").textContent = "1"; // Placeholder, can be calculated

    // Update Patient Information
    document.getElementById("patientName").textContent = patientData.name;
    document.getElementById("patientAge").textContent = `${patientData.age} years`;
    document.getElementById("patientSex").textContent = patientData.sex;
    document.getElementById("patientHeight").textContent = `${patientData.height_cm} cm`;
    document.getElementById("patientWeight").textContent = `${patientData.weight_kg} kg`;
    document.getElementById("patientBMI").textContent = patientData.bmi.toFixed(1);

    // Render Charts
    renderBodyCompositionChart(patientData);
    renderCbcChart(patientData);
    renderLipidChart(patientData);
    renderMetabolicChart(patientData);

    // Render Key Metrics
    renderKeyMetrics(patientData);

    // Add animation on load
    const elements = document.querySelectorAll(".animate-in");
    elements.forEach((element, index) => {
        element.style.opacity = "0";
        element.style.transform = "translateY(20px)";
        setTimeout(() => {
            element.style.transition = "opacity 0.6s ease, transform 0.6s ease";
            element.style.opacity = "1";
            element.style.transform = "translateY(0)";
        }, index * 150);
    });
}

const colors = {
    primary: "#dc2626",
    secondary: "#ef4444",
    accent: "#111827",
    success: "#10b981",
    warning: "#f59e0b",
    info: "#3b82f6",
    light: "#f9fafb",
    gray: "#6b7280",
    darkRed: "#991b1b",
    lightRed: "#fee2e2"
};

function getStatusBadge(value, normalRange, type = "range", patientSex = "Male") {
    let status = "status-normal";
    let text = "Normal";

    if (type === "bmi") {
        if (value < 18.5) { status = "status-warning"; text = "Underweight"; }
        else if (value >= 25 && value < 30) { status = "status-warning"; text = "Overweight"; }
        else if (value >= 30) { status = "status-danger"; text = "Obese"; }
        else { status = "status-normal"; text = "Healthy"; }
    } else if (type === "fat_percent") {
        if (patientSex === "Male") {
            if (value < 6) { status = "status-warning"; text = "Low"; }
            else if (value >= 6 && value <= 24) { status = "status-normal"; text = "Optimal"; }
            else { status = "status-warning"; text = "High"; }
        } else { // Female
            if (value < 14) { status = "status-warning"; text = "Low"; }
            else if (value >= 14 && value <= 31) { status = "status-normal"; text = "Optimal"; }
            else { status = "status-warning"; text = "High"; }
        }
    } else if (type === "ldl") {
        if (value < 100) { status = "status-normal"; text = "Optimal"; }
        else if (value >= 100 && value < 130) { status = "status-warning"; text = "Near Optimal"; }
        else if (value >= 130) { status = "status-danger"; text = "High"; }
    } else if (type === "hdl") {
        if (value >= 60) { status = "status-normal"; text = "Optimal"; }
        else if (value >= 40 && value < 60) { status = "status-warning"; text = "Acceptable"; }
        else { status = "status-danger"; text = "Low"; }
    } else if (type === "hs_crp") {
        if (value < 1.0) { status = "status-normal"; text = "Low Risk"; }
        else if (value >= 1.0 && value < 3.0) { status = "status-warning"; text = "Average Risk"; }
        else { status = "status-danger"; text = "High Risk"; }
    } else if (type === "testosterone") {
        if (value >= 300 && value <= 1000) { status = "status-normal"; text = "Optimal"; }
        else { status = "status-warning"; text = "Suboptimal"; }
    } else if (type === "glucose") {
        if (value >= 70 && value <= 99) { status = "status-normal"; text = "Normal"; }
        else if (value >= 100 && value <= 125) { status = "status-warning"; text = "Prediabetes"; }
        else { status = "status-danger"; text = "High"; }
    } else if (type === "egfr") {
        if (value >= 90) { status = "status-excellent"; text = "Excellent"; }
        else if (value >= 60 && value < 90) { status = "status-normal"; text = "Normal"; }
        else { status = "status-danger"; text = "Low"; }
    } else if (type === "alt") {
        if (value >= 7 && value <= 55) { status = "status-normal"; text = "Normal"; }
        else { status = "status-warning"; text = "Abnormal"; }
    } else if (type === "vitamin_d") {
        if (value >= 30 && value <= 100) { status = "status-normal"; text = "Sufficient"; }
        else if (value < 30) { status = "status-warning"; text = "Deficient"; }
        else { status = "status-warning"; text = "Excessive"; }
    }

    return `<span class="status-badge ${status}">${text}</span>`;
}

function renderBodyCompositionChart(patientData) {
    const bodyCompCtx = document.getElementById("bodyCompChart").getContext("2d");
    const fatPercent = patientData.body_comp.fat_percent;
    const leanMassPercent = (patientData.body_comp.lean_mass_kg / patientData.weight_kg * 100);
    const otherPercent = (100 - fatPercent - leanMassPercent);

    new Chart(bodyCompCtx, {
        type: "doughnut",
        data: {
            labels: ["Body Fat", "Lean Mass", "Other"],
            datasets: [{
                data: [fatPercent, leanMassPercent.toFixed(1), otherPercent.toFixed(1)],
                backgroundColor: [colors.primary, colors.accent, colors.gray],
                borderWidth: 0,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: { size: 11, weight: "500" }
                    }
                },
                tooltip: {
                    backgroundColor: "rgba(17, 24, 39, 0.9)",
                    titleColor: "#ffffff",
                    bodyColor: "#ffffff",
                    borderColor: colors.primary,
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            return context.label + ": " + context.parsed + "%";
                        }
                    }
                }
            }
        }
    });
    document.getElementById("bodyCompStatus").innerHTML = getStatusBadge(fatPercent, null, "fat_percent", patientData.sex);
}

function renderCbcChart(patientData) {
    const cbcCtx = document.getElementById("cbcChart").getContext("2d");
    new Chart(cbcCtx, {
        type: "radar",
        data: {
            labels: ["Hemoglobin", "Hematocrit", "RBC Count", "WBC Count", "Platelets"],
            datasets: [{
                label: "Patient Values",
                data: [
                    (patientData.bloodwork.cbc.hemoglobin / 17) * 100,
                    (patientData.bloodwork.cbc.hematocrit / 50) * 100,
                    (patientData.bloodwork.cbc.rbc / 6) * 100,
                    (patientData.bloodwork.cbc.wbc / 11) * 100,
                    (patientData.bloodwork.cbc.platelets / 400) * 100
                ],
                backgroundColor: "rgba(220, 38, 38, 0.1)",
                borderColor: colors.primary,
                borderWidth: 2,
                pointBackgroundColor: colors.primary,
                pointBorderColor: "#ffffff",
                pointBorderWidth: 2,
                pointRadius: 4
            }, {
                label: "Normal Range",
                data: [85, 85, 85, 85, 85],
                backgroundColor: "rgba(16, 185, 129, 0.05)",
                borderColor: colors.success,
                borderWidth: 1,
                borderDash: [5, 5],
                pointBackgroundColor: colors.success,
                pointBorderColor: "#ffffff",
                pointRadius: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 20,
                        font: { size: 10 }
                    },
                    grid: {
                        color: "#e5e7eb"
                    }
                }
            },
            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        font: { size: 11, weight: "500" }
                    }
                }
            }
        }
    });
    document.getElementById("cbcStatus").innerHTML = getStatusBadge(patientData.bloodwork.cbc.hemoglobin, null, "normal"); // Simplified for now
}

function renderLipidChart(patientData) {
    const lipidCtx = document.getElementById("lipidChart").getContext("2d");
    const ldlStatus = getStatusBadge(patientData.bloodwork.lipids.ldl_c, null, "ldl");

    new Chart(lipidCtx, {
        type: "bar",
        data: {
            labels: ["Total Cholesterol", "LDL-C", "HDL-C", "Triglycerides"],
            datasets: [{
                label: "Patient Values",
                data: [
                    patientData.bloodwork.lipids.total_chol,
                    patientData.bloodwork.lipids.ldl_c,
                    patientData.bloodwork.lipids.hdl_c,
                    patientData.bloodwork.lipids.triglycerides
                ],
                backgroundColor: [colors.primary, colors.warning, colors.success, colors.info],
                borderRadius: 4,
                borderSkipped: false,
            }, {
                label: "Target Values",
                data: [200, 100, 60, 150],
                backgroundColor: "rgba(107, 114, 128, 0.2)",
                borderColor: colors.gray,
                borderWidth: 1,
                borderRadius: 4,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        font: { size: 11, weight: "500" }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "mg/dL",
                        font: { size: 11, weight: "500" }
                    },
                    grid: {
                        color: "#f3f4f6"
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
    document.getElementById("lipidStatus").innerHTML = ldlStatus;
}

function renderMetabolicChart(patientData) {
    const metabolicCtx = document.getElementById("metabolicChart").getContext("2d");
    const glucoseStatus = getStatusBadge(patientData.bloodwork.metabolic.glucose_fasting, null, "glucose");

    new Chart(metabolicCtx, {
        type: "line",
        data: {
            labels: ["Fasting Glucose", "HbA1c (%)", "Insulin (μU/mL)"],
            datasets: [{
                label: "Patient Values",
                data: [
                    patientData.bloodwork.metabolic.glucose_fasting,
                    patientData.bloodwork.metabolic.hba1c * 20, // Scale for visualization
                    patientData.bloodwork.metabolic.insulin * 10 // Scale for visualization
                ],
                backgroundColor: "rgba(220, 38, 38, 0.1)",
                borderColor: colors.primary,
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: colors.primary,
                pointBorderColor: "#ffffff",
                pointBorderWidth: 2,
                pointRadius: 6
            }, {
                label: "Normal Upper Limits",
                data: [99, 5.7 * 20, 15 * 10], // Normal upper limits scaled
                backgroundColor: "transparent",
                borderColor: colors.success,
                borderWidth: 2,
                borderDash: [8, 4],
                fill: false,
                pointBackgroundColor: colors.success,
                pointBorderColor: "#ffffff",
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        font: { size: 11, weight: "500" }
                    }
                },
                tooltip: {
                    backgroundColor: "rgba(17, 24, 39, 0.9)",
                    titleColor: "#ffffff",
                    bodyColor: "#ffffff",
                    borderColor: colors.primary,
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            let value = context.parsed.y;
                            let label = context.dataset.label + ": ";
                            
                            if (context.label === "HbA1c (%)") {
                                value = (value / 20).toFixed(1) + "%";
                            } else if (context.label === "Insulin (μU/mL)") {
                                value = (value / 10).toFixed(1) + " μU/mL";
                            } else {
                                value = value + " mg/dL";
                            }
                            
                            return label + value;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Scaled Values",
                        font: { size: 11, weight: "500" }
                    },
                    grid: {
                        color: "#f3f4f6"
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
    document.getElementById("metabolicStatus").innerHTML = glucoseStatus;
}

function renderKeyMetrics(patientData) {
    const metricsGrid = document.getElementById("metricsGrid");
    metricsGrid.innerHTML = ""; // Clear existing content

    const metrics = [
        {
            title: "Kidney Function (eGFR)",
            value: `${patientData.bloodwork.cmp.egfr} mL/min`,
            range: "Normal: >90 mL/min/1.73m²",
            status: getStatusBadge(patientData.bloodwork.cmp.egfr, null, "egfr"),
            progress: (patientData.bloodwork.cmp.egfr / 120) * 100,
            progressClass: "progress-normal"
        },
        {
            title: "Liver Function (ALT)",
            value: `${patientData.bloodwork.cmp.alt} U/L`,
            range: "Normal: 7-55 U/L",
            status: getStatusBadge(patientData.bloodwork.cmp.alt, null, "alt"),
            progress: (patientData.bloodwork.cmp.alt / 55) * 100,
            progressClass: "progress-normal"
        },
        {
            title: "Inflammation (hs-CRP)",
            value: `${patientData.bloodwork.inflammation.hs_crp} mg/L`,
            range: "Low Risk: <1.0 mg/L",
            status: getStatusBadge(patientData.bloodwork.inflammation.hs_crp, null, "hs_crp"),
            progress: (patientData.bloodwork.inflammation.hs_crp / 3) * 100,
            progressClass: "progress-normal"
        },
        {
            title: "Vitamin D Status",
            value: `${patientData.bloodwork.iron_vitamins.vitamin_d} ng/mL`,
            range: "Sufficient: 30-100 ng/mL",
            status: getStatusBadge(patientData.bloodwork.iron_vitamins.vitamin_d, null, "vitamin_d"),
            progress: (patientData.bloodwork.iron_vitamins.vitamin_d / 100) * 100,
            progressClass: "progress-normal"
        },
        {
            title: "Testosterone Level",
            value: `${patientData.hormones.testosterone_total} ng/dL`,
            range: "Normal: 300-1000 ng/dL",
            status: getStatusBadge(patientData.hormones.testosterone_total, null, "testosterone"),
            progress: (patientData.hormones.testosterone_total / 1000) * 100,
            progressClass: "progress-normal"
        },
        {
            title: "Blood Glucose",
            value: `${patientData.bloodwork.metabolic.glucose_fasting} mg/dL`,
            range: "Normal: 70-99 mg/dL",
            status: getStatusBadge(patientData.bloodwork.metabolic.glucose_fasting, null, "glucose"),
            progress: (patientData.bloodwork.metabolic.glucose_fasting / 125) * 100,
            progressClass: "progress-normal"
        }
    ];

    metrics.forEach(metric => {
        const metricCard = document.createElement("div");
        metricCard.className = "metric-card animate-in";
        metricCard.innerHTML = `
            <div class="metric-header">
                <span class="metric-title">${metric.title}</span>
                ${metric.status}
            </div>
            <div class="metric-value">${metric.value}</div>
            <div class="metric-range">${metric.range}</div>
            <div class="progress-container">
                <div class="progress-bar ${metric.progressClass}" style="width: ${metric.progress}%;"></div>
            </div>
        `;
        metricsGrid.appendChild(metricCard);
    });
}


