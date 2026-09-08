/**
 * SkyGuard AI — Command Center Operational Controller
 * Manages live telemetry KPIs, network data trust gauges, active triage queue,
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
    // Global delegation on workspace container
    document.addEventListener('click', (e) => {
      // Station selector pill buttons
      const pill = e.target.closest('[data-station-id]');
      if (pill) {
        const stationId = pill.dataset.stationId;
        if (stationId && window.OperationalStreamEngineInstance) {
          window.OperationalStreamEngineInstance.setStation(stationId);
          this.updateActivePill(stationId);
        }
        return;
      }

      // Triage card action buttons (Quarantine / Impute)
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
    const badgeEl = document.getElementById('cmd-trust-badge');
    const barEl = document.getElementById('cmd-trust-progress-bar');

    // Robust score extraction: explicit property -> station average -> fallback
    let score = data.networkTrust ?? data.networkTrustScore ?? data.trustScore;

    if (score === undefined || score === null) {
      const stations = data.stations || (this.streamEngine ? this.streamEngine.stations : null);
      if (stations) {
        const vals = Object.values(stations).map((s) => s.trust || 90);
        score = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
      } else {
        score = 92;
      }
    }

    score = Math.max(0, Math.min(100, Math.round(score)));

    // 1. Update Score Text
    if (scoreEl) {
      scoreEl.innerHTML = `${score} <span>/ 100</span>`;
    }

    // 2. Update Health Status Badge
    if (badgeEl) {
      if (score >= 85) {
        badgeEl.textContent = 'HIGH FIDELITY';
        badgeEl.className = 'status-badge status-healthy';
      } else if (score >= 60) {
        badgeEl.textContent = 'MONITORED DEGRADATION';
        badgeEl.className = 'status-badge status-warning';
      } else {
        badgeEl.textContent = 'CRITICAL INTERVENTION REQ.';
        badgeEl.className = 'status-badge status-critical';
      }
    }

    // 3. Update Progress Bar
    if (barEl) {
      barEl.style.width = `${score}%`;
      barEl.style.backgroundColor =
        score >= 85
          ? 'var(--brand-teal, #2E9B73)'
          : score >= 60
          ? 'var(--brand-amber, #C98A1C)'
          : 'var(--brand-coral, #C94F4F)';
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
    // 1. Query for the right-hand panel card identified in the DOM tree
    const queueCard = document.querySelector('.queue-panel-card') || document.getElementById('cmd-triage-list');
    if (!queueCard) return;

    // 2. Query or mount list container inside the panel
    let triageList = queueCard.querySelector('.queue-items-container');
    if (!triageList) {
      triageList = document.createElement('div');
      triageList.className = 'queue-items-container';
      triageList.style.marginTop = '14px';
      triageList.style.display = 'flex';
      triageList.style.flexDirection = 'column';
      triageList.style.gap = '12px';
      queueCard.appendChild(triageList);
    }

    // 3. Determine incident state based on stream scenario and anomaly status
    const isFailure = data.scenario === 'failure' || (data.analysis && data.analysis.isAnomaly);
    const isStorm = data.scenario === 'storm';

    if (isFailure) {
      triageList.innerHTML = `
        <div class="triage-card triage-critical" style="background:#FFF5F5; border:1px solid #FED7D7; border-left:4px solid #C94F4F; border-radius:8px; padding:14px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <span style="background:#C94F4F; color:#fff; font-size:10px; font-weight:700; padding:3px 8px; border-radius:4px; letter-spacing:0.5px;">CRITICAL ANOMALY</span>
            <span style="font-size:12px; font-weight:700; color:#17201E;">AWS-JPR-04</span>
          </div>
          <p style="font-size:12px; color:#4A5568; margin:0 0 10px 0; line-height:1.4;">
            Single-channel thermistor surge to 55.2°C. Neighborhood spatial consensus rejected telemetry.
          </p>
          <div style="display:flex; gap:14px; font-size:11px; color:#718096; margin-bottom:12px;">
            <span>Confidence: <strong style="color:#C94F4F;">98.4%</strong></span>
            <span>AI Baseline: <strong style="color:#2E9B73;">25.4°C</strong></span>
          </div>
          <div style="display:flex; gap:8px;">
            <button class="btn-xs" data-action="quarantine" data-target-station="AWS-JPR-04" style="background:#fff; border:1px solid #CBD5E0; padding:6px 10px; font-size:11px; font-weight:600; border-radius:4px; cursor:pointer; color:#17201E;">Quarantine Channel</button>
            <button class="btn-xs" data-action="approve-impute" data-target-station="AWS-JPR-04" style="background:#2E9B73; color:#fff; border:none; padding:6px 10px; font-size:11px; font-weight:600; border-radius:4px; cursor:pointer;">Apply AI Baseline</button>
          </div>
        </div>

        <div class="triage-card triage-warning" style="background:#FFFAF0; border:1px solid #FEEBC8; border-left:4px solid #C98A1C; border-radius:8px; padding:14px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <span style="background:#C98A1C; color:#fff; font-size:10px; font-weight:700; padding:3px 8px; border-radius:4px; letter-spacing:0.5px;">POWER DRIFT</span>
            <span style="font-size:12px; font-weight:700; color:#17201E;">AWS-DEL-07</span>
          </div>
          <p style="font-size:12px; color:#4A5568; margin:0; line-height:1.4;">
            Photovoltaic output degraded below 11.2V envelope. Calibration drift likely within 12h.
          </p>
        </div>

        <div class="triage-card triage-info" style="background:#F8FAFC; border:1px solid #E2E8F0; border-left:4px solid #3B82F6; border-radius:8px; padding:14px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <span style="background:#3B82F6; color:#fff; font-size:10px; font-weight:700; padding:3px 8px; border-radius:4px; letter-spacing:0.5px;">STATION DIAGNOSTIC</span>
            <span style="font-size:12px; font-weight:700; color:#17201E;">AWS-MUM-02</span>
          </div>
          <p style="font-size:12px; color:#4A5568; margin:0; line-height:1.4;">
            Barometric pressure noise variance elevated by 18%. Telemetry tagged for observation.
          </p>
        </div>
      `;
    } else if (isStorm) {
      triageList.innerHTML = `
        <div class="triage-card triage-info" style="background:#EFF6FF; border:1px solid #BFDBFE; border-left:4px solid #3B82F6; border-radius:8px; padding:14px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <span style="background:#3B82F6; color:#fff; font-size:10px; font-weight:700; padding:3px 8px; border-radius:4px; letter-spacing:0.5px;">GENUINE WEATHER EVENT</span>
            <span style="font-size:12px; font-weight:700; color:#17201E;">Northern Grid</span>
          </div>
          <p style="font-size:12px; color:#4A5568; margin:0 0 8px 0; line-height:1.4;">
            Convective front verified across 4 adjacent stations. Rapid barometric plunge and RH rise confirmed physically valid.
          </p>
          <div style="display:flex; gap:14px; font-size:11px; color:#718096;">
            <span>Mesh Agreement: <strong style="color:#2E9B73;">94.2%</strong></span>
            <span>Status: <strong style="color:#3B82F6;">Auto-Approved</strong></span>
          </div>
        </div>
      `;
    } else {
      triageList.innerHTML = `
        <div style="background:#F0FDF4; border:1px solid #DCFCE7; border-left:4px solid #2E9B73; border-radius:8px; padding:14px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="background:#2E9B73; color:#fff; font-size:10px; font-weight:700; padding:3px 8px; border-radius:4px;">NOMINAL</span>
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
      if (window.UnifiedComparativeChartInstance) {
        window.UnifiedComparativeChartInstance.render();
      }
      const scoreEl = document.getElementById('cmd-trust-score');
      if (scoreEl) {
        scoreEl.innerHTML = `96 <span>/ 100</span>`;
      }
    } else if (action === 'quarantine') {
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

// Global Singleton Initialization
window.CommandCenterControllerInstance = null;

window.initCommandCenter = function () {
  if (!window.CommandCenterControllerInstance) {
    window.CommandCenterControllerInstance = new CommandCenterController();
  }
  return window.CommandCenterControllerInstance;
};

// Bootstrap if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.initCommandCenter());
} else {
  window.initCommandCenter();
}
