/**
 * SkyGuard AI — Master Application Orchestrator & Router (PS 73)
 * Controls top navigation views, deep-linking, cross-module dispatches,
 * and synchronized city selection across Investigate and Sensor Health.
 */

class AppRouter {
  constructor() {
    this.navTabs = document.querySelectorAll('.header-nav-strip .nav-tab-btn');
    this.viewSections = document.querySelectorAll('.view-wrapper .view-section');
    this.currentView = 'command-center';

    this.init();
  }

  init() {
    this.bindNavigation();
    this.bindHashChange();
    this.handleInitialRoute();
  }

  bindNavigation() {
    this.navTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const targetView = tab.dataset.view;
        if (targetView) {
          this.switchView(targetView);
        }
      });
    });
  }

  bindHashChange() {
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && document.getElementById(`view-${hash}`)) {
        this.switchView(hash, null, false);
      }
    });
  }

  handleInitialRoute() {
    const hash = window.location.hash.replace('#', '');
    if (hash && document.getElementById(`view-${hash}`)) {
      this.switchView(hash, null, false);
    } else {
      this.switchView('command-center', null, false);
    }
  }

  /**
   * Switches views and optionally activates a target focal station.
   * @param {string} viewName View ID to display (e.g. 'command-center', 'investigate', 'sensor-health')
   * @param {string|null} stationId Focal station ID ('AWS-JPR-04', 'AWS-DEL-07', 'AWS-CHE-12')
   * @param {boolean} updateHash Whether to sync browser URL hash
   */
  switchView(viewName, stationId = null, updateHash = true) {
    const targetSection = document.getElementById(`view-${viewName}`);
    if (!targetSection) return;

    this.currentView = viewName;

    // Update Nav Buttons
    this.navTabs.forEach((tab) => {
      if (tab.dataset.view === viewName) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    // Update Section Visibility
    this.viewSections.forEach((sec) => {
      if (sec.id === `view-${viewName}`) {
        sec.classList.add('active-view');
        sec.style.display = 'block';
      } else {
        sec.classList.remove('active-view');
        sec.style.display = 'none';
      }
    });

    if (updateHash) {
      window.location.hash = viewName;
    }

    // Pass station selection down to relevant controller
    if (stationId) {
      if (viewName === 'investigate' && window.InvestigateControllerInstance) {
        window.InvestigateControllerInstance.setStation(stationId);
      } else if (viewName === 'sensor-health' && window.SensorHealthControllerInstance) {
        window.SensorHealthControllerInstance.setStation(stationId);
      } else if (viewName === 'command-center' && window.OperationalStreamEngineInstance) {
        window.OperationalStreamEngineInstance.setStation(stationId);
      }
    }

    // Canvas resize trigger for active views
    if (viewName === 'command-center' && window.UnifiedComparativeChartInstance) {
      setTimeout(() => {
        window.UnifiedComparativeChartInstance.resizeCanvas();
      }, 50);
    } else if (viewName === 'investigate' && window.InvestigateControllerInstance) {
      setTimeout(() => {
        const activeSt = stationId || window.InvestigateControllerInstance.activeStation;
        window.InvestigateControllerInstance.drawForensicChart(activeSt);
      }, 50);
    }
  }
}

// Global Application Initialization Pipeline
document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Single-Page Router
  window.AppRouter = new AppRouter();

  // 2. Initialize Telemetry Stream Engine
  if (typeof window.initStreamEngine === 'function') {
    window.initStreamEngine();
  }

  // 3. Initialize Unified Canvas Chart Renderer
  if (typeof window.initUnifiedChart === 'function') {
    window.initUnifiedChart();
  }

  // 4. Initialize Domain Controllers
  if (typeof window.initCommandCenter === 'function') {
    window.initCommandCenter();
  }
  if (typeof window.initLiveNetwork === 'function') {
    window.initLiveNetwork();
  }
  if (typeof window.initInvestigate === 'function') {
    window.initInvestigate();
  }
  if (typeof window.initSensorHealth === 'function') {
    window.initSensorHealth();
  }
  if (typeof window.initMaintenance === 'function') {
    window.initMaintenance();
  }
  if (typeof window.initDataTrustLog === 'function') {
    window.initDataTrustLog();
  }
});
