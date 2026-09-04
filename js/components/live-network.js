/**
 * SkyGuard AI — Live Network Mesonet Directory & Geographic Context Map
 * Hybrid table/list view showing Data Trust Scores, current readings, and supporting spatial map.
 */

class LiveNetworkController {
  constructor() {
    this.tableBody = document.getElementById('network-directory-tbody');
    this.mapSvg = document.getElementById('network-map-svg');

    this.stations = [
      { id: 'AWS-JPR-04', name: 'Jaipur (Semi-Arid)', temp: '55.2°C', hum: '44%', press: '1008 hPa', trust: 12, status: 'Critical', issue: 'Sensor Spike Flagged', x: 260, y: 160 },
      { id: 'AWS-DEL-07', name: 'New Delhi (Central)', temp: '24.7°C', hum: '76%', press: '1012 hPa', trust: 74, status: 'Attention', issue: 'Positive Drift', x: 280, y: 120 },
      { id: 'AWS-MUM-02', name: 'Mumbai (Harbor)', temp: '29.2°C', hum: '84%', press: '1010 hPa', trust: 62, status: 'Attention', issue: 'Frame Loss', x: 210, y: 260 },
      { id: 'AWS-BLR-02', name: 'Bengaluru (Plateau)', temp: '21.6°C', hum: '58%', press: '1014 hPa', trust: 98, status: 'Healthy', issue: 'Nominal', x: 270, y: 320 },
      { id: 'AWS-HIM-09', name: 'Shimla (Alpine)', temp: '14.5°C', hum: '68%', press: '994 hPa', trust: 97, status: 'Healthy', issue: 'Nominal', x: 290, y: 70 }
    ];

    this.init();
  }

  init() {
    this.renderTable();
    this.renderMap();
  }

  renderTable() {
    if (!this.tableBody) return;

    this.tableBody.innerHTML = this.stations.map(st => {
      const badgeClass = st.status === 'Critical' ? 'badge-critical' : st.status === 'Attention' ? 'badge-attention' : 'badge-trusted';
      return `
        <tr>
          <td>
            <div class="table-station-cell">
              <span class="station-id">${st.id}</span>
              <span class="station-loc">${st.name}</span>
            </div>
          </td>
          <td><strong style="color:${st.temp.includes('55') ? 'var(--status-critical)' : 'inherit'}">${st.temp}</strong></td>
          <td>${st.hum}</td>
          <td>${st.press}</td>
          <td>
            <span class="trust-badge ${badgeClass}">${st.trust} / 100</span>
          </td>
          <td>
            <span style="font-size:0.75rem; font-weight:600; color:${st.status === 'Critical' ? 'var(--status-critical)' : st.status === 'Attention' ? 'var(--status-attention)' : 'var(--status-trusted)'}">
              ● ${st.status}
            </span>
          </td>
          <td>
            <a class="queue-action-link" onclick="window.AppRouter.switchView('investigate', '${st.id}')">
              Investigate →
            </a>
          </td>
        </tr>
      `;
    }).join('');
  }

  renderMap() {
    if (!this.mapSvg) return;

    const nodesSvg = this.stations.map(st => {
      const color = st.status === 'Critical' ? '#C94F4F' : st.status === 'Attention' ? '#C98A1C' : '#2E9B73';
      return `
        <g class="map-node" onclick="window.AppRouter.switchView('investigate', '${st.id}')" style="cursor:pointer">
          <circle cx="${st.x}" cy="${st.y}" r="16" fill="${color}" fill-opacity="0.15" />
          <circle cx="${st.x}" cy="${st.y}" r="6" fill="${color}" stroke="#FFFFFF" stroke-width="1.5" />
          <text x="${st.x + 12}" y="${st.y - 4}" font-family="Inter, sans-serif" font-size="10" font-weight="700" fill="#17201E">${st.id}</text>
          <text x="${st.x + 12}" y="${st.y + 8}" font-family="Inter, sans-serif" font-size="9" fill="#66716D">Trust: ${st.trust}%</text>
        </g>
      `;
    }).join('');

    this.mapSvg.innerHTML = `
      <defs>
        <pattern id="grid-pattern" width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#E2E8E5" stroke-width="0.8"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-pattern)" />
      <!-- Stylized Regional Grid Connections -->
      <path d="M 290 70 L 280 120 L 260 160 L 210 260 L 270 320" fill="none" stroke="#DCE7E5" stroke-width="1.5" stroke-dasharray="4,4" />
      ${nodesSvg}
    `;
  }
}

window.LiveNetworkControllerInstance = null;
window.initLiveNetwork = function() {
  if (!window.LiveNetworkControllerInstance) {
    window.LiveNetworkControllerInstance = new LiveNetworkController();
  }
};
