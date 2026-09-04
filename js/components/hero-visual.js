/**
 * SkyGuard AI — Hero Interactive AWS Mast & Neural Data Particle Visualization
 * Renders an Automatic Weather Station with rotating anemometer, sensor radiation shield,
 * data packet particles flowing into the AI core, and scanning anomaly radar effects.
 */

class HeroVisualizer {
  constructor() {
    this.canvas = document.getElementById('hero-stream-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.particles = [];
    this.maxParticles = 80;
    this.anemometerAngle = 0;
    this.radarAngle = 0;
    this.isAnomalyScanActive = false;
    this.anomalyScanTimer = 0;

    // Elements
    this.tempValEl = document.getElementById('hero-val-temp');
    this.humValEl = document.getElementById('hero-val-hum');
    this.pressValEl = document.getElementById('hero-val-press');
    this.tempBadgeEl = document.getElementById('hero-badge-temp');
    this.humBadgeEl = document.getElementById('hero-badge-hum');
    this.pressBadgeEl = document.getElementById('hero-badge-press');
    this.tempCardEl = document.getElementById('hero-card-temp');
    this.bannerEl = document.getElementById('hero-anomaly-banner');

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Init particle flow
    for (let i = 0; i < 40; i++) {
      this.spawnDataParticle();
    }

    // Subscribe to stream updates for card values
    if (window.SkyGuardStreamEngineInstance) {
      window.SkyGuardStreamEngineInstance.subscribe((data) => {
        this.onStreamTick(data);
      });
    }

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = this.width * window.devicePixelRatio;
    this.canvas.height = this.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  spawnDataParticle() {
    // 3 streams: 0=Temperature (Mint), 1=Humidity (Blue), 2=Pressure (Gold)
    const streamType = Math.floor(Math.random() * 3);
    const stationX = this.width * 0.48;
    const stationY = 120 + Math.random() * 80;
    const coreX = this.width * 0.52;
    const coreY = this.height - 75;

    let color = 'rgba(16, 185, 129, ';
    if (streamType === 1) color = 'rgba(37, 99, 235, ';
    if (streamType === 2) color = 'rgba(197, 155, 39, ';
    if (this.isAnomalyScanActive && streamType === 0) color = 'rgba(239, 68, 68, ';

    this.particles.push({
      x: stationX + (Math.random() - 0.5) * 40,
      y: stationY,
      targetX: coreX,
      targetY: coreY,
      progress: Math.random() * 0.3,
      speed: 0.006 + Math.random() * 0.008,
      size: Math.random() * 2.5 + 1.5,
      color,
      streamType
    });
  }

  triggerAnomalyDemo() {
    this.isAnomalyScanActive = true;
    this.anomalyScanTimer = 160; // frames (~3-4s)

    // Update floating card to 55.2°C
    if (this.tempValEl) this.tempValEl.innerText = '55.2°C';
    if (this.tempBadgeEl) {
      this.tempBadgeEl.className = 'param-badge badge-red';
      this.tempBadgeEl.innerHTML = '<span class="pulse-dot" style="background:#EF4444"></span> Spike Flagged';
    }
    if (this.tempCardEl) this.tempCardEl.classList.add('is-anomaly');
    if (this.bannerEl) this.bannerEl.classList.add('active');

    // Reset after delay
    setTimeout(() => {
      this.isAnomalyScanActive = false;
      if (this.tempValEl) this.tempValEl.innerText = '24.6°C';
      if (this.tempBadgeEl) {
        this.tempBadgeEl.className = 'param-badge badge-mint';
        this.tempBadgeEl.innerHTML = '<span class="pulse-dot"></span> Normal';
      }
      if (this.tempCardEl) this.tempCardEl.classList.remove('is-anomaly');
      if (this.bannerEl) this.bannerEl.classList.remove('active');
    }, 4500);
  }

  onStreamTick(data) {
    if (this.isAnomalyScanActive) return; // don't overwrite during anomaly demo

    const reading = data.reading;
    if (this.tempValEl && reading.temp !== null) this.tempValEl.innerText = `${reading.temp}°C`;
    if (this.humValEl && reading.humidity !== null) this.humValEl.innerText = `${reading.humidity}%`;
    if (this.pressValEl && reading.pressure !== null) this.pressValEl.innerText = `${reading.pressure} hPa`;

    if (data.aiAnalysis.isAnomaly && data.aiAnalysis.rootCause === 'Sensor Spike') {
      this.triggerAnomalyDemo();
    }
  }

  update() {
    this.anemometerAngle += 0.07;
    this.radarAngle += 0.035;

    if (this.isAnomalyScanActive) {
      this.anomalyScanTimer--;
      if (this.anomalyScanTimer <= 0) this.isAnomalyScanActive = false;
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.progress += p.speed;

      // Arc interpolation towards core
      const t = p.progress;
      const midY = (p.targetY + 120) / 2;
      const curveX = (1 - t) * (1 - t) * p.x + 2 * (1 - t) * t * (p.targetX + (p.streamType === 0 ? -60 : p.streamType === 1 ? 60 : 0)) + t * t * p.targetX;
      const curveY = (1 - t) * (1 - t) * p.y + 2 * (1 - t) * t * midY + t * t * p.targetY;

      p.currX = curveX;
      p.currY = curveY;

      if (p.progress >= 1) {
        this.particles.splice(i, 1);
        this.spawnDataParticle();
      }
    }
  }

  draw() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.clearRect(0, 0, w, h);

    const mastX = w * 0.5;
    const mastTopY = 80;
    const mastBaseY = h - 60;

    // 1. Weather Station Mast (Clean minimal architectural tower)
    ctx.save();
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
    ctx.lineWidth = 2;

    // Vertical Central Mast
    ctx.beginPath();
    ctx.moveTo(mastX, mastTopY + 25);
    ctx.lineTo(mastX, mastBaseY);
    ctx.stroke();

    // Cross Braces (Truss pattern)
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.5)';
    const trussSteps = 4;
    for (let i = 0; i < trussSteps; i++) {
      const y1 = mastTopY + 70 + i * 45;
      const y2 = y1 + 45;
      ctx.beginPath();
      ctx.moveTo(mastX - 18, y1);
      ctx.lineTo(mastX + 18, y2);
      ctx.moveTo(mastX + 18, y1);
      ctx.lineTo(mastX - 18, y2);
      ctx.stroke();
    }

    // Solar Radiation Shield (Multi-tier louvers)
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = 'rgba(197, 155, 39, 0.4)';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 5; i++) {
      const ly = mastTopY + 80 + i * 8;
      ctx.beginPath();
      ctx.roundRect(mastX - 18, ly, 36, 5, 2);
      ctx.fill();
      ctx.stroke();
    }

    // Rotating 3-Cup Anemometer on Top
    ctx.save();
    ctx.translate(mastX, mastTopY + 25);
    ctx.rotate(this.anemometerAngle);
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1.6;
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3;
      const armLen = 22;
      const cupX = Math.cos(angle) * armLen;
      const cupY = Math.sin(angle) * armLen;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(cupX, cupY);
      ctx.stroke();

      // Hemisphere cup
      ctx.beginPath();
      ctx.arc(cupX, cupY, 5, angle + Math.PI / 2, angle - Math.PI / 2, false);
      ctx.fillStyle = '#64748B';
      ctx.fill();
    }
    ctx.restore();

    // Telemetry Antenna Waves
    ctx.save();
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
    ctx.lineWidth = 1.2;
    const waveCount = 3;
    for (let i = 1; i <= waveCount; i++) {
      const waveRadius = 12 + i * 14 + (Date.now() % 1500) / 100;
      const alpha = Math.max(0, 1 - waveRadius / 60);
      ctx.strokeStyle = `rgba(212, 175, 55, ${alpha * 0.4})`;
      ctx.beginPath();
      ctx.arc(mastX, mastTopY + 10, waveRadius, -Math.PI * 0.75, -Math.PI * 0.25);
      ctx.stroke();
    }
    ctx.restore();

    // 2. Data Particles Stream to AI Core
    for (const p of this.particles) {
      if (p.currX && p.currY) {
        ctx.beginPath();
        ctx.arc(p.currX, p.currY, p.size, 0, Math.PI * 2);
        const alpha = Math.sin(p.progress * Math.PI);
        ctx.fillStyle = p.color + alpha + ')';
        ctx.shadowColor = p.color + '0.5)';
        ctx.shadowBlur = 6;
        ctx.fill();
      }
    }

    // 3. Central AI Analysis Core at Base
    const coreX = mastX;
    const coreY = mastBaseY + 10;
    const coreRadius = 38;

    // Glowing Ambient Aura
    const auraGrad = ctx.createRadialGradient(coreX, coreY, 5, coreX, coreY, coreRadius + 25);
    if (this.isAnomalyScanActive) {
      auraGrad.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
      auraGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
    } else {
      auraGrad.addColorStop(0, 'rgba(212, 175, 55, 0.35)');
      auraGrad.addColorStop(0.5, 'rgba(16, 185, 129, 0.2)');
      auraGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    }
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(coreX, coreY, coreRadius + 25, 0, Math.PI * 2);
    ctx.fill();

    // Outer Core Ring with Neural Nodes
    ctx.strokeStyle = this.isAnomalyScanActive ? 'rgba(239, 68, 68, 0.8)' : 'rgba(212, 175, 55, 0.6)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(coreX, coreY, coreRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Scanning Radar Line
    ctx.save();
    ctx.translate(coreX, coreY);
    ctx.rotate(this.radarAngle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(coreRadius - 2, 0);
    ctx.strokeStyle = this.isAnomalyScanActive ? '#EF4444' : '#10B981';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Core Center Disc
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(coreX, coreY, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.1)';
    ctx.stroke();

    // AI Core Label
    ctx.fillStyle = this.isAnomalyScanActive ? '#EF4444' : '#0F172A';
    ctx.font = 'bold 9px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('AI CORE', coreX, coreY + 3);

    ctx.restore();
  }

  animate() {
    this.update();
    this.draw();
    requestAnimationFrame(this.animate);
  }
}

window.HeroVisualizerInstance = null;
window.initHeroVisualizer = function() {
  if (!window.HeroVisualizerInstance) {
    window.HeroVisualizerInstance = new HeroVisualizer();
  }
};
