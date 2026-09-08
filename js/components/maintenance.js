/**
 * SkyGuard AI — Field Engineering & Maintenance Queue Controller
 * Prioritizes field dispatches, sensor replacements, and calibration work orders
 * across the primary station mesh.
 */

class MaintenanceController {
  constructor() {
    this.tbody = document.getElementById('maintenance-tbody');
    this.workOrders = [
      {
        id: 'WO-8801',
        priority: 'P1 - Critical',
        priorityClass: 'badge-critical',
        stationId: 'AWS-JPR-04',
        location: 'Jaipur (Semi-Arid)',
        sensor: 'PT100 RTD Thermistor',
        issue: 'Thermal Runaway Spike (+30°C in 15s, 55.2°C Registered)',
        confidence: '98.4%',
        action: 'Immediate field transducer inspection & ADC circuit replacement',
        urgency: '< 4 Hours',
        urgencyColor: 'var(--status-critical, #C94F4F)'
      },
      {
        id: 'WO-8802',
        priority: 'P2 - Elevated',
        priorityClass: 'badge-attention',
        stationId: 'AWS-DEL-07',
        location: 'New Delhi (Central)',
        sensor: 'PV Auxiliary Bus & RH Transducer',
        issue: 'Voltage Droop (10.8V) & Relative Humidity Calibration Drift (+18%)',
        confidence: '88.1%',
        action: 'Surface particulate soot cleaning & auxiliary battery swap',
        urgency: '< 24 Hours',
        urgencyColor: 'var(--status-attention, #C98A1C)'
      },
      {
        id: 'WO-8803',
        priority: 'P4 - Routine',
        priorityClass: 'badge-trusted',
        stationId: 'AWS-CHE-12',
        location: 'Chennai (Marine Mesh)',
        sensor: 'Piezoresistive Barometer',
        issue: 'Routine Salt-Spray Desiccant Inspection',
        confidence: '99.2%',
        action: 'Quarterly preventative maintenance & seal check',
        urgency: 'Scheduled (7 Days)',
        urgencyColor: 'var(--text-secondary, #64748B)'
      }
    ];

    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
  }

  render() {
    if (!this.tbody) return;

    this.tbody.innerHTML = this.workOrders
      .map((wo) => `
        <tr data-order-id="${wo.id}">
          <td>
            <span class="trust-badge ${wo.priorityClass}" style="padding: 3px 8px; border-radius: 4px; font-weight: 700; font-size: 0.72rem;">
              ${wo.priority}
            </span>
          </td>
          <td>
            <div style="font-weight: 700; color: var(--text-primary);">${wo.stationId}</div>
            <div style="font-size: 0.75rem; color: var(--text-secondary);">${wo.location}</div>
          </td>
          <td style="font-weight: 600; color: var(--text-primary);">${wo.sensor}</td>
          <td style="font-size: 0.78rem; color: var(--text-secondary);">${wo.issue}</td>
          <td style="font-weight: 700; color: var(--brand-teal);">${wo.confidence}</td>
          <td style="font-size: 0.78rem; color: var(--text-primary); font-weight: 500;">${wo.action}</td>
          <td style="font-weight: 700; color: ${wo.urgencyColor}; font-size: 0.78rem;">${wo.urgency}</td>
          <td>
            <button class="btn-control btn-xs btn-dispatch-action" data-order-id="${wo.id}" style="padding: 4px 10px; font-size: 0.75rem; cursor: pointer;">
              Dispatch Order
            </button>
          </td>
        </tr>
      `)
      .join('');
  }

  bindEvents() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-dispatch-action');
      if (btn) {
        const orderId = btn.dataset.orderId;
        btn.textContent = 'Dispatched ✓';
        btn.style.background = 'var(--brand-teal, #2E9B73)';
        btn.style.color = '#ffffff';
        btn.style.borderColor = 'var(--brand-teal, #2E9B73)';
        btn.disabled = true;
      }
    });
  }
}

// Global Singleton Setup
window.MaintenanceControllerInstance = null;

window.initMaintenance = function () {
  if (!window.MaintenanceControllerInstance) {
    window.MaintenanceControllerInstance = new MaintenanceController();
  }
  return window.MaintenanceControllerInstance;
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.initMaintenance());
} else {
  window.initMaintenance();
}
