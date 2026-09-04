/**
 * SkyGuard AI — Minimal Scientific Mercury Thermometer Cursor & Reaction Engine
 * Designed for professional environmental monitoring with subtle data-aware reactions.
 */

class ScientificMercuryCursor {
  constructor() {
    this.canvas = document.getElementById('cursor-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.enabled = true;
    this.pos = { x: -100, y: -100 };
    this.prevPos = { x: -100, y: -100 };
    this.speed = 0;

    // Mercury column height (0.0 to 1.0)
    this.mercuryLevel = 0.38;
    this.targetMercuryLevel = 0.38;
    this.scale = 1.0;
    this.targetScale = 1.0;

    // Fast-dissipating micro-particles
    this.particles = [];
    this.maxParticles = 24; // strictly restrained

    // Device check
    this.isTouch = window.matchMedia('(pointer: coarse)').matches;
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (this.isTouch || this.prefersReducedMotion) {
      this.enabled = false;
      return;
    }

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());

    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.setupDataHoverListeners();

    document.body.classList.add('custom-cursor-active');

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * window.devicePixelRatio;
    this.canvas.height = this.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  setupDataHoverListeners() {
    // Data-aware cursor responses
    document.addEventListener('mouseover', (e) => {
      // 1. Critical Anomaly Hover -> Mercury rises high
      if (e.target.closest('.badge-critical, .queue-item-card.crit, .replay-step-node.is-spike, .verdict-main')) {
        this.targetMercuryLevel = 0.88;
        this.targetScale = 1.15;
      }
      // 2. Temperature Data Hover -> Mercury adjusts subtly to ~0.55
      else if (e.target.closest('[data-channel="temp"], .temp-reading, .table-station-cell')) {
        this.targetMercuryLevel = 0.58;
        this.targetScale = 1.08;
      }
      // 3. General Interactive Button / Link
      else if (e.target.closest('button, a, select, input, .nav-tab-btn, .sim-btn')) {
        this.targetMercuryLevel = 0.48;
        this.targetScale = 1.05;
      }
    });

    document.addEventListener('mouseout', (e) => {
      const target = e.target.closest('button, a, select, input, .nav-tab-btn, .sim-btn, .badge-critical, [data-channel="temp"]');
      if (target) {
        this.targetMercuryLevel = 0.38;
        this.targetScale = 1.0;
      }
    });
  }

  onMouseMove(e) {
    if (!this.enabled) return;
    const prevX = this.pos.x;
    const prevY = this.pos.y;
    this.pos.x = e.clientX;
    this.pos.y = e.clientY;

    const dx = this.pos.x - prevX;
    const dy = this.pos.y - prevY;
    this.speed = Math.sqrt(dx * dx + dy * dy);

    // Subtle micro-droplets on movement
    if (this.speed > 2.5 && prevX > 0 && Math.random() > 0.4) {
      this.spawnDroplet(prevX, prevY);
    }
  }

  spawnDroplet(x, y) {
    if (this.particles.length >= this.maxParticles) {
      this.particles.shift();
    }

    const isRed = Math.random() > 0.4;
    this.particles.push({
      x: x + (Math.random() - 0.5) * 3,
      y: y + 12 + (Math.random() - 0.5) * 3,
      radius: Math.random() * 1.5 + 0.8,
      alpha: 0.5,
      decay: 0.045, // fast fading
      isRed
    });
  }

  update() {
    this.mercuryLevel += (this.targetMercuryLevel - this.mercuryLevel) * 0.14;
    this.scale += (this.targetScale - this.scale) * 0.16;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.alpha -= p.decay;
      p.y += 0.4; // gentle gravity

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    if (!this.enabled || this.pos.x < 0) return;

    // 1. Draw Subtle Particles
    for (const p of this.particles) {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = p.isRed ? `rgba(201, 79, 79, ${p.alpha})` : `rgba(255, 255, 255, ${p.alpha * 0.8})`;
      this.ctx.fill();
      this.ctx.restore();
    }

    // 2. Draw Scientific Thermometer Cursor
    const ctx = this.ctx;
    const x = this.pos.x;
    const y = this.pos.y;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(this.scale, this.scale);

    const stemW = 5;
    const stemH = 20;
    const bulbR = 4.8;
    const stemTop = -stemH + bulbR;
    const bulbY = bulbR;

    // Outer Glass Body Outline
    ctx.beginPath();
    ctx.arc(0, stemTop, stemW / 2, Math.PI, 0, false);
    ctx.lineTo(stemW / 2, bulbY - bulbR * 0.4);
    ctx.arc(0, bulbY, bulbR, -Math.PI * 0.25, Math.PI * 1.25, false);
    ctx.lineTo(-stemW / 2, stemTop);
    ctx.closePath();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fill();

    // Deep slate outline
    ctx.strokeStyle = '#17201E';
    ctx.lineWidth = 1.0;
    ctx.stroke();

    // Calibration Tick Marks
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(102, 113, 109, 0.7)';
    ctx.lineWidth = 0.7;
    for (let i = 0; i <= 3; i++) {
      const ty = stemTop + 3 + i * 3.5;
      ctx.moveTo(0.5, ty);
      ctx.lineTo(stemW / 2 - 0.5, ty);
    }
    ctx.stroke();

    // Red Mercury Bulb
    ctx.beginPath();
    ctx.arc(0, bulbY, bulbR - 1.2, 0, Math.PI * 2);
    ctx.fillStyle = '#C94F4F';
    ctx.fill();

    // Red Mercury Column
    const maxColH = (bulbY - bulbR * 0.5) - (stemTop + 2);
    const colH = maxColH * this.mercuryLevel;
    const colTop = (bulbY - bulbR * 0.5) - colH;

    ctx.beginPath();
    ctx.rect(-(stemW / 2 - 1.2), colTop, stemW - 2.4, colH + 2);
    ctx.fillStyle = '#C94F4F';
    ctx.fill();

    // Specular Reflection Line
    ctx.beginPath();
    ctx.moveTo(-stemW / 2 + 1, stemTop + 2);
    ctx.lineTo(-stemW / 2 + 1, bulbY - bulbR * 0.5);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    ctx.restore();
  }

  animate() {
    this.update();
    this.draw();
    requestAnimationFrame(this.animate);
  }

  toggle(forceState) {
    if (forceState !== undefined) this.enabled = forceState;
    else this.enabled = !this.enabled;

    if (this.enabled) {
      document.body.classList.add('custom-cursor-active');
    } else {
      document.body.classList.remove('custom-cursor-active');
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.particles = [];
    }
    return this.enabled;
  }
}

window.ScientificCursorInstance = null;
window.initScientificCursor = function() {
  if (!window.ScientificCursorInstance) {
    window.ScientificCursorInstance = new ScientificMercuryCursor();
  }
  return window.ScientificCursorInstance;
};
