/**
 * SkyGuard AI — Command Center Controller
 * Coordinates the primary operational overview, Network Trust scoring,
 * 3-station summary metrics, and prioritized Attention Queue triage.
 */

class CommandCenterController {
  constructor() {
    this.queueItems = [
      {
        id: 'q-jpr',
        stationId: 'AWS-JPR-04',
        type: 'CRITICAL ANOMALY',
        badgeClass: 'badge-critical',
        desc: 'Single-channel thermistor surge to 55.2°C. Neighborhood spatial consensus rejected telemetry.',
        confidence: '98.4%',
        baseline: '25.4°C',
        triaged: false
      },
      {
        id: 'q-del',
        stationId: 'AWS-DEL-07',
        type: 'POWER DRIFT',
        badgeClass: 'badge-attention',
        desc: 'Photovoltaic output degraded below 11.2V envelope. Calibration drift likely within 12h.',
        confidence: '88.1%',
        baseline: '12.6V',
        triaged: false
      }
    ];

    this.init();
  }

  init() {
    this.renderQueue();
    this.bindPills();
    this.bindActions();
  }

  renderQueue() {
    const listEl = document.getElementById('cmd-attention-queue-list');
    if (!listEl) return;

    listEl.innerHTML = this.queueItems
      .map((item) => {
        const isCritical = item.type === 'CRITICAL ANOMALY';
        const isAttention = item.type === 'POWER DRIFT';
        const headerColor = isCritical
          ? 'var(--status-critical, #C94F4F)'
          : isAttention
          ? 'var(--status-attention, #C98A1C)'
          : 'var(--status-trusted, #2E9B73)';

        const borderColor = isCritical ? '#FED7D7' : isAttention ? '#FEEBC8' : '#DCFCE7';
        const bgColor = isCritical ? '#FFF5F5' : isAttention ? '#FFFAF0' : '#F0FDF4';

        return `
          <div class="queue-card" id="${item.id}" style="background:#ffffff; border:1px solid ${borderColor}; border-left:4px solid ${headerColor}; border-radius:6px; padding:12px; display:flex; flex-direction:column; gap:8px; margin-bottom:10px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span class="trust-badge" style="background:${bgColor}; color:${headerColor}; font-size:10px; font-weight:800; padding:2px 6px; border-radius:4px;">
                ${item.type}
              </span>
              <strong style="font-family:var(--font-mono); font-size:11px; color:var(--text-primary);">${item.stationId}</strong>
            </div>

            <p style="font-size:0.75rem; color:var(--text-secondary); margin:0; line-height:1.4;">
              ${item.desc}
            </p>

            <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.72rem; color:var(--text-secondary);">
              <span>Confidence: <strong style="color:var(--text-primary);">${item.confidence}</strong></span>
              <span>AI Target: <strong style="color:var(--brand-teal);">${item.baseline}</strong></span>
            </div>

            ${
              !item.triaged && isCritical
                ? `
              <div style="display:flex; gap:8px; margin-top:4px;">
                <button class="btn-control btn-xs btn-quarantine" data-id="${item.id}" style="flex:1; padding:4px 0; font-size:11px;">
                  Quarantine Channel
                </button>
                <button class="btn-control btn-xs btn-brand btn-apply-baseline" data-id="${item.id}" style="flex:1; padding:4px 0; font-size:11px;">
                  Apply AI Baseline
                </button>
              </div>
            `
                : ''
            }
          </div>
        `;
      })
      .join('');
  }

  bindPills() {
    const pills = document.querySelectorAll('.station-pill-btn');
    pills.forEach((pill) => {
      pill.addEventListener('click', () => {
        pills.forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');

        const stId = pill.dataset.stationId;
        if (window.OperationalStreamEngineInstance) {
          window.OperationalStreamEngineInstance.setStation(stId);
        }

        const names = {
          'AWS-JPR-04': 'AWS-JPR-04 (Jaipur Semi-Arid Grid)',
          'AWS-DEL-07': 'AWS-DEL-07 (Delhi Urban Heat Corridor)',
          'AWS-CHE-12': 'AWS-CHE-12 (Chennai Coastal Marine Mesh)'
        };

        const activeNameEl = document.getElementById('cmd-active-station-name');
        const alertTagEl = document.getElementById('cmd-chart-alert-tag');

        if (activeNameEl) {
          activeNameEl.textContent = names[stId] || stId;
        }

        if (alertTagEl) {
          if (stId === 'AWS-JPR-04') {
            alertTagEl.style.display = 'inline';
            alertTagEl.textContent = '• 1 Anomaly Flagged at 14:32:15';
            alertTagEl.style.color = 'var(--status-critical)';
          } else if (stId === 'AWS-DEL-07') {
            alertTagEl.style.display = 'inline';
            alertTagEl.textContent = '• Attention: Voltage Droop at 12:15';
            alertTagEl.style.color = 'var(--status-attention)';
          } else {
            alertTagEl.style.display = 'inline';
            alertTagEl.textContent = '• Nominal Spatial Consensus';
            alertTagEl.style.color = 'var(--status-trusted)';
          }
        }
      });
    });
  }

  bindActions() {
    document.addEventListener('click', (e) => {
      const applyBtn = e.target.closest('.btn-apply-baseline');
      if (applyBtn) {
        const itemId = applyBtn.dataset.id;
        const item = this.queueItems.find((q) => q.id === itemId);
        if (item) {
          item.triaged = true;
          item.type = 'IMPUTATION ACTIVE';
          item.desc = 'Raw 55.2°C isolated from NWP stream. Synthetic 25.4°C baseline applied.';
          this.renderQueue();

          const trustScoreEl = document.getElementById('cmd-trust-score');
          const trustBarEl = document.getElementById('cmd-trust-bar');
          const statAttention = document.getElementById('stat-attention-required');
          const statTrusted = document.getElementById('stat-trusted-pct');

          if (trustScoreEl) trustScoreEl.innerHTML = '96.4 <span>/ 100</span>';
          if (trustBarEl) trustBarEl.style.width = '96.4%';
          if (statAttention) statAttention.textContent = '01';
          if (statTrusted) statTrusted.textContent = '88.9%';
        }
      }

      const qBtn = e.target.closest('.btn-quarantine');
      if (qBtn) {
        const itemId = qBtn.dataset.id;
        const item = this.queueItems.find((q) => q.id === itemId);
        if (item) {
          item.triaged = true;
          item.type = 'CHANNEL QUARANTINED';
          item.desc = 'Channel silenced. Maintenance ticket dispatched for field replacement.';
          this.renderQueue();
        }
      }
    });
  }
}

window.CommandCenterControllerInstance = null;

window.initCommandCenter = function () {
  if (!window.CommandCenterControllerInstance) {
    window.CommandCenterControllerInstance = new CommandCenterController();
  } else {
    // Force re-render in case DOM element was not ready initially
    window.CommandCenterControllerInstance.renderQueue();
  }
  return window.CommandCenterControllerInstance;
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.initCommandCenter());
} else {
  window.initCommandCenter();
}
