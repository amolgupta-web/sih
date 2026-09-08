/**
 * SkyGuard AI — Unified Comparative Canvas Chart
 * High-performance DPI-aware HTML5 Canvas renderer for multi-parameter mesonet telemetry.
 * Displays real-time rolling curves for Temperature, Humidity, Pressure, Diurnal Confidence Bands,
 * and AI Anomaly Highlights.
 */

class UnifiedComparativeChart {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.buffer = null;
    this.timeRange = '3h'; // Set default filter to 3h

    this.initCanvas();
    this.bindEvents();
    this.bindStreamEngine();
  }

  initCanvas() {
    this.resizeCanvas();
    this.resizeObserver = new ResizeObserver(() => this.resizeCanvas());
    if (this.canvas.parentElement) {
      this.resizeObserver.observe(this.canvas.parentElement);
    }
  }

  resizeCanvas() {
    if (!this.canvas || !this.canvas.parentElement) return;

    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    this.width = rect.width || 800;
    this.height = rect.height || 320;

    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;

    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.resetTransform();
    this.ctx.scale(dpr, dpr);

    this.render();
  }

  bindEvents() {
    // Range selector click buttons
    const rangeBtns = document.querySelectorAll('.chart-timeframe-controls .time-btn');
    rangeBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        rangeBtns.forEach((b) => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.timeRange = e.currentTarget.dataset.range || '3h';
        this.render();
      });
    });
  }

  bindStreamEngine() {
    const attach = () => {
      if (window.OperationalStreamEngineInstance) {
        const activeId = window.OperationalStreamEngineInstance.activeStationId || 'AWS-JPR-04';
        const activeBuffer = window.OperationalStreamEngineInstance.stationBuffers?.[activeId];
        if (activeBuffer) {
          this.updateData(activeBuffer);
        }
      } else {
        setTimeout(attach, 100);
      }
    };
    attach();
  }

  updateData(buffer) {
    this.buffer = buffer;
    this.render();
  }

  render() {
    if (!this.ctx || !this.width || !this.height) return;

    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.clearRect(0, 0, w, h);

    const padLeft = 46;
    const padRight = 24;
    const padTop = 32;
    const padBottom = 34;

    const plotW = w - padLeft - padRight;
    const plotH = h - padTop - padBottom;

    // Background Grid
    ctx.strokeStyle = '#EEF2F6';
    ctx.lineWidth = 1;
    const gridRows = 4;
    for (let i = 0; i <= gridRows; i++) {
      const y = padTop + (plotH / gridRows) * i;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(w - padRight, y);
      ctx.stroke();

      // Left Axis Value (0°C to 60°C)
      ctx.fillStyle = '#94A3B8';
      ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'right';
      const labelVal = Math.round(60 - (60 / gridRows) * i);
      ctx.fillText(`${labelVal}°`, padLeft - 8, y + 3);
    }

    if (!this.buffer || !this.buffer.temp || this.buffer.temp.length === 0) {
      return;
    }

    const temps = this.buffer.temp;
    const len = temps.length;
    const stepX = plotW / Math.max(1, len - 1);

    // 1. Shaded Expected Diurnal Baseline Band (22°C to 28°C)
    const yBaselineTop = padTop + plotH * (1 - 28 / 60);
    const yBaselineBottom = padTop + plotH * (1 - 22 / 60);

    ctx.fillStyle = 'rgba(46, 155, 115, 0.08)';
    ctx.fillRect(padLeft, yBaselineTop, plotW, yBaselineBottom - yBaselineTop);

    // 2. AI Imputed Dotted Line (25.4°C)
    const yImputed = padTop + plotH * (1 - 25.4 / 60);
    ctx.beginPath();
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = '#2E9B73';
    ctx.lineWidth = 2;
    ctx.moveTo(padLeft, yImputed);
    ctx.lineTo(w - padRight, yImputed);
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. Humidity Secondary Curve (Scaled 0-100% to lower third)
    if (this.buffer.humidity && this.buffer.humidity.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.45)';
      ctx.lineWidth = 1.8;
      this.buffer.humidity.forEach((hum, idx) => {
        const x = padLeft + idx * stepX;
        const y = padTop + plotH - (hum / 100) * (plotH * 0.35);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    // 4. Pressure Curve (Scaled around 1000-1020 hPa to bottom area)
    if (this.buffer.pressure && this.buffer.pressure.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(201, 138, 28, 0.55)';
      ctx.lineWidth = 1.8;
      this.buffer.pressure.forEach((press, idx) => {
        const x = padLeft + idx * stepX;
        const normalizedP = Math.max(0, Math.min(1, (press - 980) / 40));
        const y = padTop + plotH * 0.7 - normalizedP * (plotH * 0.2);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    // 5. Active Primary Temperature Trajectory
    ctx.beginPath();
    ctx.strokeStyle = '#D9534F';
    ctx.lineWidth = 2.4;
    temps.forEach((t, idx) => {
      const x = padLeft + idx * stepX;
      const y = padTop + plotH * (1 - Math.min(60, Math.max(0, t)) / 60);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // 6. Draw Points and Anomaly Pins
    temps.forEach((t, idx) => {
      const x = padLeft + idx * stepX;
      const y = padTop + plotH * (1 - Math.min(60, Math.max(0, t)) / 60);

      const isAnomaly = this.buffer.anomalies && this.buffer.anomalies.includes(idx);

      ctx.beginPath();
      ctx.arc(x, y, isAnomaly ? 5 : 3, 0, Math.PI * 2);
      ctx.fillStyle = isAnomaly ? '#C94F4F' : '#FFFFFF';
      ctx.strokeStyle = '#C94F4F';
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();

      // Only draw the anomaly label pin if specifically flagged
      if (isAnomaly) {
        ctx.fillStyle = '#C94F4F';
        ctx.font = 'bold 9px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('ANOMALY', x, y - 10);
      }
    });

    // 7. Timeline X-Axis Labels (Display last, middle, first)
    if (this.buffer.timestamps && this.buffer.timestamps.length > 0) {
      ctx.fillStyle = '#94A3B8';
      ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

      const stamps = this.buffer.timestamps;
      const mid = Math.floor(stamps.length / 2);

      ctx.textAlign = 'left';
      ctx.fillText(stamps[0] || '', padLeft, h - 10);

      ctx.textAlign = 'center';
      ctx.fillText(stamps[mid] || '', padLeft + plotW / 2, h - 10);

      ctx.textAlign = 'right';
      ctx.fillText(stamps[stamps.length - 1] || '', w - padRight, h - 10);
    }
  }

  destroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }
}

// Global Chart Singleton Setup
window.UnifiedComparativeChartInstance = null;

window.initUnifiedChart = function () {
  if (!window.UnifiedComparativeChartInstance) {
    window.UnifiedComparativeChartInstance = new UnifiedComparativeChart('unified-comparative-canvas');
  }
  return window.UnifiedComparativeChartInstance;
};

// Bootstrap when DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.initUnifiedChart());
} else {
  window.initUnifiedChart();
}
