/**
 * SkyGuard AI — Operational Telemetry Stream Engine
 * Simulates real-time telemetry generation with organic diurnal variance,
 * micro-fluctuations, and station-specific anomaly characteristics.
 */

class OperationalStreamEngine {
  constructor() {
    this.activeStation = 'AWS-JPR-04';
    this.buffers = {
      'AWS-JPR-04': this.generateInitialBuffer('AWS-JPR-04'),
      'AWS-DEL-07': this.generateInitialBuffer('AWS-DEL-07'),
      'AWS-CHE-12': this.generateInitialBuffer('AWS-CHE-12')
    };

    // Start background live pulse stream
    this.startLiveStream();
  }

  generateInitialBuffer(stationId) {
    const data = [];
    const count = 20;
    const now = Date.now();

    for (let i = count - 1; i >= 0; i--) {
      const time = new Date(now - i * 4000);
      const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      let temp = 25.0;
      let hum = 44.0;
      let press = 1008.0;
      let isAnomaly = false;

      // Organic wave variations using sine math
      const wave = Math.sin(i * 0.4) * 0.6;

      if (stationId === 'AWS-JPR-04') {
        temp = 25.2 + wave + (i === 0 ? 30.0 : 0); // Active spike at the live edge
        hum = 43.5 - wave;
        press = 1008.2 + (wave * 0.2);
        isAnomaly = i === 0;
      } else if (stationId === 'AWS-DEL-07') {
        temp = 28.4 + (wave * 0.8);
        hum = 58.0 + (wave * 1.5);
        press = 1012.1 + (wave * 0.3);
      } else if (stationId === 'AWS-CHE-12') {
        temp = 31.8 + (wave * 0.5);
        hum = 78.0 + (wave * 0.8);
        press = 1011.2 + (wave * 0.1);
      }

      data.push({
        timeStr,
        temperature: parseFloat(temp.toFixed(2)),
        humidity: parseFloat(hum.toFixed(1)),
        pressure: parseFloat(press.toFixed(1)),
        isAnomaly
      });
    }

    return data;
  }

  setStation(stationId) {
    if (this.buffers[stationId]) {
      this.activeStation = stationId;
      if (window.UnifiedComparativeChartInstance) {
        window.UnifiedComparativeChartInstance.render();
      }
    }
  }

  getBuffer(stationId) {
    return this.buffers[stationId] || this.buffers['AWS-JPR-04'];
  }

  startLiveStream() {
    setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      // Push subtle live variance to all station buffers
      Object.keys(this.buffers).forEach((stId) => {
        const buf = this.buffers[stId];
        const last = buf[buf.length - 1] || { temperature: 25, humidity: 50, pressure: 1010 };
        
        // Random micro-jitter (-0.2 to +0.2)
        const jitter = (Math.random() - 0.5) * 0.4;

        let newTemp = last.temperature;
        if (stId === 'AWS-JPR-04') {
          // Keep Jaipur pinned at the anomaly state or mild jitter around baseline if triaged
          newTemp = 55.2 + (Math.random() - 0.5) * 0.3;
        } else if (stId === 'AWS-DEL-07') {
          newTemp = 28.4 + jitter;
        } else {
          newTemp = 31.8 + jitter;
        }

        buf.push({
          timeStr,
          temperature: parseFloat(newTemp.toFixed(2)),
          humidity: parseFloat((last.humidity + jitter * 0.5).toFixed(1)),
          pressure: parseFloat((last.pressure + jitter * 0.1).toFixed(1)),
          isAnomaly: stId === 'AWS-JPR-04'
        });

        if (buf.length > 25) {
          buf.shift();
        }
      });

      // Redraw active chart if on command center
      if (window.AppRouter && window.AppRouter.currentView === 'command-center') {
        if (window.UnifiedComparativeChartInstance) {
          window.UnifiedComparativeChartInstance.render();
        }
      }
    }, 3500); // Pulse every 3.5 seconds
  }
}

// Global Singleton Setup
window.OperationalStreamEngineInstance = null;

window.initStreamEngine = function () {
  if (!window.OperationalStreamEngineInstance) {
    window.OperationalStreamEngineInstance = new OperationalStreamEngine();
  }
  return window.OperationalStreamEngineInstance;
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.initStreamEngine());
} else {
  window.initStreamEngine();
}
