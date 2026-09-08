/**
 * SkyGuard AI — Incident Investigation Controller
 * Updates existing DOM elements dynamically when switching between
 * Jaipur, Delhi, and Chennai tabs.
 */

class InvestigateController {
  constructor() {
    this.activeStation = 'AWS-JPR-04';

    this.cityData = {
      'AWS-JPR-04': {
        name: 'AWS-JPR-04 (Jaipur Semi-Arid)',
        sensor: 'PT100 RTD Thermistor',
        incidentId: 'INC-4402',
        time: '14:32:18 IST',
        title: 'Temperature Surge to 55.2°C Detected at AWS-JPR-04',
        observed: '55.2°C',
        imputed: '25.4°C',
        imputedConf: 'Estimation Confidence: 91%',
        verdictTitle: 'PROBABLE SENSOR ANOMALY',
        confidence: '98.4%',
        severity: 'CRITICAL',
        rootCause: 'Sudden Sensor Spike (Thermistor / ADC Failure)',
        badgeClass: 'badge-critical',
        observedColor: 'var(--status-critical, #C94F4F)',
        stepNote: 'Step 4 of 6: Instantaneous +30.0°C jump registered in 15 seconds. Thermal inertia check failed.',
        replaySteps: [
          { time: '14:31:30', val: '25.1°C', tag: 'NOMINAL', type: 'normal' },
          { time: '14:31:45', val: '25.3°C', tag: 'NOMINAL', type: 'normal' },
          { time: '14:32:00', val: '25.2°C', tag: 'NOMINAL', type: 'normal' },
          { time: '14:32:15', val: '55.2°C', tag: 'SPIKE FLAGGED', type: 'spike' },
          { time: '14:32:16', val: 'AI Sweep', tag: 'EVALUATING', type: 'eval' },
          { time: '14:32:18', val: 'Classified', tag: 'CRITICAL ANOMALY', type: 'spike' }
        ],
        evidence: [
          { title: '01 • Historical Baseline Deviation', impact: 'High', desc: '55.2°C is significantly outside the expected historical diurnal range. Expected seasonal range for this hour: 22.0°C – 27.5°C (Z-Score: +9.8σ).' },
          { title: '02 • Temporal Deviation Rate', impact: 'High', desc: 'The temperature increased by approximately 30°C within 15 seconds. Thermal inertia of ambient air physically forbids this rate of change without explosive combustion.' },
          { title: '03 • Cross-Sensor Consistency', impact: 'High', desc: 'Relative humidity (44%) and atmospheric pressure (1008 hPa) do not support an extreme heat event. Clausius-Clapeyron saturation vapor pressure would require impossible dew points (>44°C).' },
          { title: '04 • Nearby Station Comparison', impact: 'Very High', desc: '4 nearby mesonet stations within 15km remain between 24.2°C and 25.8°C. An atmospheric heat event cannot be physically confined to a 10-meter footprint.' }
        ]
      },
      'AWS-DEL-07': {
        name: 'AWS-DEL-07 (New Delhi Central)',
        sensor: 'PV Auxiliary Bus & RH Transducer',
        incidentId: 'INC-4389',
        time: '12:15:04 IST',
        title: 'Photovoltaic Droop & Humidity Drift Detected at AWS-DEL-07',
        observed: '10.8V / 76%',
        imputed: '12.6V / 58%',
        imputedConf: 'Estimation Confidence: 88%',
        verdictTitle: 'POWER SUPPLY DEGRADATION',
        confidence: '88.1%',
        severity: 'ATTENTION',
        rootCause: 'Low Rail Voltage Leading to Transducer Measurement Bias',
        badgeClass: 'badge-attention',
        observedColor: 'var(--status-attention, #C98A1C)',
        stepNote: 'Step 4 of 6: Bus power dipped below 11.2V envelope threshold. Calibration drift detected.',
        replaySteps: [
          { time: '12:10:00', val: '12.4V', tag: 'NOMINAL', type: 'normal' },
          { time: '12:12:00', val: '11.8V', tag: 'DROOP', type: 'normal' },
          { time: '12:13:30', val: '11.2V', tag: 'ENVELOPE EDGE', type: 'normal' },
          { time: '12:15:00', val: '10.8V', tag: 'DRIFT DETECTED', type: 'spike' },
          { time: '12:15:02', val: 'Cross Check', tag: 'EVALUATING', type: 'eval' },
          { time: '12:15:04', val: 'Logged', tag: 'POWER WARNING', type: 'spike' }
        ],
        evidence: [
          { title: '01 • Bus Voltage Under-Run', impact: 'Medium', desc: 'Power dropped below 11.2V threshold, creating ADC reference shift.' },
          { title: '02 • Relative Humidity Disagreement', impact: 'High', desc: 'Reported 76% RH while neighboring stations reported 58%.' },
          { title: '03 • Historical Trend', impact: 'Medium', desc: 'Solar replenishing rate degraded 14% over the last 7 days.' }
        ]
      },
      'AWS-CHE-12': {
        name: 'AWS-CHE-12 (Chennai Coastal Mesh)',
        sensor: 'Barometric Piezoresistive Transducer',
        incidentId: 'LOG-4120',
        time: '11:45:22 IST',
        title: 'Nominal Coastal Marine Telemetry at AWS-CHE-12',
        observed: '31.8°C / 1011 hPa',
        imputed: '31.8°C / 1011 hPa',
        imputedConf: 'Estimation Confidence: 99%',
        verdictTitle: 'TELEMETRY TRUSTED (NOMINAL)',
        confidence: '99.2%',
        severity: 'NOMINAL',
        rootCause: 'All Sensors Operating Within Environmental Tolerances',
        badgeClass: 'badge-trusted',
        observedColor: 'var(--status-trusted, #2E9B73)',
        stepNote: 'Step 6 of 6: All maritime parameter streams verified healthy with adjacent coastal nodes.',
        replaySteps: [
          { time: '11:40:00', val: '31.6°C', tag: 'NOMINAL', type: 'normal' },
          { time: '11:42:00', val: '31.7°C', tag: 'NOMINAL', type: 'normal' },
          { time: '11:44:00', val: '31.8°C', tag: 'NOMINAL', type: 'normal' },
          { time: '11:45:00', val: '31.8°C', tag: 'STEADY', type: 'normal' },
          { time: '11:45:10', val: 'AI Verification', tag: 'VERIFYING', type: 'eval' },
          { time: '11:45:22', val: 'Passed', tag: 'TRUSTED STREAM', type: 'normal' }
        ],
        evidence: [
          { title: '01 • Marine Boundary Layer Diurnal Fit', impact: 'Positive', desc: 'Matches diurnal tidal curve expectations within 0.2°C.' },
          { title: '02 • Bay of Bengal Spatial Correlation', impact: 'Positive', desc: 'Confirmed by 3 offshore weather buoys with 99.4% covariance.' }
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
      const cityBtn = e.target.closest('[data-investigate-station]');
      if (cityBtn) {
        const stId = cityBtn.dataset.investigateStation;
        this.setStation(stId);
      }
    });
  }

  setStation(stationId) {
    if (!this.cityData[stationId]) return;
    this.activeStation = stationId;

    // Update Tab Selection Styling
    document.querySelectorAll('[data-investigate-station]').forEach((btn) => {
      if (btn.dataset.investigateStation === stationId) {
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

    // Subtitle & Header Elements
    const sub = document.getElementById('investigate-subtitle');
    if (sub) sub.textContent = `Transparent multi-factor evidence decomposition and event replay for ${stationId}.`;

    const badge = document.getElementById('inv-incident-badge');
    if (badge) {
      badge.className = `trust-badge ${data.badgeClass}`;
      badge.textContent = `INCIDENT #${data.incidentId}`;
    }

    const timeEl = document.getElementById('inv-occurred-time');
    if (timeEl) timeEl.textContent = data.time;

    const titleEl = document.getElementById('inv-incident-title');
    if (titleEl) titleEl.textContent = data.title;

    const stNameEl = document.getElementById('inv-station-name');
    if (stNameEl) stNameEl.textContent = data.name;

    const sensorEl = document.getElementById('inv-sensor-name');
    if (sensorEl) sensorEl.textContent = data.sensor;

    const obsEl = document.getElementById('inv-observed-val');
    if (obsEl) {
      obsEl.textContent = data.observed;
      obsEl.style.color = data.observedColor;
    }

    // Verdict Box
    const vTitle = document.getElementById('inv-verdict-title');
    if (vTitle) {
      vTitle.textContent = data.verdictTitle;
      vTitle.style.color = data.observedColor;
    }

    const vSub1 = document.getElementById('inv-verdict-sub1');
    if (vSub1) vSub1.innerHTML = `Confidence: <strong>${data.confidence}</strong> • Severity: <strong>${data.severity}</strong>`;

    const vSub2 = document.getElementById('inv-verdict-sub2');
    if (vSub2) vSub2.innerHTML = `Root Cause: <strong>${data.rootCause}</strong>`;

    // Audit Box
    const rawBox = document.getElementById('inv-raw-box-val');
    if (rawBox) {
      rawBox.textContent = data.observed;
      rawBox.style.color = data.observedColor;
    }

    const impBox = document.getElementById('inv-imputed-box-val');
    if (impBox) impBox.textContent = data.imputed;

    const impConf = document.getElementById('inv-imputed-conf');
    if (impConf) impConf.textContent = data.imputedConf;

    // Replay Step Note
    const stepNote = document.getElementById('replay-step-note');
    if (stepNote) stepNote.textContent = data.stepNote;

    // Replay Timeline Steps
    const replayContainer = document.getElementById('replay-steps-container');
    if (replayContainer && data.replaySteps) {
      replayContainer.innerHTML = data.replaySteps
        .map((s, idx) => {
          const isSpike = s.type === 'spike';
          const tagClass = isSpike ? 'tag-critical' : s.type === 'eval' ? 'tag-eval' : 'tag-normal';
          const valStyle = isSpike ? 'color:var(--status-critical); font-weight:700;' : '';

          return `
            <div class="replay-step-card ${isSpike ? 'step-spike' : ''} ${idx === 3 ? 'active-step' : ''}">
              <div class="step-time">${s.time}</div>
              <div class="step-val" style="${valStyle}">${s.val}</div>
              <div class="step-tag ${tagClass}">${s.tag}</div>
            </div>
          `;
        })
        .join('');
    }

    // Evidence List
    const evContainer = document.getElementById('investigate-evidence-list');
    if (evContainer && data.evidence) {
      evContainer.innerHTML = data.evidence
        .map(
          (ev) => `
        <div class="evidence-item">
          <div class="evidence-top">
            <span class="evidence-num-title">${ev.title}</span>
            <span class="trust-badge ${ev.impact === 'Positive' ? 'badge-trusted' : 'badge-critical'}">Impact: ${ev.impact}</span>
          </div>
          <p class="evidence-desc">${ev.desc}</p>
        </div>
      `
        )
        .join('');
    }
  }
}

// Global Singleton Setup
window.InvestigateControllerInstance = null;

window.initInvestigate = function () {
  if (!window.InvestigateControllerInstance) {
    window.InvestigateControllerInstance = new InvestigateController();
  }
  return window.InvestigateControllerInstance;
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.initInvestigate());
} else {
  window.initInvestigate();
}
