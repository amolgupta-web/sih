/**
 * SkyGuard AI — B2B Operational Telemetry Stream Engine
 * Simulates real-time mesonet data across weather stations with support for 3
 * core product evaluation scenarios: Normal Weather, Genuine Weather Event, and Sensor Failure.
 * Continuously pushes rolling buffer updates to the live chart canvas and streams inference
 * requests to the Python ML backend at /api/predict.
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

    // Event listeners
    this.listeners = [];

    // Station telemetry rolling buffers
    this.stationBuffers = {};
    this.initBuffers();

    // Start background telemetry loop
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
      const count = 30;
      for (let i = count; i >= 0; i--) {
        const time = new Date(now - i * 2500);
        const label = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        const t = parseFloat((st.baseTemp + (Math.random() - 0.5) * 0.4).toFixed(1));
        const h = parseFloat((st.baseHum + (Math.random() - 0.5) * 1.0).toFixed(1));
        const p = parseFloat((st.basePress + (Math.random() - 0.5) * 0.3).toFixed(1));

        buffer.timestamps.push(label);
        buffer.temp.push(t);
        buffer.imputedTemp.push(25.4);
        buffer.humidity.push(h);
        buffer.pressure.push(p);
      }

      this.stationBuffers[id] = buffer;
    });

    // Seed evaluation spike for AWS-JPR-04
    const jpr = this.stationBuffers['AWS-JPR-04'];
    if (jpr && jpr.temp.length > 5) {
      const len = jpr.temp.length;
      jpr.temp[len - 4] = 25.1;
      jpr.temp[len - 3] = 25.3;
      jpr.temp[len - 2] = 25.2;
      jpr.temp[len - 1] = 54.8;
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

    // Dynamic micro-jitter to ensure continuous dynamic movement
    let jitterT = (Math.random() - 0.5) * 0.4;
    let jitterH = (Math.random() - 0.5) * 0.8;
    let jitterP = (Math.random() - 0.5) * 0.3;

    let t = station.baseTemp + jitterT;
    let h = station.baseHum + jitterH;
    let p = station.basePress + jitterP;
    let isForcedAnomaly = false;
    let isRealStorm = false;

    // Dynamic Scenario Handling
    if (this.activeScenario === 'failure') {
      // Fluctuate around ~54-56°C with visible ADC jitter so movement is clear
      const noise = (Math.sin(Date.now() / 800) * 2.0) + ((Math.random() - 0.5) * 1.2);
      t = 54.5 + noise;
      isForcedAnomaly = true;
      station.status = 'Critical';
      station.trust = 12;
    } else if (this.activeScenario === 'storm') {
      t = station.baseTemp - 7.6 + jitterT;
      h = Math.min(96, station.baseHum + 26 + jitterH);
      p = station.basePress - 6.2 + jitterP;
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

    // Client fallback analysis defaults
    let analysis = {
      isAnomaly: isForcedAnomaly,
      confidence: 0.98,
      imputedVal: 25.4,
      verdict: isForcedAnomaly ? 'PROBABLE SENSOR ANOMALY' : 'TRUSTED METEOROLOGICAL DATA'
    };

    try {
      if (window.WeatherDataTrustEngineInstance?.analyzeReadingAsync) {
        analysis = await window.WeatherDataTrustEngineInstance.analyzeReadingAsync(reading);
      } else if (window.WeatherDataTrustEngineInstance?.analyzeReading) {
        analysis = window.WeatherDataTrustEngineInstance.analyzeReading(reading);
      }
    } catch (err) {
      console.warn("Inference API fallback engaged:", err);
    }

    // Append latest data point to rolling buffer
    buffer.timestamps.push(timeLabel);
    buffer.temp.push(t);
    buffer.imputedTemp.push(analysis.imputedVal !== undefined && analysis.imputedVal !== null ? analysis.imputedVal : 25.4);
    buffer.humidity.push(h);
    buffer.pressure.push(p);

    if (analysis.isAnomaly) {
      buffer.anomalies.push(buffer.temp.length - 1);
    }

    // Window size fixed to 30 data points; shift oldest to scroll left
    while (buffer.timestamps.length > 30) {
      buffer.timestamps.shift();
      buffer.temp.shift();
      buffer.imputedTemp.shift();
      buffer.humidity.shift();
      buffer.pressure.shift();
      buffer.anomalies = buffer.anomalies.map(idx => idx - 1).filter(idx => idx >= 0);
    }

    // Direct render call to eliminate race conditions with listeners
    if (window.UnifiedComparativeChartInstance) {
      window.UnifiedComparativeChartInstance.updateData(buffer);
    }

    // Broadcast frame to registered event subscribers
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

// Global Singleton Instance
window.OperationalStreamEngineInstance = new OperationalStreamEngine();
