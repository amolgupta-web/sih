/**
 * SkyGuard AI — B2B Operational Telemetry Stream Engine
 * Simulates real-time mesonet data across 24 weather stations with support for the 3
 * core product evaluation scenarios: Normal Weather, Genuine Weather Event, and Sensor Failure.
 * Connected asynchronously to Python 3-Tier ML backend (/api/predict).
 */

class OperationalStreamEngine {
  constructor() {
    this.stations = {
      'AWS-JPR-04': { name: 'Jaipur (Semi-Arid)', region: 'Western Grid', baseTemp: 25.0, baseHum: 44, basePress: 1008.2, status: 'Critical', trust: 12 },
      'AWS-DEL-07': { name: 'New Delhi (Central)', region: 'Northern Grid', baseTemp: 24.7, baseHum: 76, basePress: 1012.4, status: 'Attention', trust: 74 },
      'AWS-MUM-02': { name: 'Mumbai (Harbor)', region: 'Coastal Grid', baseTemp: 29.2, baseHum: 84, basePress: 1010.8, status: 'Attention', trust: 62 },
      'AWS-BLR-02': { name: 'Bengaluru (Plateau)', region: 'Southern Grid', baseTemp: 21.6, baseHum: 58, basePress: 1014.2, status: 'Healthy', trust: 98 },
      'AWS-HIM-09': { name: 'Shimla (Alpine)', region: 'Highland Grid', baseTemp: 14.5, baseHum: 68, basePress: 994.0, status: 'Healthy', trust: 97 }
    };

    this.activeStationId = 'AWS-JPR-04';
    this.intervalMs = 2500;
    this.timer = null;

    // Active scenario mode: 'normal' | 'storm' | 'failure'
    this.activeScenario = 'failure';
    this.scenarioStep = 0;

    // Listeners
    this.listeners = [];

    // Station buffers
    this.stationBuffers = {};
    this.initBuffers();

    this.start();
  }

  initBuffers() {
    Object.keys(this.stations).forEach((id) => {
      const st = this.stations[id];
      const buffer = {
        timestamps: [],
        temp: [],
        imputedTemp: [],
        humidity: [],
        pressure: [],
        anomalies: []
      };

      const now = Date.now();
      const count = 35;
      for (let i = count; i >= 0; i--) {
        const time = new Date(now - i * 60000);
        const label = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const t = parseFloat((st.baseTemp + (Math.random() - 0.5) * 0.4).toFixed(1));
        const h = parseFloat((st.baseHum + (Math.random() - 0.5) * 1.0).toFixed(1));
        const p = parseFloat((st.basePress + (Math.random() - 0.5) * 0.3).toFixed(1));

        buffer.timestamps.push(label);
        buffer.temp.push(t);
        buffer.imputedTemp.push(null);
        buffer.humidity.push(h);
        buffer.pressure.push(p);
      }

      this.stationBuffers[id] = buffer;
    });

    const jpr = this.stationBuffers['AWS-JPR-04'];
    if (jpr && jpr.temp.length > 5) {
      const len = jpr.temp.length;
      jpr.temp[len - 4] = 25.1;
      jpr.temp[len - 3] = 25.3;
      jpr.temp[len - 2] = 25.2;
      jpr.temp[len - 1] = 55.2;
      jpr.imputedTemp[len - 1] = 25.4;
      jpr.anomalies.push(len - 1);
    }
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

  setScenario(scenarioKey) {
    this.activeScenario = scenarioKey;
    this.scenarioStep = 0;
    this.tick();
  }

  setStation(stationId) {
    if (this.stations[stationId]) {
      this.activeStationId = stationId;
      this.tick();
    }
  }

  async tick() {
    const station = this.stations[this.activeStationId];
    const buffer = this.stationBuffers[this.activeStationId];
    const now = new Date();
    const timeLabel = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    let t = station.baseTemp + (Math.random() - 0.5) * 0.3;
    let h = station.baseHum + (Math.random() - 0.5) * 0.8;
    let p = station.basePress + (Math.random() - 0.5) * 0.3;
    let isForcedAnomaly = false;
    let isRealStorm = false;

    // Scenario Handling
    if (this.activeScenario === 'failure') {
      t = 55.2;
      isForcedAnomaly = true;
      station.status = 'Critical';
      station.trust = 12;
    } else if (this.activeScenario === 'storm') {
      t = station.baseTemp - 7.6;
      h = Math.min(96, station.baseHum + 26);
      p = station.basePress - 6.2;
      isRealStorm = true;
      station.status = 'Healthy';
      station.trust = 94;
    } else {
      station.status = 'Healthy';
      station.trust = 98;
    }

    t = parseFloat(t.toFixed(1));
    h = parseFloat(h.toFixed(1));
    p = parseFloat(p.toFixed(1));

    const reading = {
      stationId: this.activeStationId,
      stationName: station.name,
      timestamp: timeLabel,
      temp: t,
      humidity: h,
      pressure: p,
      forceAnomaly: isForcedAnomaly,
      isRealStorm,
      scenario: this.activeScenario
    };

    // Await live predictions from the Python ML Decision Tree Backend
    let analysis;
    if (window.WeatherDataTrustEngineInstance && typeof window.WeatherDataTrustEngineInstance.analyzeReadingAsync === 'function') {
      analysis = await window.WeatherDataTrustEngineInstance.analyzeReadingAsync(reading);
    } else {
      analysis = window.WeatherDataTrustEngineInstance.analyzeReading(reading);
    }

    // Buffer update
    buffer.timestamps.push(timeLabel);
    buffer.temp.push(t);
    buffer.imputedTemp.push(analysis.imputedVal);
    buffer.humidity.push(h);
    buffer.pressure.push(p);

    if (analysis.isAnomaly) {
      buffer.anomalies.push(buffer.temp.length - 1);
    }

    if (buffer.timestamps.length > 40) {
      buffer.timestamps.shift();
      buffer.temp.shift();
      buffer.imputedTemp.shift();
      buffer.humidity.shift();
      buffer.pressure.shift();
      buffer.anomalies = buffer.anomalies.map(idx => idx - 1).filter(idx => idx >= 0);
    }

    this.notify({
      reading,
      analysis,
      buffer,
      stationId: this.activeStationId,
      scenario: this.activeScenario,
      stations: this.stations
    });
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify(data) {
    for (const cb of this.listeners) {
      try {
        cb(data);
      } catch (err) {
        console.error("StreamEngine listener error:", err);
      }
    }
  }
}

window.OperationalStreamEngineInstance = new OperationalStreamEngine();
