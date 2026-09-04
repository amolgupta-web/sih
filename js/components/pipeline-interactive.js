/**
 * SkyGuard AI — 5-Step AI Pipeline Interactive Visualizer
 * Renders interactive canvas animations demonstrating each stage of the anomaly detection workflow.
 */

class PipelineVisualizer {
  constructor() {
    this.canvas = document.getElementById('pipeline-stage-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.stepCards = document.querySelectorAll('.step-card');
    this.stepTitleEl = document.getElementById('pipeline-detail-title');
    this.stepDescEl = document.getElementById('pipeline-detail-desc');
    this.stepTagEl = document.getElementById('pipeline-stage-indicator');

    this.activeStep = 1;
    this.animTime = 0;

    this.stepsData = {
      1: {
        indicator: 'Step 01 / Ingestion',
        title: 'High-Frequency Real-Time Ingestion',
        desc: 'Continuous streaming telemetry ingested across RS-485, Modbus, and cellular IoT links from PT100 RTD thermistors, capacitive hygrometers, and piezoresistive barometers at 1Hz–0.1Hz sampling rates.'
      },
      2: {
        indicator: 'Step 02 / Temporal Intelligence',
        title: 'Diurnal & Seasonal Curve Modeling',
        desc: 'Temporal convolutional networks (TCN) and rolling historical statistics learn standard solar irradiance curves, day/night diurnal variations, and local microclimate thresholds.'
      },
      3: {
        indicator: 'Step 03 / Multi-Sensor Consistency',
        title: 'Cross-Parameter Physical Validation',
        desc: 'Thermodynamic coupling verification enforcing the Clausius-Clapeyron relation, dew point calculation limits, and barometric lapse constraints. If one parameter spikes without thermodynamic agreement, consistency fails.'
      },
      4: {
        indicator: 'Step 04 / Multi-Layer ML Detection',
        title: 'Deep Autoencoders & Isolation Forests',
        desc: 'Ensemble model combining Robust 3σ statistical bands, Isolation Forests for high-dimensional isolation, and Deep Autoencoders measuring latent reconstruction error.'
      },
      5: {
        indicator: 'Step 05 / Explainable AI & Action',
        title: 'SHAP Attribution & Predictive Guidance',
        desc: 'Automated generation of confidence scores, SHAP feature importance vectors, root cause classification, remaining useful sensor health estimation, and clear field engineering recommendations.'
      }
    };

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());

    this.stepCards.forEach(card => {
      card.addEventListener('click', () => {
        const stepNum = parseInt(card.dataset.step, 10);
        if (stepNum) this.setStep(stepNum);
      });
    });

    this.setStep(1);

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height || 280;
    this.canvas.width = this.width * window.devicePixelRatio;
    this.canvas.height = this.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  setStep(stepNum) {
    this.activeStep = stepNum;
    this.stepCards.forEach(c => {
      if (parseInt(c.dataset.step, 10) === stepNum) c.classList.add('active');
      else c.classList.remove('active');
    });

    const data = this.stepsData[stepNum];
    if (data) {
      if (this.stepTagEl) this.stepTagEl.innerText = data.indicator;
      if (this.stepTitleEl) this.stepTitleEl.innerText = data.title;
      if (this.stepDescEl) this.stepDescEl.innerText = data.desc;
    }
  }

  update() {
    this.animTime += 0.03;
  }

  draw() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.clearRect(0, 0, w, h);

    if (this.activeStep === 1) {
      // Step 1: Ingestion Particle Streams
      const streams = [
        { label: 'Temp (PT100)', color: '#10B981', y: h * 0.28 },
        { label: 'Humidity (Capacitive)', color: '#2563EB', y: h * 0.5 },
        { label: 'Pressure (Baro)', color: '#C59B27', y: h * 0.72 }
      ];

      streams.forEach((st) => {
        ctx.fillStyle = '#64748B';
        ctx.font = '600 11px -apple-system, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(st.label, 20, st.y + 4);

        // Guide line
        ctx.beginPath();
        ctx.moveTo(150, st.y);
        ctx.lineTo(w - 60, st.y);
        ctx.strokeStyle = 'rgba(226, 232, 240, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Flowing particles
        for (let i = 0; i < 6; i++) {
          const px = 150 + ((this.animTime * 60 + i * 75) % (w - 210));
          ctx.beginPath();
          ctx.arc(px, st.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = st.color;
          ctx.shadowColor = st.color;
          ctx.shadowBlur = 6;
          ctx.fill();
        }

        // Gateway hub
        ctx.beginPath();
        ctx.arc(w - 60, st.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = st.color;
        ctx.lineWidth = 2.5;
        ctx.fill();
        ctx.stroke();
      });

    } else if (this.activeStep === 2) {
      // Step 2: Temporal Diurnal Curve Morphing
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(30, h - 30);
      ctx.lineTo(w - 30, h - 30);
      ctx.stroke();

      // Diurnal sinusoidal baseline curve
      ctx.beginPath();
      ctx.strokeStyle = '#C59B27';
      ctx.lineWidth = 2.5;
      const points = 60;
      for (let i = 0; i <= points; i++) {
        const x = 30 + (i / points) * (w - 60);
        const t = (i / points) * Math.PI * 2;
        const wave = Math.sin(t - Math.PI / 2);
        const morph = Math.sin(this.animTime * 2 + i * 0.1) * 6;
        const y = h / 2 - wave * 60 + morph;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Envelope bands
      ctx.fillStyle = 'rgba(212, 175, 55, 0.08)';
      ctx.beginPath();
      for (let i = 0; i <= points; i++) {
        const x = 30 + (i / points) * (w - 60);
        const t = (i / points) * Math.PI * 2;
        const wave = Math.sin(t - Math.PI / 2);
        const y = h / 2 - wave * 60 - 20;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      for (let i = points; i >= 0; i--) {
        const x = 30 + (i / points) * (w - 60);
        const t = (i / points) * Math.PI * 2;
        const wave = Math.sin(t - Math.PI / 2);
        const y = h / 2 - wave * 60 + 20;
        ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();

    } else if (this.activeStep === 3) {
      // Step 3: Multi-Sensor Consistency Network (3 Interconnected Nodes)
      const cx = w / 2;
      const cy = h / 2;
      const r = 75;

      const nodes = [
        { label: 'Temperature', x: cx, y: cy - r + 5, color: '#10B981' },
        { label: 'Relative Humidity', x: cx - r * 0.9, y: cy + r * 0.6, color: '#2563EB' },
        { label: 'Atmospheric Pressure', x: cx + r * 0.9, y: cy + r * 0.6, color: '#C59B27' }
      ];

      // Connecting Triad lines
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(nodes[0].x, nodes[0].y);
      ctx.lineTo(nodes[1].x, nodes[1].y);
      ctx.lineTo(nodes[2].x, nodes[2].y);
      ctx.closePath();
      ctx.stroke();

      // Flowing energy along lines
      const t = (this.animTime % 1);
      const px = nodes[0].x + (nodes[1].x - nodes[0].x) * t;
      const py = nodes[0].y + (nodes[1].y - nodes[0].y) * t;
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#10B981';
      ctx.fill();

      // Nodes
      nodes.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 22, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = n.color;
        ctx.lineWidth = 3;
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#0F172A';
        ctx.font = 'bold 9px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(n.label.split(' ')[0], n.x, n.y + 3);
      });

    } else if (this.activeStep === 4) {
      // Step 4: Multi-Layer Detection Rings (Ensemble Autoencoder / Isolation Forest)
      const cx = w / 2;
      const cy = h / 2;
      const layers = [
        { r: 85, label: 'Layer 1: Statistical 3-Sigma', color: '#64748B' },
        { r: 62, label: 'Layer 2: Isolation Forest', color: '#C59B27' },
        { r: 40, label: 'Layer 3: Deep Autoencoder', color: '#10B981' }
      ];

      layers.forEach((l, idx) => {
        ctx.beginPath();
        ctx.arc(cx, cy, l.r, 0, Math.PI * 2);
        ctx.strokeStyle = l.color;
        ctx.lineWidth = 1.6;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Orbiting particle
        const angle = this.animTime * (idx % 2 === 0 ? 1 : -1) * 0.8 + idx;
        const ox = cx + Math.cos(angle) * l.r;
        const oy = cy + Math.sin(angle) * l.r;
        ctx.beginPath();
        ctx.arc(ox, oy, 4, 0, Math.PI * 2);
        ctx.fillStyle = l.color;
        ctx.fill();
      });

      // Core Detection Verdict
      ctx.beginPath();
      ctx.arc(cx, cy, 20, 0, Math.PI * 2);
      ctx.fillStyle = '#0F172A';
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 9px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CORE', cx, cy + 3);

    } else if (this.activeStep === 5) {
      // Step 5: Explain & Act Output Cards
      const cx = w / 2;
      const cy = h / 2;

      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(cx - 130, cy - 65, 260, 130, 14);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 14px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('AI INFERENCE REPORT', cx, cy - 35);

      ctx.font = '600 11px -apple-system, sans-serif';
      ctx.fillStyle = '#10B981';
      ctx.fillText('Anomaly Confidence: 98% (Critical)', cx, cy - 12);

      ctx.fillStyle = '#475569';
      ctx.font = '10px -apple-system, sans-serif';
      ctx.fillText('Root Cause: Sensor Spike (Thermistor Drift)', cx, cy + 10);
      ctx.fillText('Action: Immediate Field Calibration', cx, cy + 28);
      ctx.fillText('Sensor Health Index: 96% -> 88%', cx, cy + 45);
    }
  }

  animate() {
    this.update();
    this.draw();
    requestAnimationFrame(this.animate);
  }
}

window.PipelineVisualizerInstance = null;
window.initPipelineVisualizer = function() {
  if (!window.PipelineVisualizerInstance) {
    window.PipelineVisualizerInstance = new PipelineVisualizer();
  }
};
