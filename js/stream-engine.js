/**
 * SkyGuard AI — Operational Real-Time Telemetry Stream Engine
 * Simulates high-frequency weather station sensor network telemetry,
 * rolling data buffers (30 pts), multi-station switching (Jaipur, Delhi, Chennai),
 * and dynamic scenario injection (Normal vs Failure).
 */

class OperationalStreamEngine {
  constructor() {
    this.subscribers = [];
    this.timer = null;
    this.intervalMs = 2500;
    this.activeScenario = 'failure'; // Default to failure for anomaly showcase
    this.activeStationId = 'AWS-JPR-04';

    // Station Network Registry
    this.stations = {
      'AWS-JPR-04': {
        id: 'AWS-JPR-04',
        name: 'Jaipur (Semi-Arid Grid)',
        region: 'Northwest Arid',
        baseTemp: 26.2,
        baseHum: 44.0,
        basePress: 1008.2,
        trust: 82
      },
      'AWS-DEL-07': {
        id: 'AWS-DEL-07',
        name: 'Delhi (Urban Heat Corridor)',
        region: 'NCR Urban Mesh',
        baseTemp: 29.5,
        baseHum: 58.0,
        basePress: 1005.4,
        trust: 89
      },
      'AWS-CHE-12': {
        id: 'AWS-CHE-12',
        name: 'Chennai (Coastal Marine Mesh)',
        region: 'Coromandel Coast',
        baseTemp: 31.8,
        baseHum: 78.5,
        basePress: 1011.0,
        trust: 94
      }
    };

    // Initialize 30-point rolling buffers per station
    this.stationBuffers = {};
    Object.keys(this.stations).forEach((stId) => {
      this.stationBuffers[stId] = this.createInitialBuffer(stId);
    });

    this.start();
  }

  createInitialBuffer(stationId) {
    const st = this.stations[stationId];
    const now = Date.now();
    const timestamps = [];
    const temp = [];
    const humidity = [];
    const pressure = [];
    const anomalies = [];

    for (let i = 29; i >= 0; i--) {
      const time = new Date(now - i * this.intervalMs);
      timestamps.push(time.toLocaleTimeString());

      const noiseT = (Math.random() - 0.5) * 0.4;
      const noiseH = (Math.random() - 0.5) * 0.8;
      const noiseP = (Math.random() - 0.5) * 0.2;

      // Inject anomaly jump on Jaipur in failure scenario
      if (stationId === 'AWS-JPR-04' && this.activeScenario === 'failure' && i <= 6) {
        temp.push(Number((54.5 + noiseT * 2).toFixed(1)));
        if (i === 6) anomalies.push(29 - i);
      } else {
        temp.push(Number((st.baseTemp + noiseT).toFixed(1)));
      }

      humidity.push(Number((st.baseHum + noiseH).toFixed(1)));
      pressure.push(Number((st.basePress + noiseP).toFixed(1)));
    }

    return { timestamps, temp, humidity, pressure, anomalies };
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter((cb) => cb !== callback);
    };
  }

  broadcast(payload) {
    this.subscribers.forEach((cb) => {
      try {
        cb(payload);
      } catch (err) {
        console.error('Error in stream subscriber:', err);
      }
    });
  }

  setScenario(scenario) {
    if (this.activeScenario === scenario) return;
    this.activeScenario = scenario;

    // Reset Jaipur buffer to match scenario
    this.stationBuffers['AWS-JPR-04'] = this.createInitialBuffer('AWS-JPR-04');
    this.tick();
  }

  setStation(stationId) {
    if (!this.stations[stationId]) return;
    this.activeStationId = stationId;

    const buffer = this.stationBuffers[stationId];
    if (window.UnifiedComparativeChartInstance && buffer) {
      window.UnifiedComparativeChartInstance.updateData(buffer);
    }

    this.tick();
  }

  tick() {
    const nowStr = new Date().toLocaleTimeString();

    // Advance rolling buffer for every station
    Object.keys(this.stations).forEach((stId) => {
      const st = this.stations[stId];
      const buffer = this.stationBuffers[stId];

      const noiseT = (Math.random() - 0.5) * 0.4;
      const noiseH = (Math.random() - 0.5) * 0.8;
      const noiseP = (Math.random() - 0.5) * 0.2;

      let nextTemp;
      const isJaipurFailure = stId === 'AWS-JPR-04' && this.activeScenario === 'failure';

      if (isJaipurFailure) {
        // Dynamic oscillating failure curve around 55.2°C
        nextTemp = Number((54.0 + Math.sin(Date.now() / 800) * 1.5 + noiseT).toFixed(1));
      } else {
        nextTemp = Number((st.baseTemp + noiseT).toFixed(1));
      }

      const nextHum = Number((st.baseHum + noiseH).toFixed(1));
      const nextPress = Number((st.basePress + noiseP).toFixed(1));

      buffer.timestamps.push(nowStr);
      buffer.temp.push(nextTemp);
      buffer.humidity.push(nextHum);
      buffer.pressure.push(nextPress);

      // Shift window to preserve 30 points
      if (buffer.timestamps.length > 30) {
        buffer.timestamps.shift();
        buffer.temp.shift();
        buffer.humidity.shift();
        buffer.pressure.shift();
        buffer.anomalies = buffer.anomalies
          .map((idx) => idx - 1)
          .filter((idx) => idx >= 0);
      }

      // Anomaly detection pin throttle
      if (isJaipurFailure) {
        const currIdx = buffer.temp.length - 1;
        const prevTemp = buffer.temp[currIdx - 1] ?? buffer.temp[currIdx];
        if (Math.abs(nextTemp - prevTemp) >= 4.0 || buffer.anomalies.length === 0) {
          if (!buffer.anomalies.includes(currIdx)) {
            buffer.anomalies.push(currIdx);
          }
        }
      }
    });

    const activeSt = this.stations[this.activeStationId];
    const activeBuffer = this.stationBuffers[this.activeStationId];
    const isAnomaly = this.activeStationId === 'AWS-JPR-04' && this.activeScenario === 'failure';

    // Direct redraw of active chart
    if (window.UnifiedComparativeChartInstance && activeBuffer) {
      window.UnifiedComparativeChartInstance.updateData(activeBuffer);
    }

    // Broadcast state payload
    this.broadcast({
      stationId: this.activeStationId,
      stationName: activeSt.name,
      reading: {
        stationId: this.activeStationId,
        stationName: activeSt.name,
        temp: activeBuffer.temp[activeBuffer.temp.length - 1],
        humidity: activeBuffer.humidity[activeBuffer.humidity.length - 1],
        pressure: activeBuffer.pressure[activeBuffer.pressure.length - 1]
      },
      analysis: {
        isAnomaly,
        confidence: isAnomaly ? 0.984 : 0.04,
        imputedVal: 25.4,
        trustScore: isAnomaly ? 82 : activeSt.trust
      },
      scenario: this.activeScenario,
      networkTrust: isAnomaly ? 86 : 96,
      buffer: activeBuffer,
      stations: this.stations
    });
  }

  start() {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => this.tick(), this.intervalMs);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}

// Global Singleton Instance
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
