/**
 * SkyGuard AI — Command Center Controller
 * Manages Network Trust Score, compact operational metrics, and the actionable AI Attention Queue.
 */

class CommandCenterController {
  constructor() {
    this.trustScoreEl = document.getElementById('cmd-trust-score');
    this.trustBarEl = document.getElementById('cmd-trust-bar');
    this.queueContainer = document.getElementById('cmd-attention-queue-list');

    this.queueItems = [
      {
        id: 'Q-01',
        severity: 'Critical',
        classKey: 'crit',
        title: 'Temperature Spike (55.2°C)',
        stationId: 'AWS-JPR-04',
        confidence: 98,
        actionLabel: 'Investigate Incident →',
        meta: 'West Grid • 14:32:18'
      },
      {
        id: 'Q-02',
        severity: 'Warning',
        classKey: 'warn',
        title: 'Humidity Positive Drift (+18%)',
        stationId: 'AWS-DEL-07',
        confidence: 88,
        actionLabel: 'Review Drift Trend →',
        meta: 'North Grid • Health: 74%'
      },
      {
        id: 'Q-03',
        severity: 'Communication',
        classKey: 'comm',
        title: 'Intermittent Frame Loss',
        stationId: 'AWS-MUM-02',
        confidence: 76,
        actionLabel: 'Check Modem Telemetry →',
        meta: 'Coastal Grid • Last Ping: 4m ago'
      }
    ];

    this.init();
  }

  init() {
    this.renderQueue();

    // Subscribe to stream updates
    if (window.OperationalStreamEngineInstance) {
      window.OperationalStreamEngineInstance.subscribe((data) => {
        this.onStreamTick(data);
      });
    }
  }

  onStreamTick(data) {
    const analysis = data.analysis;

    // Update Network Trust
    if (this.trustScoreEl) {
      this.trustScoreEl.innerHTML = `${analysis.dataTrustScore} <span>/ 100</span>`;
    }
    if (this.trustBarEl) {
      this.trustBarEl.style.width = `${analysis.dataTrustScore}%`;
      this.trustBarEl.style.backgroundColor = analysis.dataTrustScore > 80 ? '#2E9B73' : analysis.dataTrustScore > 50 ? '#C98A1C' : '#C94F4F';
    }

    // Update unified comparative chart
    if (window.UnifiedComparativeChartInstance) {
      window.UnifiedComparativeChartInstance.updateData(data.buffer);
    }
  }

  renderQueue() {
    if (!this.queueContainer) return;

    this.queueContainer.innerHTML = this.queueItems.map(item => `
      <div class="queue-item-card ${item.classKey}">
        <div class="queue-item-top">
          <span class="trust-badge ${item.classKey === 'crit' ? 'badge-critical' : item.classKey === 'warn' ? 'badge-attention' : ''}" style="${item.classKey === 'comm' ? 'background:#EFF6FF; color:#1D4ED8; border:1px solid #BFDBFE' : ''}">
            ${item.severity}
          </span>
          <span style="font-family:var(--font-mono); font-size:0.75rem; font-weight:700">${item.stationId}</span>
        </div>
        <div class="queue-item-title">${item.title}</div>
        <div class="queue-item-meta">
          <span>${item.meta}</span>
          <span>•</span>
          <span>Conf: <strong>${item.confidence}%</strong></span>
        </div>
        <a class="queue-action-link" onclick="window.AppRouter.switchView('investigate', '${item.stationId}')">
          ${item.actionLabel}
        </a>
      </div>
    `).join('');
  }
}

window.CommandCenterControllerInstance = null;
window.initCommandCenter = function() {
  if (!window.CommandCenterControllerInstance) {
    window.CommandCenterControllerInstance = new CommandCenterController();
  }
};
