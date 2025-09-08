// Global variables
let wellLogChart = null;
let riskTimelineChart = null;
let trajectoryChart = null;
let scene, camera, renderer;
let currentWellData = [];
let riskData = [];

// Navigation handling
document.addEventListener('DOMContentLoaded', function() {
    initializeApplication();
    setupNavigation();
    initializeCharts();
    loadDemoData();
});

function initializeApplication() {
    console.log('AI PetroTech Platform Initialized');
    
    // Setup table schemas for demo data
    setupTableSchemas();
    
    // Initialize 3D scene
    init3DScene();
    
    // Start real-time simulations
    startRealTimeUpdates();
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            showSection(targetId);
            
            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        targetSection.classList.add('slide-in');
        
        // Initialize section-specific content
        switch(sectionId) {
            case 'well-logs':
                updateWellLogChart();
                break;
            case 'drilling-risk':
                updateRiskCharts();
                break;
            case 'geo-steering':
                update3DScene();
                updateTrajectoryChart();
                break;
        }
    }
}

// Table Schema Setup
async function setupTableSchemas() {
    try {
        // Well Logs Schema
        await fetch('/api/schema/well_logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'well_logs',
                fields: [
                    { name: 'id', type: 'text', description: 'Unique identifier' },
                    { name: 'depth', type: 'number', description: 'Depth in feet' },
                    { name: 'gamma_ray', type: 'number', description: 'Gamma ray reading (API units)' },
                    { name: 'resistivity', type: 'number', description: 'Resistivity (Ω·m)' },
                    { name: 'porosity', type: 'number', description: 'Porosity percentage' },
                    { name: 'formation', type: 'text', description: 'AI-identified formation' },
                    { name: 'confidence', type: 'number', description: 'AI confidence score' }
                ]
            })
        });

        // Risk Assessments Schema
        await fetch('/api/schema/risk_assessments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'risk_assessments',
                fields: [
                    { name: 'id', type: 'text', description: 'Unique identifier' },
                    { name: 'timestamp', type: 'datetime', description: 'Assessment time' },
                    { name: 'overall_risk', type: 'text', description: 'Overall risk level' },
                    { name: 'equipment_risk', type: 'number', description: 'Equipment failure risk %' },
                    { name: 'wellbore_risk', type: 'number', description: 'Wellbore instability risk %' },
                    { name: 'circulation_risk', type: 'number', description: 'Lost circulation risk %' },
                    { name: 'blowout_risk', type: 'number', description: 'Kick/blowout risk %' }
                ]
            })
        });

        // Geo-steering Data Schema
        await fetch('/api/schema/geosteering_data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'geosteering_data',
                fields: [
                    { name: 'id', type: 'text', description: 'Unique identifier' },
                    { name: 'depth', type: 'number', description: 'Current depth' },
                    { name: 'azimuth', type: 'number', description: 'Azimuth angle' },
                    { name: 'inclination', type: 'number', description: 'Inclination angle' },
                    { name: 'target_distance', type: 'number', description: 'Distance to target' },
                    { name: 'ai_recommendation', type: 'text', description: 'AI steering recommendation' }
                ]
            })
        });

        console.log('Table schemas created successfully');
    } catch (error) {
        console.log('Using demo data - schemas may already exist');
    }
}

// Demo Data Loading
function loadDemoData() {
    generateWellLogData();
    generateRiskData();
    generateGeoSteeringData();
    updateDashboardMetrics();
}

function generateWellLogData() {
    currentWellData = [];
    const formations = [
        { name: 'Sandstone', depthStart: 2150, depthEnd: 2340, gamma: [30, 60], resistivity: [5, 15], porosity: [15, 25] },
        { name: 'Shale', depthStart: 2340, depthEnd: 2480, gamma: [100, 150], resistivity: [1, 3], porosity: [5, 12] },
        { name: 'Limestone', depthStart: 2480, depthEnd: 2650, gamma: [20, 40], resistivity: [50, 200], porosity: [8, 18] }
    ];

    formations.forEach(formation => {
        for (let depth = formation.depthStart; depth < formation.depthEnd; depth += 10) {
            const gamma = Math.random() * (formation.gamma[1] - formation.gamma[0]) + formation.gamma[0];
            const resistivity = Math.random() * (formation.resistivity[1] - formation.resistivity[0]) + formation.resistivity[0];
            const porosity = Math.random() * (formation.porosity[1] - formation.porosity[0]) + formation.porosity[0];
            const confidence = 0.85 + Math.random() * 0.12;

            currentWellData.push({
                depth: depth,
                gamma_ray: Math.round(gamma * 10) / 10,
                resistivity: Math.round(resistivity * 100) / 100,
                porosity: Math.round(porosity * 10) / 10,
                formation: formation.name,
                confidence: Math.round(confidence * 100)
            });
        }
    });

    updateWellLogTable();
}

function generateRiskData() {
    riskData = [];
    const now = new Date();
    
    for (let i = 0; i < 24; i++) {
        const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
        riskData.unshift({
            timestamp: timestamp,
            overall_risk: Math.random() < 0.8 ? 'LOW' : Math.random() < 0.9 ? 'MEDIUM' : 'HIGH',
            equipment_risk: Math.random() * 25 + 5,
            wellbore_risk: Math.random() * 40 + 20,
            circulation_risk: Math.random() * 30 + 10,
            blowout_risk: Math.random() * 15 + 2
        });
    }
}

function generateGeoSteeringData() {
    // Generate trajectory points
    const trajectoryPoints = [];
    let currentDepth = 2000;
    let currentAzimuth = 45;
    let currentInclination = 0;

    for (let i = 0; i < 50; i++) {
        currentDepth += 20 + Math.random() * 10;
        currentAzimuth += (Math.random() - 0.5) * 5;
        currentInclination += (Math.random() - 0.5) * 2;
        
        trajectoryPoints.push({
            depth: currentDepth,
            azimuth: currentAzimuth,
            inclination: Math.max(0, Math.min(30, currentInclination)),
            target_distance: Math.max(0, 2000 - i * 40 + Math.random() * 100),
            ai_recommendation: generateSteeringRecommendation()
        });
    }

    // Update navigation metrics
    const latest = trajectoryPoints[trajectoryPoints.length - 1];
    document.getElementById('currentDepth').textContent = `${Math.round(latest.depth)} ft`;
    document.getElementById('targetDistance').textContent = `${Math.round(latest.target_distance)} ft`;
    document.getElementById('azimuth').textContent = `${Math.round(latest.azimuth)}°`;
    document.getElementById('inclination').textContent = `${latest.inclination.toFixed(1)}°`;
}

function generateSteeringRecommendation() {
    const recommendations = [
        'Maintain current trajectory',
        'Adjust azimuth by +3°',
        'Increase inclination by 2°',
        'Reduce drilling speed',
        'Monitor formation changes'
    ];
    return recommendations[Math.floor(Math.random() * recommendations.length)];
}

// Chart Initialization and Updates
function initializeCharts() {
    initializeWellLogChart();
    initializeRiskGauge();
    initializeRiskTimelineChart();
    initializeTrajectoryChart();
}

function initializeWellLogChart() {
    const ctx = document.getElementById('wellLogChart');
    if (!ctx) return;

    wellLogChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Gamma Ray (API)',
                    data: [],
                    borderColor: '#f6ad55',
                    backgroundColor: 'rgba(246, 173, 85, 0.1)',
                    yAxisID: 'y'
                },
                {
                    label: 'Resistivity (Ω·m)',
                    data: [],
                    borderColor: '#2d5aa0',
                    backgroundColor: 'rgba(45, 90, 160, 0.1)',
                    yAxisID: 'y1'
                },
                {
                    label: 'Porosity (%)',
                    data: [],
                    borderColor: '#38a169',
                    backgroundColor: 'rgba(56, 161, 105, 0.1)',
                    yAxisID: 'y2'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Well Log Analysis - Multi-Parameter View'
                },
                legend: {
                    position: 'top'
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Depth (ft)'
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Gamma Ray (API)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Resistivity (Ω·m)'
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                },
                y2: {
                    type: 'linear',
                    display: false,
                    position: 'right'
                }
            }
        }
    });
}

function updateWellLogChart() {
    if (!wellLogChart || currentWellData.length === 0) return;

    const depths = currentWellData.map(d => d.depth);
    const gammaRay = currentWellData.map(d => d.gamma_ray);
    const resistivity = currentWellData.map(d => d.resistivity);
    const porosity = currentWellData.map(d => d.porosity);

    wellLogChart.data.labels = depths;
    wellLogChart.data.datasets[0].data = gammaRay;
    wellLogChart.data.datasets[1].data = resistivity;
    wellLogChart.data.datasets[2].data = porosity;
    wellLogChart.update();
}

function updateWellLogTable() {
    const tbody = document.getElementById('wellLogsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    
    // Show sample of data (every 5th point for readability)
    const sampleData = currentWellData.filter((_, index) => index % 5 === 0);
    
    sampleData.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.depth}</td>
            <td>${row.gamma_ray}</td>
            <td>${row.resistivity}</td>
            <td>${row.porosity}%</td>
            <td><span class="formation-tag">${row.formation}</span></td>
            <td>${row.confidence}%</td>
        `;
        tbody.appendChild(tr);
    });
}

function initializeRiskGauge() {
    const canvas = document.getElementById('riskGauge');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height - 20;
    const radius = 80;

    // Draw gauge background
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, 0);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 20;
    ctx.stroke();

    // Draw risk level (low = green)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, Math.PI + Math.PI * 0.3);
    ctx.strokeStyle = '#38a169';
    ctx.lineWidth = 20;
    ctx.stroke();

    // Draw needle
    const angle = Math.PI + Math.PI * 0.15; // Low risk position
    const needleLength = radius - 10;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
        centerX + Math.cos(angle) * needleLength,
        centerY + Math.sin(angle) * needleLength
    );
    ctx.strokeStyle = '#1a365d';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#1a365d';
    ctx.fill();
}

function initializeRiskTimelineChart() {
    const ctx = document.getElementById('riskTimelineChart');
    if (!ctx) return;

    riskTimelineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Equipment Risk',
                    data: [],
                    borderColor: '#e53e3e',
                    backgroundColor: 'rgba(229, 62, 62, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Wellbore Risk',
                    data: [],
                    borderColor: '#ed8936',
                    backgroundColor: 'rgba(237, 137, 54, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Circulation Risk',
                    data: [],
                    borderColor: '#f6ad55',
                    backgroundColor: 'rgba(246, 173, 85, 0.1)',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: '24-Hour Risk Trend Analysis'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Risk Level (%)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    }
                }
            }
        }
    });
}

function updateRiskCharts() {
    if (!riskTimelineChart || riskData.length === 0) return;

    const labels = riskData.map(d => d.timestamp.toLocaleTimeString());
    const equipmentRisk = riskData.map(d => d.equipment_risk);
    const wellboreRisk = riskData.map(d => d.wellbore_risk);
    const circulationRisk = riskData.map(d => d.circulation_risk);

    riskTimelineChart.data.labels = labels;
    riskTimelineChart.data.datasets[0].data = equipmentRisk;
    riskTimelineChart.data.datasets[1].data = wellboreRisk;
    riskTimelineChart.data.datasets[2].data = circulationRisk;
    riskTimelineChart.update();
}

function initializeTrajectoryChart() {
    const ctx = document.getElementById('trajectoryChart');
    if (!ctx) return;

    trajectoryChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Planned Trajectory',
                    data: [],
                    borderColor: '#2d5aa0',
                    backgroundColor: 'rgba(45, 90, 160, 0.6)',
                    showLine: true,
                    tension: 0.4
                },
                {
                    label: 'Actual Trajectory',
                    data: [],
                    borderColor: '#38a169',
                    backgroundColor: 'rgba(56, 161, 105, 0.6)',
                    showLine: true,
                    tension: 0.4
                },
                {
                    label: 'Target Zone',
                    data: [
                        { x: 1000, y: 3000 },
                        { x: 1200, y: 3200 },
                        { x: 1400, y: 3100 },
                        { x: 1600, y: 3300 }
                    ],
                    borderColor: '#f6ad55',
                    backgroundColor: 'rgba(246, 173, 85, 0.3)',
                    showLine: true,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Well Trajectory - Top View (North vs East)'
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'East (ft)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'North (ft)'
                    }
                }
            }
        }
    });
}

function updateTrajectoryChart() {
    if (!trajectoryChart) return;

    // Generate sample trajectory data
    const plannedData = [];
    const actualData = [];
    
    for (let i = 0; i < 20; i++) {
        const east = i * 80 + Math.random() * 20;
        const north = 2800 + i * 15 + Math.random() * 30;
        plannedData.push({ x: east, y: north });
        
        const actualEast = east + (Math.random() - 0.5) * 40;
        const actualNorth = north + (Math.random() - 0.5) * 40;
        actualData.push({ x: actualEast, y: actualNorth });
    }

    trajectoryChart.data.datasets[0].data = plannedData;
    trajectoryChart.data.datasets[1].data = actualData;
    trajectoryChart.update();
}

// 3D Scene Setup
function init3DScene() {
    const container = document.getElementById('threejs-container');
    if (!container) return;

    // Create a placeholder for 3D visualization
    container.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #718096;">
            <i class="fas fa-cube" style="font-size: 4rem; margin-bottom: 1rem; color: #f6ad55;"></i>
            <h3 style="margin-bottom: 0.5rem;">3D Reservoir Visualization</h3>
            <p style="text-align: center; max-width: 300px;">Interactive 3D model showing reservoir layers, well trajectory, and target zones with real-time drilling progress.</p>
            <div style="margin-top: 1rem; padding: 0.5rem 1rem; background: rgba(246, 173, 85, 0.2); border-radius: 6px;">
                <small>Full 3D rendering available in production version</small>
            </div>
        </div>
    `;
}

function update3DScene() {
    // Placeholder for 3D scene updates
    console.log('3D scene updated with latest drilling data');
}

// AI Analysis Functions
function runWellLogAnalysis() {
    const button = event.target;
    const originalText = button.innerHTML;
    
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
    button.disabled = true;

    // Simulate AI processing
    setTimeout(() => {
        // Update formation analysis with new confidence scores
        const formations = document.querySelectorAll('.formation-item');
        formations.forEach(formation => {
            const confidenceBar = formation.querySelector('.confidence-fill');
            const confidenceText = formation.querySelector('.confidence-bar span');
            const newConfidence = 85 + Math.random() * 12;
            
            confidenceBar.style.width = `${newConfidence}%`;
            confidenceText.textContent = `${Math.round(newConfidence)}% confidence`;
        });

        // Add analysis complete notification
        showNotification('AI Well Log Analysis Complete', 'success');
        
        button.innerHTML = originalText;
        button.disabled = false;
    }, 2000);
}

function runRiskAnalysis() {
    const button = event.target;
    const originalText = button.innerHTML;
    
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
    button.disabled = true;

    setTimeout(() => {
        // Update risk factors with new values
        generateRiskData();
        updateRiskCharts();
        
        // Update risk gauge
        initializeRiskGauge();
        
        showNotification('Risk Analysis Updated', 'success');
        
        button.innerHTML = originalText;
        button.disabled = false;
    }, 1500);
}

function optimizeRoute() {
    const button = event.target;
    const originalText = button.innerHTML;
    
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Optimizing...';
    button.disabled = true;

    setTimeout(() => {
        // Update navigation metrics
        generateGeoSteeringData();
        updateTrajectoryChart();
        
        // Update recommendations
        const recommendations = document.querySelectorAll('.recommendation span');
        const newRecommendations = [
            'Optimal trajectory calculated - maintain current direction',
            'Target zone alignment: 97.2% accuracy',
            'Estimated time to target: 18.5 hours'
        ];
        
        recommendations.forEach((rec, index) => {
            if (newRecommendations[index]) {
                rec.textContent = newRecommendations[index];
            }
        });

        showNotification('Route Optimization Complete', 'success');
        
        button.innerHTML = originalText;
        button.disabled = false;
    }, 1800);
}

// 3D Control Functions
function resetView() {
    console.log('3D view reset to default position');
    showNotification('View Reset', 'info');
}

function toggleWireframe() {
    console.log('Wireframe mode toggled');
    showNotification('Wireframe Mode Toggled', 'info');
}

function showTargetZone() {
    console.log('Target zone highlighted');
    showNotification('Target Zone Highlighted', 'info');
}

// Real-time Updates
function startRealTimeUpdates() {
    // Update metrics every 30 seconds
    setInterval(updateDashboardMetrics, 30000);
    
    // Update well log data every 2 minutes
    setInterval(() => {
        if (document.getElementById('well-logs').classList.contains('active')) {
            generateWellLogData();
            updateWellLogChart();
        }
    }, 120000);
    
    // Update risk data every minute
    setInterval(() => {
        if (document.getElementById('drilling-risk').classList.contains('active')) {
            generateRiskData();
            updateRiskCharts();
        }
    }, 60000);
}

function updateDashboardMetrics() {
    // Simulate real-time metric updates
    const metrics = [
        { selector: '.metric-card:nth-child(1) .metric-value', value: Math.floor(120 + Math.random() * 20) },
        { selector: '.metric-card:nth-child(3) .metric-value', value: (95 + Math.random() * 4).toFixed(1) + '%' },
        { selector: '.metric-card:nth-child(4) .metric-value', value: Math.floor(1200 + Math.random() * 100) }
    ];

    metrics.forEach(metric => {
        const element = document.querySelector(metric.selector);
        if (element) {
            element.textContent = metric.value;
        }
    });
}

// Utility Functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}-circle"></i>
        <span>${message}</span>
    `;
    
    // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#38a169' : type === 'error' ? '#e53e3e' : '#2d5aa0'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 1001;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        animation: slideInRight 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add notification animations to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .formation-tag {
        background: linear-gradient(135deg, #f6ad55 0%, #ed8936 100%);
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.8rem;
        font-weight: 500;
    }
`;
document.head.appendChild(style);

// Export functions for global access
window.showSection = showSection;
window.runWellLogAnalysis = runWellLogAnalysis;
window.runRiskAnalysis = runRiskAnalysis;
window.optimizeRoute = optimizeRoute;
window.resetView = resetView;
window.toggleWireframe = toggleWireframe;
window.showTargetZone = showTargetZone;
