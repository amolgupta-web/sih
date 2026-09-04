/**
 * SkyGuard AI — Master Application Coordinator & View Router
 * Coordinates the 6 operational B2B workflows, simulation triggers, and scientific cursor.
 */

class ApplicationRouter {
  constructor() {
    this.tabs = document.querySelectorAll('.nav-tab-btn');
    this.views = document.querySelectorAll('.view-section');
    this.currentView = 'command-center';

    this.init();
  }

  init() {
    // Bind Tab Click
    this.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const viewKey = tab.dataset.view;
        if (viewKey) {
          this.switchView(viewKey);
        }
      });
    });

    // Check URL hash on load
    const hash = window.location.hash.replace('#', '');
    if (hash && document.getElementById(`view-${hash}`)) {
      this.switchView(hash);
    } else {
      this.switchView('command-center');
    }

    // Listen to hash changes
    window.addEventListener('hashchange', () => {
      const h = window.location.hash.replace('#', '');
      if (h && document.getElementById(`view-${h}`)) {
        this.switchView(h, null, false);
      }
    });

    // Bind Simulation Buttons ("Test the AI")
    this.bindSimulations();

    // Bind Cursor Toggle
    this.bindCursorToggle();
  }

  switchView(viewKey, stationId = null, updateHash = true) {
    this.currentView = viewKey;

    // Update Nav Tabs
    this.tabs.forEach(t => {
      if (t.dataset.view === viewKey) t.classList.add('active');
      else t.classList.remove('active');
    });

    // Update Views
    this.views.forEach(v => {
      if (v.id === `view-${viewKey}`) {
        v.classList.add('active-view');
      } else {
        v.classList.remove('active-view');
      }
    });

    if (updateHash) {
      window.location.hash = viewKey;
    }

    // Window scroll to top of workspace
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Handle station parameter if passed
    if (stationId && window.OperationalStreamEngineInstance) {
      window.OperationalStreamEngineInstance.setStation(stationId);
    }

    // If switching to Command Center, trigger chart redraw
    if (viewKey === 'command-center' && window.UnifiedComparativeChartInstance) {
      setTimeout(() => {
        window.UnifiedComparativeChartInstance.resize();
      }, 50);
    }
  }

  bindSimulations() {
    const simNormal = document.getElementById('sim-btn-normal');
    const simStorm = document.getElementById('sim-btn-storm');
    const simFailure = document.getElementById('sim-btn-failure');

    const setSimActive = (btn) => {
      [simNormal, simStorm, simFailure].forEach(b => {
        if (b) b.classList.remove('active-sim');
      });
      if (btn) btn.classList.add('active-sim');
    };

    if (simNormal) {
      simNormal.addEventListener('click', () => {
        setSimActive(simNormal);
        if (window.OperationalStreamEngineInstance) {
          window.OperationalStreamEngineInstance.setScenario('normal');
        }
      });
    }

    if (simStorm) {
      simStorm.addEventListener('click', () => {
        setSimActive(simStorm);
        if (window.OperationalStreamEngineInstance) {
          window.OperationalStreamEngineInstance.setScenario('storm');
        }
      });
    }

    if (simFailure) {
      simFailure.addEventListener('click', () => {
        setSimActive(simFailure);
        if (window.OperationalStreamEngineInstance) {
          window.OperationalStreamEngineInstance.setScenario('failure');
        }
      });
    }
  }

  bindCursorToggle() {
    const toggleBtn = document.getElementById('btn-toggle-cursor-mode');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        if (window.ScientificCursorInstance) {
          const isEnabled = window.ScientificCursorInstance.toggle();
          toggleBtn.innerText = isEnabled ? 'Custom Cursor: On' : 'Custom Cursor: Off';
          toggleBtn.style.color = isEnabled ? 'var(--brand-teal)' : 'var(--text-secondary)';
        }
      });
    }
  }
}

// Bootstrap Subsystems
document.addEventListener('DOMContentLoaded', () => {
  // 1. Cursor
  if (window.initScientificCursor) window.initScientificCursor();

  // 2. Chart
  if (window.initUnifiedChart) window.initUnifiedChart();

  // 3. Controllers
  if (window.initCommandCenter) window.initCommandCenter();
  if (window.initLiveNetwork) window.initLiveNetwork();
  if (window.initInvestigation) window.initInvestigation();
  if (window.initSensorHealthAnalytics) window.initSensorHealthAnalytics();
  if (window.initMaintenance) window.initMaintenance();
  if (window.initDataTrustLog) window.initDataTrustLog();

  // 4. Master Router
  window.AppRouter = new ApplicationRouter();

  console.log('✅ SkyGuard AI — Weather Data Trust Intelligence Platform initialized.');
});
