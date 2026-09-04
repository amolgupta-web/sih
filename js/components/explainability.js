/**
 * SkyGuard AI — Explainable AI (XAI) Interface
 * Visualizes SHAP-inspired feature attribution impacts and circular confidence gauge
 * to answer "Why Did SkyGuard Flag This?".
 */

class ExplainabilityController {
  constructor() {
    this.confNumberEl = document.getElementById('xai-conf-number');
    this.confCircleEl = document.getElementById('xai-circle-progress');
    this.verdictTitleEl = document.getElementById('xai-verdict-title');
    this.verdictDescEl = document.getElementById('xai-verdict-desc');

    // Impact Bars
    this.barHist = document.getElementById('xai-bar-hist');
    this.barCross = document.getElementById('xai-bar-cross');
    this.barSpatial = document.getElementById('xai-bar-spatial');
    this.barTemporal = document.getElementById('xai-bar-temporal');

    // Impact Badges
    this.badgeHist = document.getElementById('xai-badge-hist');
    this.badgeCross = document.getElementById('xai-badge-cross');
    this.badgeSpatial = document.getElementById('xai-badge-spatial');
    this.badgeTemporal = document.getElementById('xai-badge-temporal');

    // Descriptions
    this.descHist = document.getElementById('xai-desc-hist');
    this.descCross = document.getElementById('xai-desc-cross');
    this.descSpatial = document.getElementById('xai-desc-spatial');
    this.descTemporal = document.getElementById('xai-desc-temporal');

    this.currentAnomaly = null;
    this.init();
  }

  init() {
    // Default focus: 55.2°C Temperature Spike
    this.setAnomaly({
      title: 'Temperature: 55.2°C Spike',
      stationId: 'AWS-DEL-07',
      confidence: 98,
      verdict: 'High Confidence Sensor Anomaly',
      verdictDesc: 'The AI model classified this event as an isolated thermistor failure due to sharp spatial and cross-sensor thermodynamic divergence.',
      features: {
        hist: { score: 94, impact: 'Very High', desc: 'Temperature is 31.4°C above expected seasonal range.' },
        cross: { score: 78, impact: 'High', desc: 'Humidity and pressure patterns do not support an extreme heat event.' },
        spatial: { score: 96, impact: 'Very High', desc: 'Nearby stations report temperatures between 24°C – 27°C.' },
        temporal: { score: 86, impact: 'High', desc: 'The spike occurred within 30 seconds without gradual environmental transition.' }
      }
    });

    // Make global helper accessible
    window.inspectAnomalyInXAI = (alertId) => {
      this.inspectAlert(alertId);
    };
  }

  inspectAlert(alertId) {
    const alerts = window.DashboardControllerInstance ? window.DashboardControllerInstance.alerts : [];
    const alert = alerts.find(a => a.id === alertId);

    if (alert) {
      this.setAnomaly({
        title: `${alert.title} (${alert.val})`,
        stationId: alert.stationId,
        confidence: alert.confidence,
        verdict: `${alert.severity} ${alert.title}`,
        verdictDesc: alert.cause,
        features: {
          hist: {
            score: alert.features ? alert.features.histDev : 85,
            impact: alert.confidence > 90 ? 'Very High' : 'High',
            desc: `Historical deviation index indicates extreme divergence from baseline statistical envelope.`
          },
          cross: {
            score: alert.features ? alert.features.crossSensor : 70,
            impact: 'High',
            desc: `Secondary channels (humidity & pressure) exhibit physical coupling discord.`
          },
          spatial: {
            score: alert.features ? alert.features.spatial : 90,
            impact: 'Very High',
            desc: `Peer automatic weather stations within 15km show steady readings with zero correlation.`
          },
          temporal: {
            score: alert.features ? alert.features.temporal : 65,
            impact: 'High',
            desc: `Rate-of-change metric exceeded maximum thermodynamic speed threshold.`
          }
        }
      });

      // Smooth scroll to explainability section
      const xaiSection = document.getElementById('section-explainability');
      if (xaiSection) {
        xaiSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  setAnomaly(data) {
    this.currentAnomaly = data;

    // 1. Update Confidence Number
    if (this.confNumberEl) {
      this.confNumberEl.innerText = `${data.confidence}%`;
    }

    // 2. Update Radial SVG Meter
    if (this.confCircleEl) {
      const radius = 80;
      const circumference = 2 * Math.PI * radius;
      const offset = circumference - (data.confidence / 100) * circumference;
      this.confCircleEl.style.strokeDasharray = `${circumference}`;
      this.confCircleEl.style.strokeDashoffset = `${offset}`;
      this.confCircleEl.style.stroke = data.confidence >= 90 ? '#EF4444' : '#C59B27';
    }

    // 3. Verdict
    if (this.verdictTitleEl) this.verdictTitleEl.innerText = data.verdict;
    if (this.verdictDescEl) this.verdictDescEl.innerText = data.verdictDesc;

    // 4. Update SHAP Impact Bars & Badges
    const f = data.features;
    if (f) {
      this.updateFeatureRow('hist', f.hist, this.barHist, this.badgeHist, this.descHist);
      this.updateFeatureRow('cross', f.cross, this.barCross, this.badgeCross, this.descCross);
      this.updateFeatureRow('spatial', f.spatial, this.barSpatial, this.badgeSpatial, this.descSpatial);
      this.updateFeatureRow('temporal', f.temporal, this.barTemporal, this.badgeTemporal, this.descTemporal);
    }
  }

  updateFeatureRow(key, item, barEl, badgeEl, descEl) {
    if (barEl) {
      barEl.style.width = '0%';
      setTimeout(() => {
        barEl.style.width = `${item.score}%`;
      }, 50);
    }
    if (badgeEl) {
      badgeEl.innerText = item.impact;
      badgeEl.className = 'factor-impact-badge';
      if (item.impact === 'Very High') badgeEl.classList.add('impact-very-high');
      else if (item.impact === 'High') badgeEl.classList.add('impact-high');
      else badgeEl.classList.add('impact-moderate');
    }
    if (descEl) {
      descEl.innerText = item.desc;
    }
  }
}

window.ExplainabilityControllerInstance = null;
window.initExplainability = function() {
  if (!window.ExplainabilityControllerInstance) {
    window.ExplainabilityControllerInstance = new ExplainabilityController();
  }
};
