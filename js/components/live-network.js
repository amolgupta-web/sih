/**
 * SkyGuard AI — Live Network Controller
 * Renders the regional mesonet station directory table and interactive spatial topology SVG map.
 * Focused on core triad stations: Jaipur (Semi-Arid), Delhi (Urban Heat Corridor), Chennai (Coastal Marine Mesh).
 */

class LiveNetworkController {
  constructor() {
    this.tableBody = document.getElementById('network-directory-tbody');
    this.mapSvg = document.getElementById('network-map-svg');

    // Focused Station Network Triad
    this.stations = [
      {
        id: 'AWS-JPR-04',
        name: 'Jaipur',
        subtext: 'Jaipur (Semi-Arid)',
        temp: '55.2°C',
        humidity: '44%',
        pressure: '1008 hPa',
        trust: 12,
        status: 'Critical',
        statusClass: 'status-critical',
        mapX: 180,
        mapY: 170
      },
      {
        id: 'AWS-DEL-07',
        name: 'New Delhi',
        subtext: 'New Delhi (Central)',
        temp: '28.4°C',
        humidity: '58%',
        pressure: '1012 hPa',
        trust: 74,
        status: 'Attention',
        statusClass: 'status-attention',
        mapX: 230,
        mapY: 100
      },
      {
        id: 'AWS-CHE-12',
        name: 'Chennai',
        subtext: 'Chennai (Coastal Marine Mesh)',
        temp: '31.8°C',
        humidity: '78%',
        pressure: '1011 hPa',
        trust: 94,
        status: 'Healthy',
        statusClass: 'status-trusted',
        mapX: 250,
        mapY: 290
      }
    ];

    this.init();
  }

  init() {
    this.renderDirectoryTable();
    this.renderTopologyMap();
    this.bindEvents();
  }

  renderDirectoryTable() {
    if (!this.tableBody) return;

    this.tableBody.innerHTML = this.stations
      .map((st) => {
        const isCritical = st.status === 'Critical';
        const isAttention = st.status === 'Attention';

        const trustBadgeClass = isCritical
          ? 'badge-critical'
          : isAttention
          ? 'badge-attention'
          : 'badge-trusted';

        const trustColor = isCritical
          ? 'var(--status-critical, #C94F4F)'
          : isAttention
          ? 'var(--status-attention, #C98A1C)'
          : 'var(--status-trusted, #2E9B73)';

        const tempColor = isCritical ? 'color: var(--status-critical, #C94F4F); font-weight:700;' : '';

        return `
          <tr data-station-id="${st.id}">
            <td>
              <div style="font-weight:700; color:var(--text-primary);">${st.id}</div>
              <div style="font-size:0.75rem; color:var(--text-secondary);">${st.subtext}</div>
            </td>
            <td style="${tempColor}">${st.temp}</td>
            <td>${st.humidity}</td>
            <td>${st.pressure}</td>
            <td>
              <span class="trust-badge ${trustBadgeClass}" style="border-radius:4px; padding:3px 8px; font-weight:700; font-size:0.74rem;">
                ${st.trust} / 100
              </span>
            </td>
            <td>
              <span style="display:inline-flex; align-items:center; gap:5px; color:${trustColor}; font-weight:600; font-size:0.78rem;">
                ● ${st.status}
              </span>
            </td>
            <td>
              <button class="btn-control btn-xs btn-inspect-station" data-station-id="${st.id}" style="cursor:pointer; padding:4px 8px; font-size:0.75rem;">
                Investigate →
              </button>
            </td>
          </tr>
        `;
      })
      .join('');
  }

  renderTopologyMap() {
    if (!this.mapSvg) return;

    // SVG Stage: Background grid and connection vector mesh between Jaipur, Delhi, and Chennai
    let svgContent = `
      <!-- Background Mesh Lines -->
      <defs>
        <pattern id="mapGrid" width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(226, 232, 240, 0.6)" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#mapGrid)" />

      <!-- Spatial Inter-station Connection Links -->
      <line x1="230" y1="100" x2="180" y2="170" stroke="#CBD5E1" stroke-width="1.8" stroke-dasharray="4,4" />
      <line x1="180" y1="170" x2="250" y2="290" stroke="#CBD5E1" stroke-width="1.8" stroke-dasharray="4,4" />
      <line x1="230" y1="100" x2="250" y2="290" stroke="#CBD5E1" stroke-width="1.2" stroke-dasharray="2,2" opacity="0.6" />
    `;

    // Draw station beacons
    this.stations.forEach((st) => {
      const isCritical = st.status === 'Critical';
      const isAttention = st.status === 'Attention';

      const dotColor = isCritical ? '#C94F4F' : isAttention ? '#C98A1C' : '#2E9B73';
      const haloColor = isCritical
        ? 'rgba(201, 79, 79, 0.22)'
        : isAttention
        ? 'rgba(201, 138, 28, 0.22)'
        : 'rgba(46, 155, 115, 0.22)';

      svgContent += `
        <g class="map-node" data-station-id="${st.id}" style="cursor:pointer;">
          <circle cx="${st.mapX}" cy="${st.mapY}" r="14" fill="${haloColor}">
            ${isCritical ? '<animate attributeName="r" values="12;18;12" dur="2s" repeatCount="indefinite"/>' : ''}
          </circle>
          <circle cx="${st.mapX}" cy="${st.mapY}" r="6" fill="${dotColor}" stroke="#ffffff" stroke-width="2"/>
          <text x="${st.mapX + 16}" y="${st.mapY - 2}" font-size="11" font-weight="700" fill="#1E293B">${st.id}</text>
          <text x="${st.mapX + 16}" y="${st.mapY + 11}" font-size="9.5" fill="#64748B">${st.name} • Trust: ${st.trust}%</text>
        </g>
      `;
    });

    this.mapSvg.innerHTML = svgContent;
  }

  bindEvents() {
    // Row/button click to trigger investigation or switch view
    document.addEventListener('click', (e) => {
      const inspectBtn = e.target.closest('.btn-inspect-station');
      if (inspectBtn) {
        const stationId = inspectBtn.dataset.stationId;
        if (window.AppRouter) {
          window.AppRouter.switchView('investigate');
        }
        return;
      }

      const mapNode = e.target.closest('.map-node');
      if (mapNode) {
        const stationId = mapNode.dataset.stationId;
        if (window.OperationalStreamEngineInstance) {
          window.OperationalStreamEngineInstance.setStation(stationId);
        }
        if (window.AppRouter) {
          window.AppRouter.switchView('command-center');
        }
      }
    });
  }
}

// Global Singleton Setup
window.LiveNetworkControllerInstance = null;

window.initLiveNetwork = function () {
  if (!window.LiveNetworkControllerInstance) {
    window.LiveNetworkControllerInstance = new LiveNetworkController();
  }
  return window.LiveNetworkControllerInstance;
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.initLiveNetwork());
} else {
  window.initLiveNetwork();
}
