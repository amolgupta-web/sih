/**
 * SkyGuard AI — Data Trust Audit Log Controller
 * Provides an immutable, traceable log of all sensor readings, trust scores, and AI decisions.
 */

class DataTrustLogController {
  constructor() {
    this.tableBody = document.getElementById('trust-log-tbody');
    this.searchInput = document.getElementById('trust-log-search');
    this.exportBtn = document.getElementById('btn-export-log-csv');

    this.logEntries = [
      {
        time: '14:32:18',
        station: 'AWS-JPR-04',
        param: 'Temperature',
        raw: '55.2°C',
        imputed: '25.4°C',
        trust: 12,
        decision: 'Sensor Spike Flagged',
        conf: 98,
        action: 'Inspection Required'
      },
      {
        time: '14:28:44',
        station: 'AWS-DEL-07',
        param: 'Relative Humidity',
        raw: '76.4%',
        imputed: '62.1%',
        trust: 74,
        decision: 'Gradual Drift Detected',
        conf: 91,
        action: 'Schedule Calibration'
      },
      {
        time: '14:15:10',
        station: 'AWS-MUM-02',
        param: 'Pressure',
        raw: '1010.8 hPa',
        imputed: '—',
        trust: 98,
        decision: 'Trusted Meteorological Data',
        conf: 97,
        action: 'None (Nominal)'
      },
      {
        time: '14:02:55',
        station: 'AWS-BLR-02',
        param: 'Temperature',
        raw: '21.6°C',
        imputed: '—',
        trust: 99,
        decision: 'Trusted Meteorological Data',
        conf: 99,
        action: 'None (Nominal)'
      },
      {
        time: '13:58:30',
        station: 'AWS-HIM-09',
        param: 'Pressure',
        raw: '994.0 hPa',
        imputed: '—',
        trust: 97,
        decision: 'Trusted Meteorological Data',
        conf: 98,
        action: 'None (Nominal)'
      }
    ];

    this.init();
  }

  init() {
    this.render(this.logEntries);

    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase();
        const filtered = this.logEntries.filter(r => 
          r.station.toLowerCase().includes(q) || 
          r.param.toLowerCase().includes(q) || 
          r.decision.toLowerCase().includes(q)
        );
        this.render(filtered);
      });
    }

    if (this.exportBtn) {
      this.exportBtn.addEventListener('click', () => {
        this.exportCSV();
      });
    }
  }

  render(entries) {
    if (!this.tableBody) return;

    this.tableBody.innerHTML = entries.map(row => {
      const badgeClass = row.trust < 50 ? 'badge-critical' : row.trust < 80 ? 'badge-attention' : 'badge-trusted';
      return `
        <tr>
          <td style="font-family:var(--font-mono); font-size:0.75rem">${row.time}</td>
          <td><strong style="font-family:var(--font-mono)">${row.station}</strong></td>
          <td>${row.param}</td>
          <td>
            <strong style="color:${row.trust < 50 ? 'var(--status-critical)' : 'inherit'}">${row.raw}</strong>
          </td>
          <td>
            <span style="color:${row.imputed !== '—' ? 'var(--status-trusted)' : 'var(--text-tertiary)'}; font-weight:600">
              ${row.imputed}
            </span>
          </td>
          <td>
            <span class="trust-badge ${badgeClass}">${row.trust} / 100</span>
          </td>
          <td>${row.decision}</td>
          <td><strong>${row.conf}%</strong></td>
          <td>
            <span style="font-size:0.75rem; color:${row.action.includes('Required') ? 'var(--status-critical)' : 'var(--text-secondary)'}; font-weight:600">
              ${row.action}
            </span>
          </td>
        </tr>
      `;
    }).join('');
  }

  exportCSV() {
    let csv = 'Timestamp,Station,Parameter,RawReading,ImputedReading,DataTrustScore,AIDecision,Confidence,Action\n';
    this.logEntries.forEach(r => {
      csv += `"${r.time}","${r.station}","${r.param}","${r.raw}","${r.imputed}","${r.trust}","${r.decision}","${r.conf}%","${r.action}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SkyGuard_DataTrustLog_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

window.DataTrustLogControllerInstance = null;
window.initDataTrustLog = function() {
  if (!window.DataTrustLogControllerInstance) {
    window.DataTrustLogControllerInstance = new DataTrustLogController();
  }
};
