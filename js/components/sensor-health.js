/**
 * SkyGuard AI — Sensor Health & Transducer Lifecycle Controller
 * Tracks component degradation curves, noise floor shifts, and predictive failure windows
 * across mesonet instrumentation.
 */

class SensorHealthController {
  constructor() {
    this.container = document.getElementById('view-sensor-health');
    this.init();
  }

  init() {
    this.renderStationHealth();
    this.bindTimelineInteractions();
  }

  renderStationHealth() {
    // Component health records
    const healthMetrics = [
      {
        sensor: 'Temperature (PT100 RTD)',
        score: 82,
        status: 'Degradation Detected',
        badge: 'badge-critical',
        color: 'var(--status-critical, #C94F4F)',
        metrics: [
          { label: 'Drift Velocity', value: '+0.4°C / mo' },
          { label: 'Noise Floor', value: 'Elevated (2.4σ)' },
          { label: 'Data Continuity', value: '99.4%' },
          { label: 'Spike Frequency', value: '4 in 7 days' }
        ]
      },
      {
        sensor: 'Humidity (Capacitive Polymer)',
        score: 74,
        status: 'Calibration Drift',
        badge: 'badge-attention',
        color: 'var(--status-attention, #C98A1C)',
        metrics: [
          { label: 'Drift Velocity', value: '+1.8% / mo' },
          { label: 'Noise Floor', value: 'Nominal' },
          { label: 'Data Continuity', value: '98.8%' },
          { label: 'Calibration Window', value: 'Within 7 days' }
        ]
      },
      {
        sensor: 'Pressure (Piezoresistive Baro)',
        score: 91,
        status: 'Nominal State',
        badge: 'badge-trusted',
        color: 'var(--status-trusted, #2E9B73)',
        metrics: [
          { label: 'Drift Velocity', value: '0.02 hPa / mo' },
          { label: 'Noise Floor', value: 'Low (0.3σ)' },
          { label: 'Data Continuity', value: '99.9%' },
          { label: 'Hysteresis', value: 'None Detected' }
        ]
      }
    ];

    const grid = document.querySelector('.sensor-health-overview-grid');
    if (!grid) return;

    grid.innerHTML = healthMetrics
      .map(
        (m) => `
      <div class="sensor-health-tile" style="background:#ffffff; border:1px solid var(--border-light, #e2e8f0); border-radius:8px; padding:16px;">
        <div class="sensor-tile-top" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <span class="sensor-tile-title" style="font-weight:700; font-size:0.85rem; color:var(--text-primary);">${m.sensor}</span>
          <span class="trust-badge ${m.badge}" style="padding:2px 7px; border-radius:4px; font-weight:700; font-size:0.72rem;">Health: ${m.score} / 100</span>
        </div>
        <div class="sensor-health-score-row" style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:8px;">
          <div class="health-large-score" style="font-size:1.8rem; font-weight:800; color:${m.color};">${m.score}%</div>
          <span style="font-size:0.75rem; color:var(--text-secondary);">${m.status}</span>
        </div>
        <div class="health-bar-track" style="background:var(--border-light, #e2e8f0); height:6px; border-radius:3px; overflow:hidden; margin-bottom:14px;">
          <div class="health-bar-fill" style="width:${m.score}%; background:${m.color}; height:100%;"></div>
        </div>
        <div class="sensor-metrics-list" style="display:flex; flex-direction:column; gap:6px; font-size:0.76rem; color:var(--text-secondary);">
          ${m.metrics
            .map(
              (row) => `
            <div style="display:flex; justify-content:space-between;">
              <span>${row.label}:</span>
              <strong style="color:var(--text-primary);">${row.value}</strong>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `
      )
      .join('');
  }

  bindTimelineInteractions() {
    const nodes = document.querySelectorAll('.timeline-node-card');
    nodes.forEach((node) => {
      node.addEventListener('mouseenter', () => {
        node.style.transform = 'translateY(-2px)';
        node.style.boxShadow = '0 4px 10px rgba(0,0,0,0.06)';
      });
      node.addEventListener('mouseleave', () => {
        node.style.transform = 'translateY(0)';
        node.style.boxShadow = 'none';
      });
    });
  }
}

// Global Singleton Setup
window.SensorHealthControllerInstance = null;

window.initSensorHealth = function () {
  if (!window.SensorHealthControllerInstance) {
    window.SensorHealthControllerInstance = new SensorHealthController();
  }
  return window.SensorHealthControllerInstance;
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.initSensorHealth());
} else {
  window.initSensorHealth();
}
