/**
 * SkyGuard AI — Prioritized Operational Maintenance Queue
 * Translates AI anomaly verdicts into actionable P1/P2/P3 field engineering work orders.
 */

class MaintenanceController {
  constructor() {
    this.tableBody = document.getElementById('maintenance-tbody');

    this.workOrders = [
      {
        id: 'WO-801',
        priority: 'P1',
        pClass: 'p1',
        station: 'AWS-JPR-04',
        sensor: 'Temperature (PT100)',
        issue: 'Critical Sensor Spike (55.2°C)',
        confidence: 98,
        action: 'Inspect wiring & replace ADC module',
        urgency: 'Immediate (Today)',
        status: 'Action Required'
      },
      {
        id: 'WO-802',
        priority: 'P2',
        pClass: 'p2',
        station: 'AWS-DEL-07',
        sensor: 'Humidity (Capacitive)',
        issue: 'Gradual Calibration Drift (+18%)',
        confidence: 91,
        action: 'Perform salt chamber calibration',
        urgency: 'Within 7 Days',
        status: 'Scheduled'
      },
      {
        id: 'WO-803',
        priority: 'P3',
        pClass: 'p3',
        station: 'AWS-MUM-02',
        sensor: 'Pressure (Barometer)',
        issue: 'Acoustic / High-Frequency Noise',
        confidence: 72,
        action: 'Inspect inlet port for debris',
        urgency: 'Next Cycle (14d)',
        status: 'Monitoring'
      }
    ];

    this.init();
  }

  init() {
    this.render();
  }

  render() {
    if (!this.tableBody) return;

    this.tableBody.innerHTML = this.workOrders.map(wo => `
      <tr>
        <td>
          <span class="priority-badge ${wo.pClass}">${wo.priority}</span>
        </td>
        <td>
          <strong style="font-family:var(--font-mono)">${wo.station}</strong>
        </td>
        <td>${wo.sensor}</td>
        <td>
          <span style="font-weight:600; color:${wo.priority === 'P1' ? 'var(--status-critical)' : 'var(--text-primary)'}">
            ${wo.issue}
          </span>
        </td>
        <td>
          <strong>${wo.confidence}%</strong>
        </td>
        <td>${wo.action}</td>
        <td>
          <span style="font-size:0.75rem; font-weight:700; color:${wo.priority === 'P1' ? 'var(--status-critical)' : 'var(--text-secondary)'}">
            ${wo.urgency}
          </span>
        </td>
        <td>
          <button class="btn-control btn-brand" onclick="window.MaintenanceControllerInstance.dispatchWorkOrder('${wo.id}')" style="font-size:0.72rem; padding:4px 8px">
            Dispatch Team
          </button>
        </td>
      </tr>
    `).join('');
  }

  dispatchWorkOrder(id) {
    const item = this.workOrders.find(w => w.id === id);
    if (item) {
      item.status = 'Dispatched';
      alert(`Work Order ${id} (${item.station}): Field maintenance team notified for ${item.action}.`);
      this.render();
    }
  }
}

window.MaintenanceControllerInstance = null;
window.initMaintenance = function() {
  if (!window.MaintenanceControllerInstance) {
    window.MaintenanceControllerInstance = new MaintenanceController();
  }
};
