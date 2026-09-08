/**
 * SkyGuard AI — Sensor Health & Transducer Lifecycle Controller
 * Tracks component degradation curves, noise floor shifts, and predictive failure windows
 * across mesonet instrumentation with multi-city tab routing.
 */

class SensorHealthController {
  constructor() {
    this.activeStation = 'AWS-JPR-04';

    this.cityData = {
      'AWS-JPR-04': {
        stationName: 'Jaipur (AWS-JPR-04)',
        subtitle: 'Continuous acoustic, resistive, and capacitive drift analysis for Jaipur Semi-Arid Grid.',
        timelineTitle: 'Temperature Sensor 90-Day Degradation Timeline (AWS-JPR-04)',
        timelineDesc: 'Demonstrating gradual degradation from baseline stability to the critical spike event.',
        metrics: [
          {
            sensor: 'Temperature (PT100 RTD)',
            score: 24,
            status: 'Critical Transducer Failure',
            badge: 'badge-critical',
            color: 'var(--status-critical, #C94F4F)',
            rows: [
              { label: 'Drift Velocity', value: '+30.0°C (Runaway)' },
              { label: 'Noise Floor', value: 'Unstable (9.8σ)' },
              { label: 'Data Continuity', value: 'Quarantined for Audit' },
              { label: 'Field Status', value: 'P1 Replacement Dispatched' }
            ]
          },
          {
            sensor: 'Humidity (Capacitive Polymer)',
            score: 91,
            status: 'Nominal State',
            badge: 'badge-trusted',
            color: 'var(--status-trusted, #2E9B73)',
            rows: [
              { label: 'Drift Velocity', value: '+0.1% / mo' },
              { label: 'Noise Floor', value: 'Nominal (0.4σ)' },
              { label: 'Data Continuity', value: '99.8%' },
              { label: 'Calibration Window', value: 'Q4 Scheduled' }
            ]
          },
          {
            sensor: 'Pressure (Piezoresistive Baro)',
            score: 95,
            status: 'Nominal State',
            badge: 'badge-trusted',
            color: 'var(--status-trusted, #2E9B73)',
            rows: [
              { label: 'Drift Velocity', value: '0.01 hPa / mo' },
              { label: 'Noise Floor', value: 'Low (0.3σ)' },
              { label: 'Data Continuity', value: '99.9%' },
              { label: 'Hysteresis', value: 'None Detected' }
            ]
          }
        ],
        timeline: [
          {
            day: '90 Days Ago',
            title: 'Stable Baseline',
            desc: 'Sensor operating at 99% health. Normal Gaussian noise floor.',
            color: 'var(--status-trusted, #2E9B73)',
            border: 'var(--border-light)',
            bg: 'var(--bg-app)'
          },
          {
            day: '30 Days Ago',
            title: 'Minor Noise Increase',
            desc: 'High-frequency jitter observed. Variance widened by +0.4°C.',
            color: 'var(--status-attention, #C98A1C)',
            border: 'var(--border-light)',
            bg: 'var(--bg-app)'
          },
          {
            day: '7 Days Ago',
            title: 'Repeated Micro-Spikes',
            desc: '3 brief transient impulse spikes logged during solar heating peak.',
            color: 'var(--status-attention, #C98A1C)',
            border: 'var(--border-light)',
            bg: 'var(--bg-app)'
          },
          {
            day: 'Today (14:32)',
            title: 'Critical Spike (55.2°C)',
            desc: 'Full circuit fault or thermistor short. P1 ticket dispatched.',
            color: 'var(--status-critical, #C94F4F)',
            border: 'var(--status-critical-border, #FED7D7)',
            bg: 'var(--status-critical-bg, #FFF5F5)'
          },
          {
            day: 'AI Forecast',
            title: 'Failure Window',
            desc: 'Immediate sensor replacement required. Transducer telemetry quarantined.',
            color: 'var(--status-critical, #C94F4F)',
            border: 'var(--status-critical, #C94F4F)',
            bg: 'var(--bg-app)'
          }
        ]
      },
      'AWS-DEL-07': {
        stationName: 'New Delhi (AWS-DEL-07)',
        subtitle: 'Continuous acoustic, resistive, and capacitive drift analysis for Delhi Urban Heat Corridor.',
        timelineTitle: 'Photovoltaic Battery & Bus Degradation Timeline (AWS-DEL-07)',
        timelineDesc: 'Demonstrating urban particulate accumulation causing auxiliary rail droop below 11.2V.',
        metrics: [
          {
            sensor: 'PV Auxiliary Voltage Bus',
            score: 68,
            status: 'Droop Detected',
            badge: 'badge-attention',
            color: 'var(--status-attention, #C98A1C)',
            rows: [
              { label: 'Bus Output', value: '10.8 V (Low Threshold)' },
              { label: 'Soot Density', value: 'High (Urban Dust Layer)' },
              { label: 'Charge Efficiency', value: '-14% / wk' },
              { label: 'Field Status', value: 'P2 - Battery Swap Scheduled' }
            ]
          },
          {
            sensor: 'Humidity (Capacitive Polymer)',
            score: 72,
            status: 'Calibration Drift (Voltage Induced)',
            badge: 'badge-attention',
            color: 'var(--status-attention, #C98A1C)',
            rows: [
              { label: 'Offset Error', value: '+18% Relative Drift' },
              { label: 'Noise Floor', value: 'Mild Drift (1.2σ)' },
              { label: 'Data Continuity', value: '98.2%' },
              { label: 'Calibration Window', value: 'Within 24 Hours' }
            ]
          },
          {
            sensor: 'Temperature (PT100 RTD)',
            score: 93,
            status: 'Nominal Core',
            badge: 'badge-trusted',
            color: 'var(--status-trusted, #2E9B73)',
            rows: [
              { label: 'Drift Velocity', value: '+0.05°C / mo' },
              { label: 'Noise Floor', value: 'Low (0.4σ)' },
              { label: 'Data Continuity', value: '99.7%' },
              { label: 'Spike Frequency', value: '0 in 30 days' }
            ]
          }
        ],
        timeline: [
          {
            day: '60 Days Ago',
            title: 'Clean Cell Surface',
            desc: 'PV array output sustained nominal 13.8V float charge capacity.',
            color: 'var(--status-trusted, #2E9B73)',
            border: 'var(--border-light)',
            bg: 'var(--bg-app)'
          },
          {
            day: '21 Days Ago',
            title: 'Particulate Dust Layer',
            desc: 'Airborne PM10 particulate deposition reduced solar charging rate by 8%.',
            color: 'var(--status-attention, #C98A1C)',
            border: 'var(--border-light)',
            bg: 'var(--bg-app)'
          },
          {
            day: '5 Days Ago',
            title: 'Voltage Droop Observed',
            desc: 'Auxiliary rail output dropped below 11.8V during peak telemetry bursts.',
            color: 'var(--status-attention, #C98A1C)',
            border: 'var(--border-light)',
            bg: 'var(--bg-app)'
          },
          {
            day: 'Today (12:15)',
            title: 'Envelope Breach (10.8V)',
            desc: 'Rail voltage under-run created relative humidity ADC reference offset.',
            color: 'var(--status-attention, #C98A1C)',
            border: 'var(--status-attention-border, #FEEBC8)',
            bg: 'var(--status-attention-bg, #FFFAF0)'
          },
          {
            day: 'AI Forecast',
            title: 'Cell Swap Window',
            desc: 'Field crew solar glass clean & battery replacement required within 24h.',
            color: 'var(--brand-teal, #2E9B73)',
            border: 'var(--brand-teal, #2E9B73)',
            bg: 'var(--bg-app)'
          }
        ]
      },
      'AWS-CHE-12': {
        stationName: 'Chennai (AWS-CHE-12)',
        subtitle: 'Continuous acoustic, resistive, and capacitive drift analysis for Chennai Coastal Marine Mesh.',
        timelineTitle: 'Marine Transducer Desiccant & Barometer Stability (AWS-CHE-12)',
        timelineDesc: 'Confirming hermetic maritime seal integrity and minimal salt-spray drift.',
        metrics: [
          {
            sensor: 'Pressure (Piezoresistive Baro)',
            score: 96,
            status: 'Marine High-Trust',
            badge: 'badge-trusted',
            color: 'var(--status-trusted, #2E9B73)',
            rows: [
              { label: 'Drift Velocity', value: '0.01 hPa / mo' },
              { label: 'Noise Floor', value: 'Ultra-Low (0.2σ)' },
              { label: 'Data Continuity', value: '100.0%' },
              { label: 'Seal Enclosure', value: 'Hermetic / IP68' }
            ]
          },
          {
            sensor: 'Temperature (PT100 RTD)',
            score: 95,
            status: 'Optimal State',
            badge: 'badge-trusted',
            color: 'var(--status-trusted, #2E9B73)',
            rows: [
              { label: 'Drift Velocity', value: '+0.02°C / mo' },
              { label: 'Noise Floor', value: 'Nominal (0.3σ)' },
              { label: 'Data Continuity', value: '99.9%' },
              { label: 'Spike Frequency', value: '0 in 90 days' }
            ]
          },
          {
            sensor: 'Humidity (Capacitive Polymer)',
            score: 92,
            status: 'Marine Protected',
            badge: 'badge-trusted',
            color: 'var(--status-trusted, #2E9B73)',
            rows: [
              { label: 'Drift Velocity', value: '+0.2% / mo' },
              { label: 'Salt Mist Filter', value: 'Active / Clean' },
              { label: 'Data Continuity', value: '99.8%' },
              { label: 'Calibration Window', value: 'Q4 Scheduled' }
            ]
          }
        ],
        timeline: [
          {
            day: '90 Days Ago',
            title: 'Initial Calibration',
            desc: 'Post-monsoon station overhaul verified 100% sensor accuracy.',
            color: 'var(--status-trusted, #2E9B73)',
            border: 'var(--border-light)',
            bg: 'var(--bg-app)'
          },
          {
            day: '60 Days Ago',
            title: 'Marine Boundary Fit',
            desc: 'Diurnal readings perfectly tracking Bay of Bengal tidal dynamics.',
            color: 'var(--status-trusted, #2E9B73)',
            border: 'var(--border-light)',
            bg: 'var(--bg-app)'
          },
          {
            day: '30 Days Ago',
            title: 'Desiccant Check',
            desc: 'Internal enclosure humidity maintained below 15% threshold.',
            color: 'var(--status-trusted, #2E9B73)',
            border: 'var(--border-light)',
            bg: 'var(--bg-app)'
          },
          {
            day: 'Today (11:45)',
            title: 'Optimal Operation',
            desc: 'All 3 transducers operating within peak statistical fidelity envelopes.',
            color: 'var(--status-trusted, #2E9B73)',
            border: 'var(--status-trusted-border, #DCFCE7)',
            bg: 'var(--status-trusted-bg, #F0FDF4)'
          },
          {
            day: 'AI Forecast',
            title: 'Routine Status',
            desc: 'No preventative intervention needed for the next 90 operational days.',
            color: 'var(--brand-teal, #2E9B73)',
            border: 'var(--brand-teal, #2E9B73)',
            bg: 'var(--bg-app)'
          }
        ]
      }
    };

    this.init();
  }

  init() {
    this.bindCityTabs();
    this.render(this.activeStation);
  }

  bindCityTabs() {
    document.addEventListener('click', (e) => {
      const cityBtn = e.target.closest('[data-health-station]');
      if (cityBtn) {
        const stId = cityBtn.dataset.healthStation;
        this.setStation(stId);
      }
    });
  }

  setStation(stationId) {
    if (!this.cityData[stationId]) return;
    this.activeStation = stationId;

    // Synchronize tab pill state
    document.querySelectorAll('[data-health-station]').forEach((btn) => {
      if (btn.dataset.healthStation === stationId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    this.render(stationId);
  }

  render(stationId) {
    const data = this.cityData[stationId];
    if (!data) return;

    // Update Header Text Elements
    const sub = document.getElementById('sensor-health-subtitle');
    if (sub) sub.textContent = data.subtitle;

    const tTitle = document.getElementById('health-timeline-title');
    if (tTitle) tTitle.textContent = data.timelineTitle;

    const tDesc = document.getElementById('health-timeline-desc');
    if (tDesc) tDesc.textContent = data.timelineDesc;

    // 1. Render 3 Sensor Health Cards
    const grid = document.getElementById('health-cards-grid');
    if (grid && data.metrics) {
      grid.innerHTML = data.metrics
        .map(
          (m) => `
        <div class="sensor-health-tile" style="background:#ffffff; border:1px solid var(--border-light); border-radius:8px; padding:16px; box-shadow:var(--shadow-sm);">
          <div class="sensor-tile-top" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <span class="sensor-tile-title" style="font-weight:700; font-size:0.85rem; color:var(--text-primary);">${m.sensor}</span>
            <span class="trust-badge ${m.badge}" style="padding:2px 7px; border-radius:4px; font-weight:700; font-size:0.72rem;">Health: ${m.score} / 100</span>
          </div>
          <div class="sensor-health-score-row" style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:8px;">
            <div class="health-large-score" style="font-size:1.8rem; font-weight:800; color:${m.color};">${m.score}%</div>
            <span style="font-size:0.75rem; font-weight:600; color:${m.color};">${m.status}</span>
          </div>
          <div class="health-bar-track" style="background:var(--border-light); height:6px; border-radius:3px; overflow:hidden; margin-bottom:14px;">
            <div class="health-bar-fill" style="width:${m.score}%; background:${m.color}; height:100%;"></div>
          </div>
          <div class="sensor-metrics-list" style="display:flex; flex-direction:column; gap:6px; font-size:0.76rem; color:var(--text-secondary);">
            ${m.rows
              .map(
                (r) => `
              <div style="display:flex; justify-content:space-between;">
                <span>${r.label}:</span>
                <strong style="color:var(--text-primary);">${r.value}</strong>
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

    // 2. Render Degradation Timeline Progression
    const timelineContainer = document.getElementById('health-timeline-nodes');
    if (timelineContainer && data.timeline) {
      timelineContainer.innerHTML = data.timeline
        .map(
          (node) => `
        <div class="timeline-node-card" style="border-color:${node.border}; background:${node.bg};">
          <span class="node-day-label" style="color:${node.color}; font-weight:700;">${node.day}</span>
          <span class="node-state-title" style="color:${node.color}; font-weight:700; margin:4px 0;">${node.title}</span>
          <p class="node-state-desc" style="margin:0; font-size:0.72rem; color:var(--text-secondary); line-height:1.35;">${node.desc}</p>
        </div>
      `
        )
        .join('');
    }
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
