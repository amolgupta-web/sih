/**
 * SkyGuard AI — Command Center Controller
 * Synchronizes focal station telemetry, multi-station pills (Jaipur, Delhi, Chennai),
 * network trust metric displays, triage queue rendering, and action delegation.
 */

class CommandCenterController {
  constructor() {
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
    document.addEventListener('click', (e) => {
      // 1. Focal Station Quick-Switch Pills
      const pill = e.target.closest('[data-station-id]');
      if (pill) {
        const stationId = pill.dataset.stationId;
        if (stationId && window.OperationalStreamEngineInstance) {
          window.OperationalStreamEngineInstance.setStation(stationId);
          this.updateActivePill(stationId);
        }
        return;
      }

      // 2. Triage Actions (Quarantine / Impute)
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
        stations: this.streamEngine.stations,
        networkTrust: this.streamEngine.activeScenario === 'failure' ? 86 : 96
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

    // Resilient network score: 86 on isolated single-sensor failure, 96 nominal
    const score = data.networkTrust ?? (data.scenario === 'failure' ? 86 : 96);

    if (scoreEl) {
      scoreEl.innerHTML = `${score} <span>/ 100</span>`;
    }

    if (barEl) {
      barEl.style.width = `${score}%`;
      barEl.style.backgroundColor = score >= 85 ? 'var(--brand-teal, #2E9B73)' : 'var(--brand-amber, #C98A1C)';
    }

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
    const stationTitleEl = document.getElementById('cmd-active-station-name');
    const alertTagEl = document.getElementById('cmd-chart-alert-tag');

    if (stationTitleEl && (reading.stationName || data.stationName)) {
      const name = reading.stationName || data.stationName;
      const id = reading.stationId || data.stationId;
      stationTitleEl.textContent = `${id} (${name})`;
    }

    if (alertTagEl) {
      const hasAnomaly = data.analysis && data.analysis.isAnomaly;
      if (hasAnomaly) {
        alertTagEl.textContent = '• 1 Anomaly Flagged at 14:32:15';
        alertTagEl.style.display = 'inline';
      } else {
        alertTagEl.textContent = '• Nominal Signal Flow';
        alertTagEl.style.display = 'none';
      }
    }
  }

  updateTriageQueue(data) {
    const triageContainer =
      document.getElementById('cmd-attention-queue-list') ||
      document.getElementById('cmd-triage-list') ||
      document.querySelector('.queue-items-list');

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
            Single-channel thermistor surge to 55.2°C. Neighborhood spatial consensus rejected telemetry.
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
      const scoreEl = document.getElementById('cmd-trust-score');
      const barEl = document.getElementById('cmd-trust-bar') || document.getElementById('cmd-trust-progress-bar');
      if (scoreEl) scoreEl.innerHTML = `96 <span>/ 100</span>`;
      if (barEl) {
        barEl.style.width = '96%';
        barEl.style.backgroundColor = 'var(--brand-teal, #2E9B73)';
      }
      if (window.UnifiedComparativeChartInstance) {
        window.UnifiedComparativeChartInstance.render();
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

// Global Singleton Setup
window.CommandCenterControllerInstance = null;

window.initCommandCenter = function () {
  if (!window.CommandCenterControllerInstance) {
    window.CommandCenterControllerInstance = new CommandCenterController();
  }
  return window.CommandCenterControllerInstance;
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.initCommandCenter());
} else {
  window.initCommandCenter();
}
