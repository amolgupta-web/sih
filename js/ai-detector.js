/**
 * SkyGuard AI — Real-time Anomaly Detection & Trust Evaluation Engine (PS 73)
 * Combines statistical boundary envelopes, thermodynamic rate-of-change validation,
 * and spatial consensus checks to classify AWS observations.
 */

class AIDetector {
  constructor() {
    // Physical thermodynamic limits of ambient air
    this.maxThermalRatePerSec = 0.35; // °C per second maximum physical limit
    this.historicalDiurnalEnvelopes = {
      'AWS-JPR-04': { min: 21.0, max: 28.5, seasonalMean: 25.4, stdDev: 1.8 },
      'AWS-DEL-07': { min: 24.0, max: 32.0, seasonalMean: 28.4, stdDev: 2.1 },
      'AWS-CHE-12': { min: 28.0, max: 34.0, seasonalMean: 31.5, stdDev: 1.4 }
    };
  }

  /**
   * Evaluates a reading against historical baseline, temporal inertia, and spatial neighbors.
   * @param {Object} reading Current sensor reading { stationId, temp, humidity, pressure, timestamp }
   * @param {Object} previousReading Prior sensor reading for delta calculations
   * @param {Array} neighborReadings Array of readings from adjacent stations
   */
  evaluate(reading, previousReading = null, neighborReadings = []) {
    const stationId = reading.stationId || 'AWS-JPR-04';
    const envelope = this.historicalDiurnalEnvelopes[stationId] || this.historicalDiurnalEnvelopes['AWS-JPR-04'];
    
    const evidence = [];
    let anomalyScore = 0;

    // 1. Historical Baseline & Z-Score Analysis
    const zScore = (reading.temp - envelope.seasonalMean) / envelope.stdDev;
    if (reading.temp > envelope.max || reading.temp < envelope.min) {
      anomalyScore += 0.35;
      evidence.push({
        factor: 'Historical Baseline',
        severity: Math.abs(zScore) > 4 ? 'CRITICAL' : 'WARNING',
        detail: `Reading deviates by ${zScore.toFixed(1)}σ from the seasonal diurnal mean.`
      });
    }

    // 2. Temporal Deviation Rate (Thermal Inertia Check)
    if (previousReading && previousReading.temp !== undefined) {
      const deltaT = Math.abs(reading.temp - previousReading.temp);
      const dtSeconds = Math.max(1, (reading.timestamp - previousReading.timestamp) / 1000 || 2.5);
      const rateOfChange = deltaT / dtSeconds;

      if (rateOfChange > this.maxThermalRatePerSec) {
        anomalyScore += 0.40;
        evidence.push({
          factor: 'Thermodynamic Inertia Violation',
          severity: 'CRITICAL',
          detail: `Rate of change (${rateOfChange.toFixed(2)}°C/s) physically exceeds atmospheric thermal dissipation limits.`
        });
      }
    }

    // 3. Spatial Consistency (Cross-Station Residual Consensus)
    if (neighborReadings && neighborReadings.length > 0) {
      const neighborTemps = neighborReadings.map(n => n.temp).filter(t => t !== undefined);
      if (neighborTemps.length > 0) {
        const meanNeighborTemp = neighborTemps.reduce((a, b) => a + b, 0) / neighborTemps.length;
        const residual = Math.abs(reading.temp - meanNeighborTemp);

        if (residual > 8.0) {
          anomalyScore += 0.25;
          evidence.push({
            factor: 'Spatial Consensus Rejection',
            severity: 'CRITICAL',
            detail: `Isolated deviation of ${residual.toFixed(1)}°C against cluster mean (${meanNeighborTemp.toFixed(1)}°C).`
          });
        }
      }
    }

    // AI Classification Output
    const isAnomaly = anomalyScore >= 0.60;
    const confidence = isAnomaly ? Math.min(0.99, 0.75 + anomalyScore * 0.25) : Math.max(0.02, anomalyScore * 0.2);
    
    return {
      isAnomaly,
      confidence: parseFloat((confidence * 100).toFixed(1)),
      anomalyScore: parseFloat(anomalyScore.toFixed(2)),
      evidence,
      imputedTemp: parseFloat(envelope.seasonalMean.toFixed(1)),
      verdict: isAnomaly ? 'PROBABLE SENSOR ANOMALY' : 'NOMINAL FIDELITY',
      trustDeduction: isAnomaly ? Math.round(anomalyScore * 70) : 0
    };
  }
}

// Global Singleton Setup
window.AIDetectorInstance = null;

window.initAIDetector = function () {
  if (!window.AIDetectorInstance) {
    window.AIDetectorInstance = new AIDetector();
  }
  return window.AIDetectorInstance;
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.initAIDetector());
} else {
  window.initAIDetector();
}
