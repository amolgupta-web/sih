/**
 * SkyGuard AI — Incident Investigation Controller
 * Handles city tab switching, multi-factor evidence decomposition,
 * event replay timeline scrubbers, and dynamic reality check verdicts.
 */

class InvestigateController {
  constructor() {
    this.activeStation = 'AWS-JPR-04';

    this.stationIncidents = {
      'AWS-JPR-04': {
        stationName: 'AWS-JPR-04 (Jaipur Semi-Arid)',
        subtitle: 'Transparent multi-factor evidence decomposition and event replay for Jaipur Semi-Arid Grid.',
        incidentBadge: 'INCIDENT #INC-4402',
        occurredTime: '14:32:18 IST',
        title: 'Temperature Surge to 55.2°C Detected at AWS-JPR-04',
        sensorName: 'PT100 RTD Thermistor',
        observedVal: '55.2°C',
        observedColor: 'var(--status-critical)',
        verdictTitle: 'PROBABLE SENSOR ANOMALY',
        confidence: '98.4%',
        severity: 'CRITICAL',
        rootCause: 'Sudden Sensor Spike (Thermistor / ADC Failure)',
        rawVal: '55.2°C',
        imputedVal: '25.4°C',
        imputeConf: 'Estimation Confidence: 91%',
        chartTitle: 'Incident Forensic Waveform & Baseline Envelope (Jaipur)',
        weatherSupport: '4%',
        anomalySupport: '96%',
        recommendation: 'Do not trigger heat advisory. Dispatch P1 maintenance order to inspect AWS-JPR-04.',
        evidence: [
          {
            title: '01 • Historical Baseline Deviation',
            impact: 'Impact: High',
            desc: '55.2°C is significantly outside the expected historical diurnal range. Expected seasonal range for this hour: 22.0°C – 27.5°C (Z-Score: +9.8σ).'
          },
          {
            title: '02 • Temporal Deviation Rate',
            impact: 'Impact: High',
            desc: 'The temperature increased by approximately 30°C within 15 seconds. Thermal inertia of ambient air physically forbids this rate of change without explosive combustion.'
          },
          {
            title: '03 • Cross-Sensor Consistency',
            impact: 'Impact: High',
            desc: 'Relative humidity (44%) and atmospheric pressure (1008 hPa) do not support an extreme heat event. Clausius-Clapeyron saturation vapor pressure would require impossible dew points (>44°C).'
          },
          {
            title: '04 • Nearby Station Comparison',
            impact: 'Impact: Very High',
            desc: '4 nearby mesonet stations within 15km remain between 24.2°C and 25.8°C. An atmospheric heat event cannot be physically confined to a 10-meter footprint.'
          }
        ]
      },
      'AWS-DEL-07': {
        stationName: 'AWS-DEL-07 (Delhi Urban Heat Corridor)',
        subtitle: 'Transparent multi-factor evidence decomposition and event replay for Delhi Urban Heat Corridor.',
        incidentBadge: 'ATTENTION #INC-4410',
        occurredTime: '12:15:00 IST',
        title: 'Photovoltaic Auxiliary Rail Voltage Droop to 10.8V',
        sensorName: 'PV Power Bus & ADC Ref',
        observedVal: '10.8 V',
        observedColor: 'var(--status-attention)',
        verdictTitle: 'POWER BUS DRIFT & ADC OFFSET',
        confidence: '88.1%',
        severity: 'ATTENTION',
        rootCause: 'Urban Particulate Soot Layer & Battery Under-run',
        rawVal: '10.8 V',
        imputedVal: '13.8 V (Nominal)',
        imputeConf: 'Estimation Confidence: 85%',
        chartTitle: 'Incident Forensic Waveform & Baseline Envelope (Delhi)',
        weatherSupport: '12%',
        anomalySupport: '88%',
        recommendation: 'Dispatch P2 field crew to clean solar glass panels and test auxiliary battery bank.',
        evidence: [
          {
            title: '01 • Bus Voltage Under-run',
            impact: 'Impact: High',
            desc: 'Auxiliary rail dropped below 11.2V threshold, causing reference voltage instability on capacitive humidity ADC.'
          },
          {
            title: '02 • Particulate Accumulation',
            impact: 'Impact: Medium',
            desc: 'PM10 particulate deposition on solar cells reduced charging efficiency by 14% over 3 weeks.'
          },
          {
            title: '03 • Secondary Sensor Impact',
            impact: 'Impact: Medium',
            desc: 'Humidity sensor showing +18% relative drift directly correlated with the 10.8V supply sag.'
          }
        ]
      },
      'AWS-CHE-12': {
        stationName: 'AWS-CHE-12 (Chennai Coastal Marine Mesh)',
        subtitle: 'Transparent multi-factor evidence decomposition and event replay for Chennai Coastal Marine Mesh.',
        incidentBadge: 'STATUS #NOMINAL-01',
        occurredTime: '11:45:20 IST',
        title: 'Nominal Marine Operation & Hermetic Seal Verification',
        sensorName: 'IP68 Barometric & RTD Core',
        observedVal: '31.8°C',
        observedColor: 'var(--status-trusted)',
        verdictTitle: 'HIGH-TRUST BASELINE CONFIRMED',
        confidence: '99.9%',
        severity: 'NOMINAL',
        rootCause: 'Normal Diurnal Sea Breeze Transition',
        rawVal: '31.8°C',
        imputedVal: '31.8°C',
        imputeConf: 'Estimation Confidence: 99%',
        chartTitle: 'Incident Forensic Waveform & Baseline Envelope (Chennai)',
        weatherSupport: '99%',
        anomalySupport: '1%',
        recommendation: 'No maintenance intervention required. Station acting as regional spatial anchor.',
        evidence: [
          {
            title: '01 • Spatial Consensus Match',
            impact: 'Impact: High',
            desc: 'Readings perfectly match coastal tidal dynamics and adjacent marine buoys.'
          },
          {
            title: '02 • Desiccant Integrity',
            impact: 'Impact: Low',
            desc: 'Enclosure humidity maintained at 12% with zero salt-spray condensation detected.'
          }
        ]
      }
    };

    this.init();
  }

  init() {
    this.bindCityTabs();
    this.bindReplayScrubber();
    this.render(this.activeStation);
  }

  bindCityTabs() {
    document.addEventListener('click', (e) => {
      const tabBtn = e.target.closest('[data-investigate-station]');
      if (tabBtn) {
        const stId = tabBtn.dataset.investigateStation;
        this.setStation(stId);
      }
    });
  }

  setStation(stationId) {
    if (!this.stationIncidents[stationId]) return;
    this.activeStation = stationId;

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
    const data = this.stationIncidents[stationId];
    if (!data) return;

    const setTxt = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setTxt('investigate-subtitle', data.subtitle);
    setTxt('inv-incident-badge', data.incidentBadge);
    setTxt('inv-occurred-time', data.occurredTime);
    setTxt('inv-incident-title', data.title);
    setTxt('inv-station-name', data.stationName);
    setTxt('inv-sensor-name', data.sensorName);

    const obsEl = document.getElementById('inv-observed-val');
    if (obsEl) {
      obsEl.textContent = data.observedVal;
      obsEl.style.color = data.observedColor;
    }

    setTxt('inv-verdict-title', data.verdictTitle);
    setTxt('inv-verdict-sub1', `Confidence: ${data.confidence} • Severity: ${data.severity}`);
    setTxt('inv-verdict-sub2', `Root Cause: ${data.rootCause}`);

    setTxt('inv-raw-box-val', data.rawVal);
    const rawEl = document.getElementById('inv-raw-box-val');
    if (rawEl) rawEl.style.color = data.observedColor;

    setTxt('inv-imputed-box-val', data.imputedVal);
    setTxt('inv-imputed-conf', data.imputeConf);
    setTxt('inv-chart-title', data.chartTitle);

    // Render Evidence List
    const evList = document.getElementById('investigate-evidence-list');
    if (evList && data.evidence) {
      evList.innerHTML = data.evidence
        .map(
          (ev) => `
        <div style="background:var(--bg-app); border:1px solid var(--border-light); border-radius:6px; padding:12px; margin-bottom:8px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <strong style="font-size:0.85rem; color:var(--text-primary);">${ev.title}</strong>
            <span style="font-size:0.7rem; font-weight:700; color:var(--status-critical); background:#FFF5F5; padding:2px 6px; border-radius:4px;">${ev.impact}</span>
          </div>
          <p style="font-size:0.75rem; color:var(--text-secondary); margin:0; line-height:1.4;">${ev.desc}</p>
        </div>
      `
        )
        .join('');
    }
  }

  bindReplayScrubber() {
    const stepsContainer = document.getElementById('replay-steps-container');
    if (!stepsContainer) return;

    const steps = [
      { time: '14:31:30', val: '25.1°C', status: 'NOMINAL', badge: 'badge-trusted' },
      { time: '14:31:45', val: '25.3°C', status: 'NOMINAL', badge: 'badge-trusted' },
      { time: '14:32:00', val: '25.2°C', status: 'NOMINAL', badge: 'badge-trusted' },
      { time: '14:32:15', val: '55.2°C', status: 'SPIKE FLAGGED', badge: 'badge-critical' },
      { time: '14:32:16', val: 'AI Sweep', status: 'EVALUATING', badge: 'badge-attention' },
      { time: '14:32:18', val: 'Classified', status: 'CRITICAL ANOMALY', badge: 'badge-critical' }
    ];

    stepsContainer.innerHTML = steps
      .map(
        (s) => `
      <div style="background:#ffffff; border:1px solid var(--border-light); border-radius:6px; padding:10px; min-width:110px; text-align:center; box-shadow:var(--shadow-sm);">
        <div style="font-size:0.7rem; font-family:var(--font-mono); color:var(--text-secondary); margin-bottom:4px;">${s.time}</div>
        <div style="font-size:0.95rem; font-weight:800; color:var(--text-primary); margin-bottom:6px;">${s.val}</div>
        <span class="trust-badge ${s.badge}" style="font-size:9px; padding:2px 5px; border-radius:3px;">${s.status}</span>
      </div>
    `
      )
      .join('');
  }
}

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
