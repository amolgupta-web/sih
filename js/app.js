/**
 * SkyGuard AI — Master Application Orchestrator & Router (PS 73)
 * Controls top navigation views, deep-linking, cross-module dispatches,
 * and component lifecycle management without custom cursor dependencies.
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
      tab.addEventListener('click', (e) => {
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
        this.switchView(hash, false);
      }
    });
  }

  handleInitialRoute() {
    const hash = window.location.hash.replace('#', '');
    if (hash && document.getElementById(`view-${hash}`)) {
      this.switchView(hash, false);
    } else {
      this.switchView('command-center', false);
    }
  }

  switchView(viewName, updateHash = true) {
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

    // Update View Sections
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

    // Trigger canvas resize recalculation if entering Command Center
    if (viewName === 'command-center' && window.UnifiedComparativeChartInstance) {
      setTimeout(() => {
        window.UnifiedComparativeChartInstance.resizeCanvas();
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

  // 3. Initialize Comparative Chart Renderer
  if (typeof window.initUnifiedChart === 'function') {
    window.initUnifiedChart();
  }

  // 4. Initialize Core Domain Controllers
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
