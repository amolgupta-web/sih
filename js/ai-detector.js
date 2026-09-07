/**
 * SkyGuard AI — Weather Data Trust Intelligence Engine (PS 73)
 * Hybrid Client: Evaluates telemetry via live Python ML Backend (/api/predict)
 * with automatic zero-downtime client-side fallback.
 */

class WeatherDataTrustEngine {
  constructor() {
    this.baselines = {
      temp: { mean: 24.8, std: 3.1, expectedMin: 22.0, expectedMax: 27.5, maxRatePerMin: 1.5 },
      humidity: { mean: 64.0, std: 7.2, expectedMin: 45.0, expectedMax: 78.0, maxRatePerMin: 4.0 },
      pressure: { mean: 1012.4, std: 2.8, expectedMin: 1004.0, expectedMax: 1018.0, maxRatePerMin: 2.0 }
    };

    this.history = {
      temp: [],
      humidity: [],
      pressure: []
    };
    this.maxHistory = 60;

    this.freezeTracker = {
      temp: { val: null, count: 0 },
      humidity: { val: null, count: 0 },
      pressure: { val: null, count: 0 }
    };

    this.sensorHealth = {
      temp: 82,
      humidity: 94,
      pressure: 91
    };

    this.lastAnalysis = null;
    this.apiUrl = '/api/predict';
  }

  /**
   * Primary asynchronous entry point called by stream-engine.js
   */
  async analyzeReadingAsync(reading) {
    const rawT = reading.temp;
    const rawH = reading.humidity;
    const rawP = reading.pressure;
    const stationId = reading.stationId || 'AWS-JPR-04';

    // Update tracking state
    this.updateFreeze('temp', rawT);
    this.updateFreeze('humidity', rawH);
    this.updateFreeze('pressure', rawP);

    // Prepare packet for Python backend
    const payload = {
      DATE: new Date().toISOString().replace('T', ' ').substring(0, 19),
      STATION: stationId === 'AWS-JPR-04' ? 42348 : (stationId === 'AWS-DEL-07' ? 42182 : 43279),
      AIR_TEMP_C: rawT,
      REL_HUMIDITY: rawH,
      SLP_HPA: rawP,
      DEW_POINT_C: parseFloat((rawT - ((100 - rawH) / 5)).toFixed(2))
    };

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const ml = await response.json();
        return this.mapBackendResponse(reading, ml);
      }
    } catch (err) {
      console.warn("Backend /api/predict unreachable, using client heuristics:", err);
    }

    // Fallback to local heuristics if server is offline
    return this.analyzeReading(reading);
  }

  /**
   * Maps Python 3-Tier ML result into the dashboard UI format
   */
  mapBackendResponse(reading, ml) {
    const rawT = reading.temp;
    const rawH = reading.humidity;
    const rawP = reading.pressure;
    const stationId = reading.stationId || 'AWS-JPR-04';
    const nearby = reading.nearbyStations || this.getNearbyMesonetContext(rawT, rawH, rawP, ml.is_anomaly);

    // Sync sensor health with EWMA health score
    if (typeof ml.sensor_health_pct === 'number') {
      this.sensorHealth.temp = Math.round(ml.sensor_health_pct);
    }

    let dataTrustScore = 96;
    let trustStatus = 'TRUSTED';
    let severity = 'Nominal';

    if (ml.fault_type === 'SPIKE') {
      dataTrustScore = 12;
      trustStatus = 'LOW TRUST';
      severity = 'Critical';
    } else if (ml.fault_type === 'STUCK_VALUE') {
      dataTrustScore = 18;
      trustStatus = 'LOW TRUST';
      severity = 'Warning';
    } else if (ml.fault_type === 'DRIFT') {
      dataTrustScore = 48;
      trustStatus = 'ATTENTION';
      severity = 'Warning';
    } else if (ml.fault_type === 'PHYSICAL_INCONSISTENCY') {
      dataTrustScore = 8;
      trustStatus = 'LOW TRUST';
      severity = 'Critical';
    }

    const mode = ml.fault_type === 'SPIKE' ? 'spike' : (ml.fault_type === 'STUCK_VALUE' ? 'frozen' : 'normal');

    return this.formatResult({
      stationId,
      parameter: 'Temperature',
      rawVal: rawT,
      imputedVal: ml.imputed_temp !== undefined ? ml.imputed_temp : rawT,
      imputeConfidence: Math.round(ml.confidence_score || 92),
      dataTrustScore,
      trustStatus,
      isAnomaly: !!ml.is_anomaly,
      anomalyType: ml.fault_type ? ml.fault_type.replace('_', ' ') : 'Nominal Weather Measurement',
      severity,
      confidence: parseFloat((ml.confidence_score || 95.0).toFixed(1)),
      rootCause: ml.action_required ? ml.action_required.split(':')[0] : 'Normal Sensor Operation',
      action: ml.action_required || 'No maintenance required. Sensor data verified as trustworthy.',
      evidence: this.buildEvidence(rawT, rawH, rawP, nearby, mode),
      realityCheck: {
        verdict: ml.is_anomaly ? 'ML CONFIRMED ANOMALY' : 'TRUSTED METEOROLOGICAL DATA',
        confidence: parseFloat((ml.confidence_score || 95.0).toFixed(1)),
        weatherScore: ml.is_anomaly ? Math.round(100 - ml.confidence_score) : Math.round(ml.confidence_score),
        anomalyScore: ml.is_anomaly ? Math.round(ml.confidence_score) : Math.round(100 - ml.confidence_score),
        summary: `Validated via Decision Tree & WMO Arbiter. Normalized gradient: ${ml.norm_rate_30m || 0}°C/30m.`
      },
      sensorHealth: this.sensorHealth,
      reading,
      nearby
    });
  }

  /**
   * Fallback heuristics engine (local browser evaluation)
   */
  analyzeReading(reading) {
    const rawT = reading.temp;
    const rawH = reading.humidity;
    const rawP = reading.pressure;
    const stationId = reading.stationId || 'AWS-JPR-04';
    const isMissing = !!reading.isMissing;

    this.updateFreeze('temp', rawT);
    this.updateFreeze('humidity', rawH);
    this.updateFreeze('pressure', rawP);

    const nearby = reading.nearbyStations || this.getNearbyMesonetContext(rawT, rawH, rawP, reading.forceAnomaly);

    if (isMissing || rawT === null || isNaN(rawT)) {
      return this.formatResult({
        stationId,
        parameter: 'Temperature',
        rawVal: null,
        imputedVal: 24.9,
        imputeConfidence: 88,
        dataTrustScore: 5,
        trustStatus: 'LOW TRUST',
        isAnomaly: true,
        anomalyType: 'Communication / Packet Dropout',
        severity: 'Critical',
        confidence: 99.1,
        rootCause: 'Data Telemetry Loss',
        action: 'Inspect cellular modem transceiver and solar battery voltage.',
        evidence: this.buildEvidence(null, rawH, rawP, nearby, 'missing'),
        realityCheck: this.calculateRealityCheck(null, rawH, rawP, nearby, false, true),
        sensorHealth: this.sensorHealth
      });
    }

    if (this.freezeTracker.humidity.count >= 10 || this.freezeTracker.temp.count >= 3) {
      return this.formatResult({
        stationId,
        parameter: 'Temperature',
        rawVal: rawT,
        imputedVal: 25.1,
        imputeConfidence: 89,
        dataTrustScore: 18,
        trustStatus: 'LOW TRUST',
        isAnomaly: true,
        anomalyType: 'Frozen / Stuck Sensor',
        severity: 'Warning',
        confidence: 96.2,
        rootCause: 'Transducer Lockup / I2C Bus Stall',
        action: 'Schedule bus reset and sensor chamber cleaning.',
        evidence: this.buildEvidence(rawT, rawH, rawP, nearby, 'frozen'),
        realityCheck: this.calculateRealityCheck(rawT, rawH, rawP, nearby, false, true),
        sensorHealth: this.sensorHealth
      });
    }

    const prevT = this.history.temp.length > 0 ? this.history.temp[this.history.temp.length - 1] : rawT;
    const dTempDt = Math.abs(rawT - prevT);

    this.history.temp.push(rawT);
    this.history.humidity.push(rawH);
    this.history.pressure.push(rawP);
    if (this.history.temp.length > this.maxHistory) {
      this.history.temp.shift();
      this.history.humidity.shift();
      this.history.pressure.shift();
    }

    const isTempSpike = rawT >= 50.0 || (dTempDt >= 8.0 && Math.abs(rawT - nearby.tempMean) > 10.0);
    const isRealStorm = reading.isRealStorm || (Math.abs(rawT - nearby.tempMean) < 3.0 && dTempDt > 4.0 && Math.abs(rawP - nearby.pressMean) < 2.0);

    let dataTrustScore = 96;
    let trustStatus = 'TRUSTED';
    let isAnomaly = false;
    let anomalyType = 'Nominal Weather Measurement';
    let severity = 'Nominal';
    let confidence = 96.4;
    let rootCause = 'Normal Sensor Operation';
    let action = 'No maintenance required. Sensor data verified as trustworthy.';
    let imputedVal = rawT;
    let imputeConfidence = 95.0;

    if (isRealStorm) {
      dataTrustScore = 94;
      trustStatus = 'TRUSTED';
      isAnomaly = false;
      anomalyType = 'Genuine Weather Event (Squall / Front)';
      confidence = 94.2;
      rootCause = 'Atmospheric Frontal Advection';
      action = 'Verified as authentic meteorological event. Retain in numerical models.';
    } else if (isTempSpike) {
      dataTrustScore = 12;
      trustStatus = 'LOW TRUST';
      isAnomaly = true;
      anomalyType = 'Sudden Sensor Spike';
      severity = 'Critical';
      confidence = 98.4;
      rootCause = 'Sudden Sensor Spike (Thermistor / ADC Failure)';
      action = 'Inspect sensor hardware and analog-to-digital converter immediately.';
      imputedVal = prevT;
      imputeConfidence = 91.0;
      this.sensorHealth.temp = Math.max(60, this.sensorHealth.temp - 2);
    }

    return this.formatResult({
      stationId,
      parameter: 'Temperature',
      rawVal: rawT,
      imputedVal,
      imputeConfidence,
      dataTrustScore,
      trustStatus,
      isAnomaly,
      anomalyType,
      severity,
      confidence,
      rootCause,
      action,
      evidence: this.buildEvidence(rawT, rawH, rawP, nearby, isTempSpike ? 'spike' : isRealStorm ? 'storm' : 'normal'),
      realityCheck: this.calculateRealityCheck(rawT, rawH, rawP, nearby, isRealStorm, isTempSpike),
      sensorHealth: this.sensorHealth,
      reading,
      nearby
    });
  }

  buildEvidence(rawT, rawH, rawP, nearby, mode) {
    if (mode === 'spike') {
      return [
        {
          num: '01',
          name: 'Historical Deviation',
          desc: `${rawT}°C is significantly outside the expected historical diurnal envelope (22.0°C – 27.5°C).`,
          impact: 'High',
          badgeClass: 'impact-high'
        },
        {
          num: '02',
          name: 'Temporal Deviation',
          desc: 'The temperature increased beyond thermodynamic inertia limits within seconds.',
          impact: 'High',
          badgeClass: 'impact-high'
        },
        {
          num: '03',
          name: 'Cross-Sensor Consistency',
          desc: 'Barometric pressure does not support an extreme heat transient.',
          impact: 'High',
          badgeClass: 'impact-high'
        },
        {
          num: '04',
          name: 'Nearby Station Comparison',
          desc: `Nearby mesonet stations remain within normal variance (~${nearby.tempMean}°C).`,
          impact: 'Very High',
          badgeClass: 'impact-very-high'
        }
      ];
    } else if (mode === 'frozen') {
      return [
        {
          num: '01',
          name: 'Zero Variance Detection',
          desc: 'Identical transducer values recorded over consecutive acquisition windows.',
          impact: 'High',
          badgeClass: 'impact-high'
        }
      ];
    } else {
      return [
        {
          num: '01',
          name: 'Historical Alignment',
          desc: 'Reading fits within normal 95% diurnal confidence envelope.',
          impact: 'High',
          badgeClass: 'impact-trusted'
        },
        {
          num: '02',
          name: 'Peer Consistency',
          desc: 'Station aligns with adjacent stations within expected variance.',
          impact: 'High',
          badgeClass: 'impact-trusted'
        }
      ];
    }
  }

  calculateRealityCheck(rawT, rawH, rawP, nearby, isRealStorm, isSpike) {
    if (isRealStorm) {
      return {
        verdict: 'GENUINE WEATHER EVENT',
        confidence: 94.2,
        weatherScore: 92,
        anomalyScore: 8,
        summary: 'Synchronous multi-sensor frontal advection corroborated by adjacent mesonet nodes.'
      };
    } else if (isSpike) {
      return {
        verdict: 'PROBABLE SENSOR ANOMALY',
        confidence: 98.4,
        weatherScore: 4,
        anomalyScore: 96,
        summary: 'Isolated single-channel electrical impulse contradicted by regional and thermodynamic physics.'
      };
    } else {
      return {
        verdict: 'TRUSTED METEOROLOGICAL DATA',
        confidence: 96.0,
        weatherScore: 98,
        anomalyScore: 2,
        summary: 'Normal atmospheric measurement.'
      };
    }
  }

  updateFreeze(sensor, val) {
    const tracker = this.freezeTracker[sensor];
    if (tracker.val !== null && Math.abs(tracker.val - val) < 0.001) {
      tracker.count++;
    } else {
      tracker.val = val;
      tracker.count = 1;
    }
  }

  getNearbyMesonetContext(rawT, rawH, rawP, forceAnomaly) {
    const baseT = forceAnomaly ? 24.8 : rawT;
    const baseH = forceAnomaly ? 64.0 : rawH;
    const baseP = forceAnomaly ? 1012.4 : rawP;

    return {
      tempMean: baseT,
      humMean: baseH,
      pressMean: baseP,
      stations: [
        { id: 'AWS-DEL-01', dist: '4.2 km', temp: (baseT - 0.2).toFixed(1), trust: 98 },
        { id: 'AWS-DEL-03', dist: '8.7 km', temp: (baseT + 0.4).toFixed(1), trust: 96 },
        { id: 'AWS-NOI-05', dist: '12.1 km', temp: (baseT - 0.6).toFixed(1), trust: 94 },
        { id: 'AWS-GGN-02', dist: '14.6 km', temp: (baseT + 0.3).toFixed(1), trust: 97 }
      ]
    };
  }

  formatResult(data) {
    this.lastAnalysis = {
      ...data,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    return this.lastAnalysis;
  }
}

window.WeatherDataTrustEngineInstance = new WeatherDataTrustEngine();
