/**
 * SkyGuard AI — Unified Comparative Chart Canvas Engine
 * High-performance lightweight 2D canvas chart renderer for real-time
 * multi-sensor streams, diurnal expectation bands, and anomaly flag pins.
 */

class UnifiedComparativeChart {
  constructor() {
    this.canvas = document.getElementById('unified-comparative-canvas');
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.data = null;
    this.activeChannels = {
      temp: true,
      humidity: true,
      pressure: true,
      imputed: true
    };

    this.padding = { top: 28, right: 36, bottom: 32, left: 44 };
    this.init();
  }

  init() {
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    this.bindTimeframeControls();
  }

  resizeCanvas() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    this.canvas.width = rect.width * dpr;
    this.canvas.height = (rect.height || 320) * dpr;
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height || 320}px`;

    this.ctx.scale(dpr, dpr);
    this.render();
  }

  bindTimeframeControls() {
    const btns = document.querySelectorAll('.timeframe-btn');
    btns.forEach((btn) => {
      btn.addEventListener('click', () => {
        btns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.render();
      });
    });
  }

  updateData(buffer) {
    this.data = buffer;
    this.render();
  }

  render() {
    if (!this.canvas || !this.ctx) return;
    const width = parseFloat(this.canvas.style.width);
    const height = parseFloat(this.canvas.style.height);
    const ctx = this.ctx;

    ctx.clearRect(0, 0, width, height);

    if (!this.data || !this.data.temp || this.data.temp.length === 0) {
      this.drawEmptyState(width, height);
      return;
    }

    const plotW = width - this.padding.left - this.padding.right;
    const plotH = height - this.padding.top - this.padding.bottom;

    // Determine Temperature Scale
    const minTemp = 15;
    const maxTemp = 60;

    const getY = (val) => {
      const clamped = Math.max(minTemp, Math.min(maxTemp, val));
      const ratio = (clamped - minTemp) / (maxTemp - minTemp);
      return this.padding.top + plotH - ratio * plotH;
    };

    const getX = (idx, total) => {
      return this.padding.left + (idx / (total - 1)) * plotW;
    };

    // 1. Draw Grid Lines and Y-Axis Scale
    this.drawGrid(ctx, width, height, plotW, plotH, minTemp, maxTemp, getY);

    // 2. Draw Diurnal Tolerance Band (Green Shaded Envelope: 22°C - 28°C)
    const bandTop = getY(27.5);
    const bandBottom = getY(22.0);
    ctx.fillStyle = 'rgba(46, 155, 115, 0.08)';
    ctx.fillRect(this.padding.left, bandTop, plotW, bandBottom - bandTop);

    // 3. Draw AI Imputed Baseline Reference Line (25.4°C)
    const imputedY = getY(25.4);
    ctx.strokeStyle = '#2E9B73';
    ctx.lineWidth = 1.8;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(this.padding.left, imputedY);
    ctx.lineTo(this.padding.left + plotW, imputedY);
    ctx.stroke();
    ctx.setLineDash([]);

    // 4. Draw Temperature Line & Anomaly Pins
    const totalPts = this.data.temp.length;
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = '#D9534F';
    ctx.beginPath();

    this.data.temp.forEach((val, i) => {
      const x = getX(i, totalPts);
      const y = getY(val);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // 5. Draw Points and Anomaly Badges
    this.data.temp.forEach((val, i) => {
      const x = getX(i, totalPts);
      const y = getY(val);
      const isAnomaly = val > 48.0 || (this.data.anomalies && this.data.anomalies.includes(i));

      ctx.beginPath();
      ctx.arc(x, y, isAnomaly ? 5 : 2.5, 0, Math.PI * 2);
      ctx.fillStyle = isAnomaly ? '#D9534F' : '#ffffff';
      ctx.fill();
      ctx.lineWidth = 1.6;
      ctx.strokeStyle = '#D9534F';
      ctx.stroke();

      if (isAnomaly && (i % 2 === 0 || i === totalPts - 1)) {
        ctx.fillStyle = '#D9534F';
        ctx.font = 'bold 9px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('ANOMALY', x, y - 10);
      }
    });

    // 6. Draw Timestamps on X-Axis
    if (this.data.timestamps) {
      ctx.fillStyle = '#94A3B8';
      ctx.font = '9.5px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(this.data.timestamps[0] || '', this.padding.left, height - 10);

      ctx.textAlign = 'right';
      ctx.fillText(
        this.data.timestamps[this.data.timestamps.length - 1] || '',
        this.padding.left + plotW,
        height - 10
      );
    }
  }

  drawGrid(ctx, width, height, plotW, plotH, minTemp, maxTemp, getY) {
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.7)';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#94A3B8';
    ctx.font = '10px "Inter", sans-serif';
    ctx.textAlign = 'right';

    const steps = [15, 30, 45, 60];
    steps.forEach((val) => {
      const y = getY(val);
      ctx.beginPath();
      ctx.moveTo(this.padding.left, y);
      ctx.lineTo(this.padding.left + plotW, y);
      ctx.stroke();

      ctx.fillText(`${val}°`, this.padding.left - 8, y + 3.5);
    });
  }

  drawEmptyState(width, height) {
    this.ctx.fillStyle = '#94A3B8';
    this.ctx.font = '12px "Inter", sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Streaming telemetry data...', width / 2, height / 2);
  }
}

// Global Singleton Setup
window.UnifiedComparativeChartInstance = null;

window.initUnifiedChart = function () {
  if (!window.UnifiedComparativeChartInstance) {
    window.UnifiedComparativeChartInstance = new UnifiedComparativeChart();
  }
  return window.UnifiedComparativeChartInstance;
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.initUnifiedChart());
} else {
  window.initUnifiedChart();
}
