/**
 * SkyGuard AI — Unified Multi-Sensor Comparative Chart
 * Plots Temperature, Humidity, and Atmospheric Pressure on a synchronized comparative timeline
 * with expected normal tolerance bands, raw readings, and AI imputed values.
 */

class UnifiedComparativeChart {
  constructor(canvasId) {
    this.canvasId = canvasId;
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

    // Channels configuration
    this.channels = {
      temp: { label: 'Temperature', unit: '°C', color: '#C94F4F', active: true, min: 15, max: 60, expMin: 22, expMax: 28 },
      humidity: { label: 'Humidity', unit: '%', color: '#2563EB', active: true, min: 20, max: 100, expMin: 35, expMax: 75 },
      pressure: { label: 'Pressure', unit: ' hPa', color: '#C98A1C', active: true, min: 990, max: 1030, expMin: 1004, expMax: 1020 }
    };

    this.data = {
      timestamps: [],
      temp: [],
      imputedTemp: [],
      humidity: [],
      pressure: [],
      anomalies: []
    };

    this.hoverIdx = -1;
    this.width = 880;
    this.height = 320;

    if (this.canvas) {
      this.init();
    }
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Observe container in case layout evaluates late
    if (window.ResizeObserver && this.canvas.parentElement) {
      const ro = new ResizeObserver(() => this.resize());
      ro.observe(this.canvas.parentElement);
    }

    this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.canvas.addEventListener('mouseleave', () => {
      this.hoverIdx = -1;
      this.render();
    });

    this.bindStreamEngine();
  }

  bindStreamEngine() {
    const attach = () => {
      if (window.OperationalStreamEngineInstance) {
        const stationId = window.OperationalStreamEngineInstance.activeStationId || 'AWS-JPR-04';
        const buffer = window.OperationalStreamEngineInstance.stationBuffers?.[stationId];
        if (buffer) {
          this.updateData(buffer);
        }

        // Subscribe to live frame updates
        window.OperationalStreamEngineInstance.subscribe((payload) => {
          if (payload && payload.buffer) {
            this.updateData(payload.buffer);
          }
        });
      } else {
        setTimeout(attach, 100);
      }
    };
    attach();
  }

  resize() {
    if (!this.canvas) {
      this.canvas = document.getElementById(this.canvasId);
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
    }

    const parent = this.canvas.parentElement;
    const rect = parent ? parent.getBoundingClientRect() : null;

    this.width = rect && rect.width > 50 ? rect.width : (this.canvas.clientWidth || 880);
    this.height = rect && rect.height > 50 ? rect.height : 320;

    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = Math.floor(this.width * dpr);
    this.canvas.height = Math.floor(this.height * dpr);

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);

    this.render();
  }

  updateData(buffer) {
    if (!buffer) return;
    this.data = buffer;
    this.render();
  }

  onMouseMove(e) {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;

    const padLeft = 45;
    const padRight = 45;
    const chartW = this.width - padLeft - padRight;
    const count = this.data.timestamps ? this.data.timestamps.length : 0;

    if (count > 1) {
      const step = chartW / (count - 1);
      const idx = Math.round((x - padLeft) / step);
      if (idx >= 0 && idx < count) {
        this.hoverIdx = idx;
        this.render();
      }
    }
  }

  render() {
    if (!this.ctx || !this.width || !this.height) return;

    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.clearRect(0, 0, w, h);

    const padTop = 20;
    const padBottom = 30;
    const padLeft = 45;
    const padRight = 45;
    const chartW = w - padLeft - padRight;
    const chartH = h - padTop - padBottom;

    if (!this.data.timestamps || this.data.timestamps.length < 2) return;

    // 1. Grid Rows
    ctx.strokeStyle = '#EEF2F0';
    ctx.lineWidth = 1;
    const gridRows = 4;
    for (let i = 0; i <= gridRows; i++) {
      const y = padTop + (chartH / gridRows) * i;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(w - padRight, y);
      ctx.stroke();
    }

    const getY = (val, cfg) => {
      const clamped = Math.max(cfg.min, Math.min(cfg.max, val));
      const norm = (clamped - cfg.min) / (cfg.max - cfg.min);
      return padTop + chartH - norm * chartH;
    };

    const getX = (idx) => {
      return padLeft + (idx / (this.data.timestamps.length - 1)) * chartW;
    };

    // 2. Expected Normal Range Band for Temperature (22°C – 28°C)
    const expTop = getY(this.channels.temp.expMax, this.channels.temp);
    const expBottom = getY(this.channels.temp.expMin, this.channels.temp);
    ctx.fillStyle = 'rgba(46, 155, 115, 0.08)';
    ctx.fillRect(padLeft, expTop, chartW, expBottom - expTop);

    // 3. Sensor Channel Lines
    const drawLine = (vals, cfg, isDashed = false) => {
      ctx.save();
      ctx.beginPath();
      if (isDashed) ctx.setLineDash([4, 4]);

      for (let i = 0; i < vals.length; i++) {
        const val = vals[i];
        if (val === null || val === undefined) continue;
        const x = getX(i);
        const y = getY(val, cfg);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.strokeStyle = cfg.color;
      ctx.lineWidth = isDashed ? 1.8 : 2.0;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
      ctx.restore();
    };

    if (this.channels.pressure.active) {
      drawLine(this.data.pressure, this.channels.pressure);
    }
    if (this.channels.humidity.active) {
      drawLine(this.data.humidity, this.channels.humidity);
    }
    if (this.channels.temp.active) {
      drawLine(this.data.temp, this.channels.temp);
    }

    // 4. AI Imputed Values Line (Green Dashed Overlay)
    const hasImputed = this.data.imputedTemp && this.data.imputedTemp.some(v => v !== null);
    if (hasImputed) {
      ctx.save();
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 2.0;

      let started = false;
      for (let i = 0; i < this.data.imputedTemp.length; i++) {
        const val = this.data.imputedTemp[i] !== null ? this.data.imputedTemp[i] : this.data.temp[i];
        const x = getX(i);
        const y = getY(val, this.channels.temp);
        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      ctx.restore();
    }

    // 5. Anomaly Spike Pins
    if (this.data.anomalies && this.data.anomalies.length > 0) {
      for (const anomIdx of this.data.anomalies) {
        if (anomIdx >= 0 && anomIdx < this.data.temp.length) {
          const x = getX(anomIdx);
          const y = getY(this.data.temp[anomIdx], this.channels.temp);

          ctx.save();
          // Halo
          ctx.beginPath();
          ctx.arc(x, y, 9, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(201, 79, 79, 0.25)';
          ctx.fill();

          // Dot
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, Math.PI * 2);
          ctx.fillStyle = '#C94F4F';
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2;
          ctx.fill();
          ctx.stroke();

          // Tag
          ctx.fillStyle = '#C94F4F';
          ctx.font = '700 9px -apple-system, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('ANOMALY', x, y - 12);
          ctx.restore();
        }
      }
    }

    // 6. Hover Crosshair & Tooltip Card
    if (this.hoverIdx >= 0 && this.hoverIdx < this.data.timestamps.length) {
      const idx = this.hoverIdx;
      const hX = getX(idx);
      const time = this.data.timestamps[idx];
      const tVal = this.data.temp[idx];
      const hVal = this.data.humidity[idx];
      const pVal = this.data.pressure[idx];
      const impVal = this.data.imputedTemp[idx];
      const isAnom = this.data.anomalies && this.data.anomalies.includes(idx);

      ctx.save();
      ctx.beginPath();
      ctx.setLineDash([2, 2]);
      ctx.moveTo(hX, padTop);
      ctx.lineTo(hX, padTop + chartH);
      ctx.strokeStyle = '#929E9A';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      const cardW = 190;
      const cardH = impVal ? 84 : 68;
      let cardX = hX + 12;
      if (cardX + cardW > w - padRight) cardX = hX - cardW - 12;
      const cardY = padTop + 10;

      ctx.save();
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = isAnom ? '#C94F4F' : '#E2E8E5';
      ctx.lineWidth = isAnom ? 1.5 : 1.0;
      ctx.shadowColor = 'rgba(23, 32, 30, 0.08)';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#17201E';
      ctx.font = '700 10px -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${time} ${isAnom ? '— ANOMALY DETECTED' : '— Nominal'}`, cardX + 10, cardY + 16);

      ctx.font = '500 10px -apple-system, sans-serif';
      ctx.fillStyle = '#C94F4F';
      ctx.fillText(`Temp: ${tVal}°C ${isAnom ? '(Observed)' : ''}`, cardX + 10, cardY + 32);

      if (impVal) {
        ctx.fillStyle = '#10B981';
        ctx.fillText(`AI Imputed: ${impVal}°C (91% conf)`, cardX + 10, cardY + 46);
      }

      const offsetNext = impVal ? 62 : 48;
      ctx.fillStyle = '#2563EB';
      ctx.fillText(`Humidity: ${hVal}%`, cardX + 10, cardY + offsetNext);

      ctx.fillStyle = '#C98A1C';
      ctx.fillText(`Pressure: ${pVal} hPa`, cardX + 105, cardY + offsetNext);

      ctx.restore();
    }
  }
}

// Global Singleton Initialization
window.UnifiedComparativeChartInstance = null;

window.initUnifiedChart = function() {
  const canvas = document.getElementById('unified-comparative-canvas');
  if (!canvas) return null;

  if (!window.UnifiedComparativeChartInstance) {
    window.UnifiedComparativeChartInstance = new UnifiedComparativeChart('unified-comparative-canvas');
  }

  if (window.OperationalStreamEngineInstance) {
    const stationId = window.OperationalStreamEngineInstance.activeStationId || 'AWS-JPR-04';
    const buffer = window.OperationalStreamEngineInstance.stationBuffers?.[stationId];
    if (buffer) {
      window.UnifiedComparativeChartInstance.updateData(buffer);
    }
  }

  return window.UnifiedComparativeChartInstance;
};

// Auto-bootstrap
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.initUnifiedChart());
} else {
  window.initUnifiedChart();
}
