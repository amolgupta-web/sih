/**
 * SkyGuard AI — Data Trust Audit & Traceability Log Controller
 * Maintains an immutable log of sensor observations, trust scores, and ML classifications,
 * featuring real-time search filtering and CSV export.
 */

class DataTrustLogController {
  constructor() {
    this.tbody = document.getElementById('trust-log-tbody');
    this.searchInput = document.getElementById('trust-log-search');
    this.exportBtn = document.getElementById('btn-export-log-csv');

    this.logs = [
      {
        time: '14:32:18',
        date: '2026-09-08',
        stationId: 'AWS-JPR-04',
        parameter: 'Temperature (°C)',
        rawReading: '55.2°C',
        imputed: '25.4°C',
        trustScore: '12 / 100',
        trustClass: 'badge-critical',
        decision: 'PROBABLE SENSOR ANOMALY',
        confidence: '98.4%',
        action: 'Quarantined for Audit'
      },
      {
        time: '14:30:00',
        date: '2026-09-08',
        stationId: 'AWS-DEL-07',
        parameter: 'Relative Humidity (%)',
        rawReading: '76.0%',
        imputed: '58.0%',
        trustScore: '74 / 100',
        trustClass: 'badge-attention',
        decision: 'CALIBRATION DRIFT',
        confidence: '88.1%',
        action: 'Flagged for Calibration'
      },
      {
        time: '14:28:15',
        date: '2026-09-08',
        stationId: 'AWS-CHE-12',
        parameter: 'Barometric Pressure',
        rawReading: '1011.0 hPa',
        imputed: '1011.0 hPa',
        trustScore: '94 / 100',
        trustClass: 'badge-trusted',
        decision: 'TRUSTED STREAM',
        confidence: '99.2%',
        action: 'Passed to NWP Grid'
      },
      {
        time: '14:26:00',
        date: '2026-09-08',
        stationId: 'AWS-JPR-04',
        parameter: 'Relative Humidity (%)',
        rawReading: '44.0%',
        imputed: '44.0%',
        trustScore: '91 / 100',
        trustClass: 'badge-trusted',
        decision: 'TRUSTED STREAM',
        confidence: '97.5%',
        action: 'Passed to NWP Grid'
      },
      {
        time: '14:24:45',
        date: '2026-09-08',
        stationId: 'AWS-DEL-07',
        parameter: 'Transducer Voltage (V)',
        rawReading: '10.8 V',
        imputed: '12.6 V',
        trustScore: '68 / 100',
        trustClass: 'badge-attention',
        decision: 'POWER DROOP DETECTED',
        confidence: '91.0%',
        action: 'Logged for Maintenance'
      }
    ];

    this.filteredLogs = [...this.logs];
    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
  }

  render() {
    if (!this.tbody) return;

    if (this.filteredLogs.length === 0) {
      this.tbody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; color: var(--text-secondary); padding: 24px;">
            No verification audit records found matching your filter criteria.
          </td>
        </tr>
      `;
      return;
    }

    this.tbody.innerHTML = this.filteredLogs
      .map(
        (log) => `
      <tr>
        <td style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-secondary);">
          ${log.date} ${log.time}
        </td>
        <td>
          <strong style="color: var(--text-primary);">${log.stationId}</strong>
        </td>
        <td>${log.parameter}</td>
        <td style="font-weight: 700; color: ${
          log.rawReading.includes('55.2') ? 'var(--status-critical)' : 'var(--text-primary)'
        };">
          ${log.rawReading}
        </td>
        <td style="color: var(--brand-teal); font-weight: 600;">${log.imputed}</td>
        <td>
          <span class="trust-badge ${log.trustClass}" style="padding: 2px 7px; border-radius: 4px; font-weight: 700; font-size: 0.72rem;">
            ${log.trustScore}
          </span>
        </td>
        <td style="font-weight: 600; font-size: 0.78rem;">${log.decision}</td>
        <td style="color: var(--text-secondary);">${log.confidence}</td>
        <td>
          <span style="font-size: 0.75rem; color: var(--text-secondary); background: var(--bg-main); padding: 3px 8px; border-radius: 4px; border: 1px solid var(--border-light);">
            ${log.action}
          </span>
        </td>
      </tr>
    `
      )
      .join('');
  }

  bindEvents() {
    // Real-time search filter
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        this.filteredLogs = this.logs.filter(
          (log) =>
            log.stationId.toLowerCase().includes(query) ||
            log.parameter.toLowerCase().includes(query) ||
            log.decision.toLowerCase().includes(query) ||
            log.action.toLowerCase().includes(query)
        );
        this.render();
      });
    }

    // Export CSV functionality
    if (this.exportBtn) {
      this.exportBtn.addEventListener('click', () => this.exportToCSV());
    }
  }

  exportToCSV() {
    const headers = [
      'Timestamp',
      'Station ID',
      'Parameter',
      'Raw Reading',
      'AI Imputed',
      'Data Trust',
      'AI Decision',
      'Confidence',
      'Action Required'
    ];

    const rows = this.filteredLogs.map((log) => [
      `"${log.date} ${log.time}"`,
      `"${log.stationId}"`,
      `"${log.parameter}"`,
      `"${log.rawReading}"`,
      `"${log.imputed}"`,
      `"${log.trustScore}"`,
      `"${log.decision}"`,
      `"${log.confidence}"`,
      `"${log.action}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.setAttribute('href', url);
    link.setAttribute('download', `SkyGuard_Data_Trust_Audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Global Singleton Setup
window.DataTrustLogControllerInstance = null;

window.initDataTrustLog = function () {
  if (!window.DataTrustLogControllerInstance) {
    window.DataTrustLogControllerInstance = new DataTrustLogController();
  }
  return window.DataTrustLogControllerInstance;
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.initDataTrustLog());
} else {
  window.initDataTrustLog();
}
