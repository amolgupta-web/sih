/**
 * SkyGuard AI — Command Center Operational Controller
 * Manages live telemetry KPIs, network data trust gauges, active attention queue,
 * station quick-switch selectors, and real-time comparative chart integration.
 */

class CommandCenterController {
  constructor() {
    this.container = document.getElementById('view-command-center');
    this.streamEngine = window.OperationalStreamEngineInstance || null;
    this.unsubscribe = null;

    this.init();
  }

  init() {
    this.bindControls();
    this.subscribeToStream();
    this.renderInitialState();
  }

  bindControls() {
    // Global event delegation on container
    document.addEventListener('click', (e) => {
      // Station selector buttons
      const pill = e.target.closest('[data-station-id]');
      if (pill) {
        const stationId = pill.dataset.stationId;
        if (stationId && window.OperationalStreamEngineInstance) {
          window.OperationalStreamEngineInstance.setStation(stationId);
          this.updateActivePill(stationId);
        }
        return;
      }

      // Attention Queue Triage buttons (Quarantine / Impute)
      const actionBtn = e.target.closest('[data-action]');
      if (actionBtn) {
        const action = actionBtn.dataset.action;
        const stationId = actionBtn.dataset.targetStation || 'AWS-JPR-04';
        this.handleTriageAction(action, stationId);
      }
    });
  }

  subscribeToStream() {
    const bind = () => {
      if (window.OperationalStreamEngineInstance) {
        this.streamEngine = window.OperationalStreamEngineInstance;
        this.unsubscribe = this.streamEngine.subscribe((payload) => {
          this.updateView(payload);
        });
      } else {
        setTimeout(bind, 100);
      }
    };
    bind();
  }

  renderInitialState() {
    if (!this.streamEngine) return;
    const activeId = this.streamEngine.activeStationId || 'AWS-JPR-04';
    const station = this.streamEngine.stations[activeId];
    const buffer = this.streamEngine.stationBuffers?.[activeId];

    this.updateActivePill(activeId);
    if (station && buffer) {
      this.updateView({
        reading: {
          stationId: activeId,
          stationName: station.name,
          temp: buffer.temp[buffer.temp.length - 1] ?? station.baseTemp,
          humidity: buffer.humidity[buffer.humidity.length - 1] ?? station.baseHum,
          pressure: buffer.pressure[buffer.pressure.length - 1] ?? station.basePress
        },
        analysis: {
          isAnomaly: activeId === 'AWS-JPR-04' && this.streamEngine.activeScenario === 'failure',
          confidence: 0.98,
          imputedVal: 25.4,
          trustScore: station.trust
        },
        buffer,
        stationId: activeId,
        scenario: this.streamEngine.activeScenario,
        stations: this.streamEngine.stations
      });
    }
  }

  updateView(data) {
    if (!data) return;

    this.updateTrustMetrics(data);
    this.updateStationKPIs(data);
    this.updateTriageQueue(data);
    if (data.stationId) {
      this.updateActivePill(data.stationId);
    }
  }

  updateTrustMetrics(data) {
    const scoreEl = document.getElementById('cmd-trust-score');
    const barEl = document.getElementById('cmd-trust-bar') || document.getElementById('cmd-trust-progress-bar');
    const badgeEl = document.getElementById('cmd-trust-badge');

    // Resilient Network Scoring:
    // A single faulty sensor in a 24-station mesonet only drops network score to 86/100, not 69/100
    let score;
    if (data.scenario === 'failure') {
      score = 86; // Monitored network status with single-channel anomaly
    } else {
      score = 96; // Fully trusted, high fidelity state
    }

    // 1. Update Trust Score Display
    if (scoreEl) {
      scoreEl.innerHTML = `${score} <span>/ 100</span>`;
    }

    // 2. Update Progress Bar
    if (barEl) {
      barEl.style.width = `${score}%`;
      barEl.style.backgroundColor = score >= 85 ? 'var(--brand-teal, #2E9B73)' : 'var(--brand-amber, #C98A1C)';
    }

    // 3. Optional Status Badge update
    if (badgeEl) {
      if (score >= 85) {
        badgeEl.textContent = 'HIGH FIDELITY';
        badgeEl.className = 'status-badge status-healthy';
      } else {
        badgeEl.textContent = 'DEGRADATION MONITORED';
        badgeEl.className = 'status-badge status-warning';
      }
    }
  }

  updateStationKPIs(data) {
    const reading = data.reading || {};

    const tempEl = document.getElementById('kpi-temp-val');
    const humEl = document.getElementById('kpi-hum-val');
    const pressEl = document.getElementById('kpi-press-val');
    const stationTitleEl = document.getElementById('cmd-active-station-name');

    if (tempEl && reading.temp !== undefined) {
      tempEl.textContent = `${Number(reading.temp).toFixed(1)}°C`;
    }
    if (humEl && reading.humidity !== undefined) {
      humEl.textContent = `${Number(reading.humidity).toFixed(1)}%`;
    }
    if (pressEl && reading.pressure !== undefined) {
      pressEl.textContent = `${Number(reading.pressure).toFixed(1)} hPa`;
    }
    if (stationTitleEl && reading.stationName) {
      stationTitleEl.textContent = `${reading.stationName} (${reading.stationId || this.streamEngine?.activeStationId})`;
    }
  }

  updateTriageQueue(data) {
    // 1. Query for container matching both original and updated index.html IDs
    const triageContainer =
      document.getElementById('cmd-attention-queue-list') ||
      document.getElementById('cmd-triage-list') ||
      document.querySelector('.queue-items-list') ||
      document.querySelector('.queue-panel-card .queue-items-container');

    if (!triageContainer) return;

    const isFailure = data.scenario === 'failure' || (data.analysis && data.analysis.isAnomaly);

    if (isFailure) {
      triageContainer.innerHTML = `
        <div class="triage-card triage-critical" style="background:#FFF5F5; border:1px solid #FED7D7; border-left:4px solid #C94F4F; border-radius:8px; padding:14px; margin-bottom:10px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <span style="background:#C94F4F; color:#fff; font-size:10px; font-weight:700; padding:2px 8px; border-radius:4px; letter-spacing:0.5px;">CRITICAL ANOMALY</span>
            <span style="font-size:12px; font-weight:700; color:#17201E;">AWS-JPR-04</span>
          </div>
          <p style="font-size:12px; color:#4A5568; margin:0 0 10px 0; line-height:1.4;">
            Single-channel thermistor surge to 55.2°C. Spatial consensus rejected telemetry.
          </p>
          <div style="display:flex; gap:14px; font-size:11px; color:#718096; margin-bottom:12px;">
            <span>Confidence: <strong style="color:#C94F4F;">98.4%</strong></span>
            <span>AI Baseline: <strong style="color:#2E9B73;">25.4°C</strong></span>
          </div>
          <div style="display:flex; gap:8px;">
            <button class="btn-xs btn-control" data-action="quarantine" data-target-station="AWS-JPR-04" style="background:#fff; border:1px solid #CBD5E0; padding:6px 10px; font-size:11px; font-weight:600; border-radius:4px; cursor:pointer; color:#17201E;">Quarantine Channel</button>
            <button class="btn-xs btn-brand" data-action="approve-impute" data-target-station="AWS-JPR-04" style="background:#2E9B73; color:#fff; border:none; padding:6px 10px; font-size:11px; font-weight:600; border-radius:4px; cursor:pointer;">Apply AI Baseline</button>
          </div>
        </div>

        <div class="triage-card triage-warning" style="background:#FFFAF0; border:1px solid #FEEBC8; border-left:4px solid #C98A1C; border-radius:8px; padding:14px; margin-bottom:10px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <span style="background:#C98A1C; color:#fff; font-size:10px; font-weight:700; padding:2px 8px; border-radius:4px; letter-spacing:0.5px;">POWER DRIFT</span>
            <span style="font-size:12px; font-weight:700; color:#17201E;">AWS-DEL-07</span>
          </div>
          <p style="font-size:12px; color:#4A5568; margin:0; line-height:1.4;">
            Photovoltaic output degraded below 11.2V envelope. Calibration drift likely within 12h.
          </p>
        </div>

        <div class="triage-card triage-info" style="background:#F8FAFC; border:1px solid #E2E8F0; border-left:4px solid #3B82F6; border-radius:8px; padding:14px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <span style="background:#3B82F6; color:#fff; font-size:10px; font-weight:700; padding:2px 8px; border-radius:4px; letter-spacing:0.5px;">STATION DIAGNOSTIC</span>
            <span style="font-size:12px; font-weight:700; color:#17201E;">AWS-MUM-02</span>
          </div>
          <p style="font-size:12px; color:#4A5568; margin:0; line-height:1.4;">
            Barometric pressure noise variance elevated by 18%. Telemetry tagged for observation.
          </p>
        </div>
      `;
    } else {
      triageContainer.innerHTML = `
        <div style="background:#F0FDF4; border:1px solid #DCFCE7; border-left:4px solid #2E9B73; border-radius:8px; padding:14px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="background:#2E9B73; color:#fff; font-size:10px; font-weight:700; padding:2px 8px; border-radius:4px;">NOMINAL</span>
            <span style="font-size:12px; font-weight:700; color:#17201E;">Mesonet Active</span>
          </div>
          <p style="font-size:12px; color:#4A5568; margin:0; line-height:1.4;">All 24 mesonet sensor nodes verified healthy within tolerance envelopes. Zero active quarantines.</p>
        </div>
      `;
    }
  }

  updateActivePill(stationId) {
    const pills = document.querySelectorAll('[data-station-id]');
    pills.forEach((pill) => {
      if (pill.dataset.stationId === stationId) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });
  }

  handleTriageAction(action, stationId) {
    if (action === 'approve-impute') {
      // 1. Immediately update Network Trust Score to near perfect
      const scoreEl = document.getElementById('cmd-trust-score');
      const barEl = document.getElementById('cmd-trust-bar') || document.getElementById('cmd-trust-progress-bar');
      if (scoreEl) scoreEl.innerHTML = `96 <span>/ 100</span>`;
      if (barEl) {
        barEl.style.width = '96%';
        barEl.style.backgroundColor = 'var(--brand-teal, #2E9B73)';
      }

      // 2. Redraw chart with clean baseline
      if (window.UnifiedComparativeChartInstance) {
        window.UnifiedComparativeChartInstance.render();
      }
    } else if (action === 'quarantine') {
      // Quarantine the station and return engine to normal telemetry loop
      if (window.OperationalStreamEngineInstance) {
        window.OperationalStreamEngineInstance.setScenario('normal');
      }
    }
  }

  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }
}

// Global Singleton Setup
window.CommandCenterControllerInstance = null;

window.initCommandCenter = function () {
  if (!window.CommandCenterControllerInstance) {
    window.CommandCenterControllerInstance = new CommandCenterController();
  }
  return window.CommandCenterControllerInstance;
};

// Bootstrap when DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.initCommandCenter());
} else {
  window.initCommandCenter();
}
