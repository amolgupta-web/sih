/**
 * SkyGuard AI — Dashboard Component & Live Alerts Controller
 * Manages KPI updates, station switching, timeframe selections, anomaly injection buttons,
 * and live alert filtering and interaction.
 */

class DashboardController {
  constructor() {
    this.stationSelect = document.getElementById('dashboard-station-select');
    this.timeframeBtns = document.querySelectorAll('.timeframe-btn');
    this.alertFilterBtns = document.querySelectorAll('.alert-filter-btn');
    this.alertsContainer = document.getElementById('live-alerts-list');
    this.alertsBadge = document.getElementById('active-alerts-count-badge');
    this.kpiActiveAnomalies = document.getElementById('kpi-active-anomalies');
    this.kpiHealthySensors = document.getElementById('kpi-healthy-sensors');

    // Chart live value elements
    this.chartValTemp = document.getElementById('chart-val-temp');
    this.chartValHum = document.getElementById('chart-val-hum');
    this.chartValPress = document.getElementById('chart-val-press');

    // Alerts collection
    this.alerts = [
      {
        id: 'ALT-1094',
        severity: 'Critical',
        title: 'Extreme Temperature Spike',
        stationId: 'AWS-DEL-07',
        val: '55.2°C',
        confidence: 98,
        cause: 'Sensor Malfunction (Thermistor / ADC Failure)',
        action: 'Inspect temperature sensor and wiring immediately.',
        timestamp: 'Just now',
        active: true,
        features: {
          histDev: 92,
          crossSensor: 84,
          spatial: 96,
          temporal: 88
        }
      },
      {
        id: 'ALT-1092',
        severity: 'Warning',
        title: 'Humidity Sensor Drift Detected',
        stationId: 'AWS-JPR-12',
        val: '+18% Δ',
        confidence: 87,
        cause: 'Capacitive Polymer Degradation',
        action: 'Schedule calibration within 7 days.',
        timestamp: '14 min ago',
        active: true,
        features: {
          histDev: 54,
          crossSensor: 72,
          spatial: 78,
          temporal: 42
        }
      },
      {
        id: 'ALT-1088',
        severity: 'Medium',
        title: 'Pressure Pattern Inconsistency',
        stationId: 'AWS-MUM-04',
        val: '1002.1 hPa',
        confidence: 79,
        cause: 'Environmental disturbance or bus instability',
        action: 'Check barometer inlet port for moisture.',
        timestamp: '42 min ago',
        active: true,
        features: {
          histDev: 38,
          crossSensor: 65,
          spatial: 45,
          temporal: 60
        }
      }
    ];

    this.activeFilter = 'All';

    this.init();
  }

  init() {
    this.bindEvents();
    this.renderAlerts();

    // Subscribe to stream updates
    if (window.SkyGuardStreamEngineInstance) {
      window.SkyGuardStreamEngineInstance.subscribe((data) => {
        this.onStreamTick(data);
      });
    }
  }

  bindEvents() {
    // Station dropdown
    if (this.stationSelect) {
      this.stationSelect.addEventListener('change', (e) => {
        const stationId = e.target.value;
        if (window.SkyGuardStreamEngineInstance) {
          window.SkyGuardStreamEngineInstance.setStation(stationId);
        }
      });
    }

    // Timeframe selector
    this.timeframeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.timeframeBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        // Redraw charts with simulated timeframe density
        if (window.ChartsManager && window.SkyGuardStreamEngineInstance) {
          const buf = window.SkyGuardStreamEngineInstance.stationBuffers[window.SkyGuardStreamEngineInstance.activeStationId];
          window.ChartsManager.updateAll(buf);
        }
      });
    });

    // Alert filter buttons
    this.alertFilterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.alertFilterBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeFilter = btn.dataset.filter || 'All';
        this.renderAlerts();
      });
    });

    // Anomaly Injection sandbox buttons
    const bindInject = (id, type) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('click', () => {
          if (type === 'reset') {
            window.SkyGuardStreamEngineInstance.resetBaseline();
          } else {
            window.SkyGuardStreamEngineInstance.injectAnomaly(type);
          }
        });
      }
    };

    bindInject('btn-inject-spike', 'spike');
    bindInject('btn-inject-frozen', 'frozen');
    bindInject('btn-inject-drift', 'drift');
    bindInject('btn-inject-comm', 'comm_error');
    bindInject('btn-inject-missing', 'missing');
    bindInject('btn-inject-storm', 'real_storm');
    bindInject('btn-inject-reset', 'reset');
  }

  onStreamTick(data) {
    const reading = data.reading;
    const aiAnalysis = data.aiAnalysis;

    // Update real-time chart header labels
    if (this.chartValTemp && reading.temp !== null) this.chartValTemp.innerText = `${reading.temp}°C`;
    if (this.chartValHum && reading.humidity !== null) this.chartValHum.innerText = `${reading.humidity}%`;
    if (this.chartValPress && reading.pressure !== null) this.chartValPress.innerText = `${reading.pressure} hPa`;

    // Update charts
    if (window.ChartsManager) {
      window.ChartsManager.updateAll(data.buffer);
    }

    // If an anomaly was detected on this tick, prepend to alerts
    if (aiAnalysis.isAnomaly) {
      const existing = this.alerts.find(a => a.cause === aiAnalysis.rootCause && a.stationId === reading.stationId);
      if (!existing) {
        this.alerts.unshift({
          id: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
          severity: aiAnalysis.severity,
          title: `${aiAnalysis.primarySensor} ${aiAnalysis.rootCause}`,
          stationId: reading.stationId,
          val: `${reading.temp !== null ? reading.temp : reading.humidity || reading.pressure}`,
          confidence: aiAnalysis.confidence,
          cause: aiAnalysis.explanation,
          action: aiAnalysis.action,
          timestamp: 'Just now',
          active: true,
          analysisData: aiAnalysis
        });
        if (this.alerts.length > 8) this.alerts.pop();
        this.renderAlerts();
      }
    }

    // Update KPI counts
    const activeCount = this.alerts.filter(a => a.active).length;
    if (this.kpiActiveAnomalies) {
      this.kpiActiveAnomalies.innerText = activeCount < 10 ? `0${activeCount}` : activeCount;
    }
    if (this.alertsBadge) {
      this.alertsBadge.innerText = `${activeCount} Active`;
    }
  }

  renderAlerts() {
    if (!this.alertsContainer) return;

    const filtered = this.alerts.filter(a => {
      if (this.activeFilter === 'All') return true;
      return a.severity.toLowerCase() === this.activeFilter.toLowerCase();
    });

    if (filtered.length === 0) {
      this.alertsContainer.innerHTML = `
        <div style="padding: 30px; text-align: center; color: #94A3B8; font-size: 0.9rem;">
          No alerts found under ${this.activeFilter} filter. All sensors nominal.
        </div>
      `;
      return;
    }

    this.alertsContainer.innerHTML = filtered.map(alert => {
      const sevClass = alert.severity.toLowerCase();
      return `
        <div class="alert-card-item severity-${sevClass}">
          <div class="alert-card-top">
            <div class="alert-title-group">
              <span class="severity-pill ${sevClass}">${alert.severity}</span>
              <h4 class="alert-headline">${alert.title}</h4>
              <span class="alert-station-id">${alert.stationId}</span>
            </div>
            <span class="alert-timestamp">${alert.timestamp}</span>
          </div>

          <div class="alert-card-body">
            <div class="alert-data-col">
              <span class="alert-col-label">Observed Reading</span>
              <span class="alert-col-val">${alert.val}</span>
            </div>
            <div class="alert-data-col">
              <span class="alert-col-label">AI Confidence</span>
              <span class="alert-col-val" style="color: ${sevClass === 'critical' ? '#EF4444' : '#C59B27'}">${alert.confidence}%</span>
            </div>
            <div class="alert-data-col" style="grid-column: span 2">
              <span class="alert-col-label">Probable Root Cause</span>
              <span class="alert-col-val">${alert.cause}</span>
            </div>
          </div>

          <div class="alert-card-footer">
            <div class="alert-recommended-action">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span><strong>Action:</strong> ${alert.action}</span>
            </div>
            <button class="btn-inspect-xai" onclick="window.inspectAnomalyInXAI('${alert.id}')">
              Explain with XAI →
            </button>
          </div>
        </div>
      `;
    }).join('');
  }
}

window.DashboardControllerInstance = null;
window.initDashboard = function() {
  if (!window.DashboardControllerInstance) {
    window.DashboardControllerInstance = new DashboardController();
  }
};
