/**
 * SkyGuard AI — Unified Comparative Chart Canvas Engine
 * Pure HTML5 Canvas 2D engine supporting interactive factor toggles,
 * dynamic multi-parameter y-axis scaling, real-time mouse hover tooltips,
 * and live rolling time-axis indicators.
 */

class UnifiedComparativeChart {
  constructor() {
    this.canvas = document.getElementById('unified-comparative-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.visibleLayers = {
      temp: true,
      hum: false,
      press: false,
      baseline: true,
      envelope: true
    };

    this.hoverIndex = null;

    this.initToggles();
    this.initMouseTracking();
    this.bindWindowResize();
    
    setTimeout(() => this.resizeCanvas(), 50);
  }

  initToggles() {
    const bindToggle = (id, key) => {
      const el = document.getElementById(id);
      if (el) {
        el.checked = this.visibleLayers[key];
        el.addEventListener('change', (e) => {
          this.visibleLayers[key] = e.target.checked;
          this.render();
        });
      }
    };

    bindToggle('toggle-temp', 'temp');
    bindToggle('toggle-hum', 'hum');
    bindToggle('toggle-press', 'press');
    bindToggle('toggle-baseline', 'baseline');
    bindToggle('toggle-envelope', 'envelope');
  }

  initMouseTracking() {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      
      const stream = window.OperationalStreamEngineInstance;
      const stId = stream ? stream.activeStation : 'AWS-JPR-04';
      const buffer = stream ? stream.getBuffer(stId) : [];
      if (!buffer || buffer.length === 0) return;

      const pad = { top: 25, right: 35, bottom: 30, left: 55 };
      const width = parseFloat(this.canvas.style.width) || 600;
      const plotW = width - pad.left - pad.right;

      const relX = mouseX - pad.left;
      const index = Math.round((relX / plotW) * (buffer.length - 1));

      if (index >= 0 && index < buffer.length) {
        this.hoverIndex = index;
        this.render();
      }
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.hoverIndex = null;
      this.render();
    });
  }

  bindWindowResize() {
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  resizeCanvas() {
    if (!this.canvas) return;
    const parent = this.canvas.parentElement;
    if (!parent) return;

    const width = parent.clientWidth || 600;
    const height = 320;
    const dpr = window.devicePixelRatio || 1;

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);

    this.render();
  }

  render() {
    if (!this.canvas || !this.ctx) return;

    const stream = window.OperationalStreamEngineInstance;
    const stId = stream ? stream.activeStation : 'AWS-JPR-04';
    const buffer = stream ? stream.getBuffer(stId) : [];

    const width = parseFloat(this.canvas.style.width) || 600;
    const height = parseFloat(this.canvas.style.height) || 320;

    const ctx = this.ctx;
    ctx.clearRect(0, 0, width, height);

    const pad = { top: 25, right: 35, bottom: 30, left: 55 };
    const plotW = width - pad.left - pad.right;
    const plotH = height - pad.top - pad.bottom;

    // Determine active scale based on checked layers
    let activeScale = { min: 15, max: 60, unit: '°C', label: 'Temperature' };
    if (this.visibleLayers.hum && !this.visibleLayers.temp && !this.visibleLayers.press) {
      activeScale = { min: 0, max: 100, unit: '%', label: 'Humidity' };
    } else if (this.visibleLayers.press && !this.visibleLayers.temp && !this.visibleLayers.hum) {
      activeScale = { min: 980, max: 1040, unit: ' hPa', label: 'Pressure' };
    } else if (this.visibleLayers.temp) {
      activeScale = { min: 15, max: 60, unit: '°C', label: 'Temperature' };
    } else if (this.visibleLayers.hum) {
      activeScale = { min: 0, max: 100, unit: '%', label: 'Humidity' };
    } else if (this.visibleLayers.press) {
      activeScale = { min: 980, max: 1040, unit: ' hPa', label: 'Pressure' };
    }

    const tempScale = { min: 15, max: 60 };
    const humScale = { min: 0, max: 100 };
    const pressScale = { min: 980, max: 1040 };

    const getY = (val, scale) => {
      const ratio = (val - scale.min) / (scale.max - scale.min);
      return pad.top + plotH - Math.max(0, Math.min(1, ratio)) * plotH;
    };

    const getX = (idx, total) => pad.left + (idx / Math.max(1, total - 1)) * plotW;

    // 1. Grid Lines & Dynamic Y-Axis Labels
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.8)';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#94A3B8';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'right';

    const steps = 4;
    for (let i = 0; i <= steps; i++) {
      const val = activeScale.min + (i / steps) * (activeScale.max - activeScale.min);
      const y = pad.top + plotH - (i / steps) * plotH;
      
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + plotW, y);
      ctx.stroke();

      let labelText = `${val.toFixed(0)}${activeScale.unit}`;
      ctx.fillText(labelText, pad.left - 6, y + 3.5);
    }

    ctx.fillStyle = '#64748B';
    ctx.font = 'bold 9.5px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Scale: ${activeScale.label} (${activeScale.unit})`, pad.left, pad.top - 10);

    // 2. Normal Daily Range Envelope
    if (this.visibleLayers.envelope && (this.visibleLayers.temp || (!this.visibleLayers.hum && !this.visibleLayers.press))) {
      const envTopY = getY(28.5, tempScale);
      const envBotY = getY(22.0, tempScale);

      ctx.fillStyle = 'rgba(46, 155, 115, 0.08)';
      ctx.fillRect(pad.left, envTopY, plotW, envBotY - envTopY);

      ctx.strokeStyle = 'rgba(46, 155, 115, 0.35)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(pad.left, envTopY);
      ctx.lineTo(pad.left + plotW, envTopY);
      ctx.moveTo(pad.left, envBotY);
      ctx.lineTo(pad.left + plotW, envBotY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 3. AI Baseline Imputation
    if (this.visibleLayers.baseline && (this.visibleLayers.temp || (!this.visibleLayers.hum && !this.visibleLayers.press))) {
      const baseVal = stId === 'AWS-CHE-12' ? 31.8 : 25.4;
      const baseY = getY(baseVal, tempScale);

      ctx.strokeStyle = '#2E9B73';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(pad.left, baseY);
      ctx.lineTo(pad.left + plotW, baseY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (!buffer || buffer.length === 0) return;

    // 4. Humidity Curve
    if (this.visibleLayers.hum) {
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      buffer.forEach((pt, idx) => {
        const x = getX(idx, buffer.length);
        const y = getY(pt.humidity || 50, humScale);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    // 5. Pressure Curve
    if (this.visibleLayers.press) {
      ctx.strokeStyle = '#C98A1C';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      buffer.forEach((pt, idx) => {
        const x = getX(idx, buffer.length);
        const y = getY(pt.pressure || 1010, pressScale);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    // 6. Temperature Curve & Anomaly Pins
    if (this.visibleLayers.temp) {
      ctx.strokeStyle = stId === 'AWS-JPR-04' ? '#D9534F' : '#2E9B73';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      buffer.forEach((pt, idx) => {
        const x = getX(idx, buffer.length);
        const y = getY(pt.temperature, tempScale);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      buffer.forEach((pt, idx) => {
        const x = getX(idx, buffer.length);
        const y = getY(pt.temperature, tempScale);

        ctx.beginPath();
        ctx.arc(x, y, pt.isAnomaly ? 4.5 : 2.5, 0, Math.PI * 2);
        ctx.fillStyle = pt.isAnomaly ? '#D9534F' : '#ffffff';
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = pt.isAnomaly ? '#D9534F' : '#2E9B73';
        ctx.stroke();

        if (pt.isAnomaly && idx % 3 === 0) {
          ctx.fillStyle = '#D9534F';
          ctx.font = 'bold 8.5px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('ANOMALY', x, y - 8);
        }
      });
    }

    // 7. Hover Tooltip Crosshair & Floating Box
    if (this.hoverIndex !== null && buffer[this.hoverIndex]) {
      const pt = buffer[this.hoverIndex];
      const hX = getX(this.hoverIndex, buffer.length);

      ctx.strokeStyle = 'rgba(23, 32, 30, 0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(hX, pad.top);
      ctx.lineTo(hX, pad.top + plotH);
      ctx.stroke();
      ctx.setLineDash([]);

      const boxW = 150;
      const boxH = 68;
      let boxX = hX + 12;
      let boxY = pad.top + 10;

      if (boxX + boxW > width - pad.right) {
        boxX = hX - boxW - 12;
      }

      ctx.fillStyle = 'rgba(23, 32, 30, 0.9)';
      ctx.strokeStyle = 'rgba(46, 155, 115, 0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxW, boxH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Time: ${pt.timeStr}`, boxX + 10, boxY + 16);

      ctx.font = '9.5px Inter, sans-serif';
      ctx.fillStyle = '#E2E8F0';
      ctx.fillText(`Temp: ${pt.temperature}°C`, boxX + 10, boxY + 32);
      ctx.fillText(`Humidity: ${pt.humidity}%`, boxX + 10, boxY + 46);
      ctx.fillText(`Pressure: ${pt.pressure} hPa`, boxX + 10, boxY + 60);
    }

    // 8. Timestamps & Live Rolling Ticker Indicator at bottom
    if (buffer.length > 1) {
      ctx.fillStyle = '#64748B';
      ctx.font = '9.5px "JetBrains Mono", monospace';
      
      ctx.textAlign = 'left';
      ctx.fillText(`Start: ${buffer[0].timeStr || ''}`, pad.left, height - 8);
      
      ctx.textAlign = 'right';
      const liveText = `● LIVE  ${buffer[buffer.length - 1].timeStr || ''}`;
      ctx.fillText(liveText, pad.left + plotW, height - 8);
    }
  }
}

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
