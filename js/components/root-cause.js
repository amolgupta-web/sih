/**
 * SkyGuard AI — Root Cause Classification Matrix
 * Interactive neural diagnostic selector showing failure wave patterns and physical explanations.
 */

class RootCauseController {
  constructor() {
    this.canvas = document.getElementById('rc-waveform-canvas');
    if (this.canvas) this.ctx = this.canvas.getContext('2d');

    this.titleEl = document.getElementById('rc-detail-title');
    this.confEl = document.getElementById('rc-detail-conf');
    this.descEl = document.getElementById('rc-detail-desc');
    this.chips = document.querySelectorAll('.root-cause-chip');

    this.causes = {
      'spike': {
        title: 'Sensor Spike',
        confidence: 94,
        type: 'Transient Voltage / Electrical Impulse',
        desc: 'Instantaneous deviation exceeding 5σ with immediate fallback. Caused by electromagnetic interference (EMI), lightning-induced transient voltage, or faulty ADC grounding.',
        waveType: 'spike'
      },
      'frozen': {
        title: 'Frozen / Stuck Sensor',
        confidence: 96,
        type: 'Firmware Buffer Deadlock / Transducer Lockup',
        desc: 'Zero variance over 15+ consecutive cycles. Caused by I2C/SPI bus lockup, firmware FIFO buffer stalling, or mechanical obstruction in the transducer port.',
        waveType: 'frozen'
      },
      'comm': {
        title: 'Communication Error',
        confidence: 89,
        type: 'UART / Modbus Frame Corruption',
        desc: 'Cyclic parity discrepancies, incomplete byte buffers, or intermittent transmission timeouts between weather station data logger and cellular modem.',
        waveType: 'comm'
      },
      'drift': {
        title: 'Gradual Sensor Drift',
        confidence: 87,
        type: 'Chemical / Mechanical Material Aging',
        desc: 'Slow, monotonic divergence from regional ensemble baseline. Common in capacitive humidity polymers suffering particulate deposition or thermistor resistance drift.',
        waveType: 'drift'
      },
      'missing': {
        title: 'Missing Data Packets',
        confidence: 99,
        type: 'Network Telemetry Dropout',
        desc: 'Solar battery voltage drop or cellular carrier signal fading causing transmission blackouts during telemetry upload windows.',
        waveType: 'missing'
      },
      'env': {
        title: 'Environmental Event',
        confidence: 95,
        type: 'Genuine Atmospheric Phenomena',
        desc: 'Coherent physical transitions corroborated across temperature, humidity, and barometric channels with neighboring station correlation (e.g., gust front or squall line).',
        waveType: 'env'
      },
      'calib': {
        title: 'Calibration Error',
        confidence: 91,
        type: 'Zero-Point / Gain Scalar Offset',
        desc: 'Persistent constant linear offset introduced during improper field calibration or incorrect coefficient loading in station configuration firmware.',
        waveType: 'calib'
      },
      'hw_fail': {
        title: 'Hardware Failure',
        confidence: 98,
        type: 'Permanent Circuit Disconnection',
        desc: 'Sustained full-scale high (e.g., 999.9°C) or low (-999.9°C) readings indicating open circuit, severed probe wire, or waterlogged PCB sensor housing.',
        waveType: 'hw_fail'
      }
    };

    this.activeKey = 'spike';
    this.init();
  }

  init() {
    this.chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const key = chip.dataset.cause;
        if (key && this.causes[key]) {
          this.selectCause(key);
        }
      });
    });

    this.selectCause('spike');
  }

  selectCause(key) {
    this.activeKey = key;
    const data = this.causes[key];

    this.chips.forEach(c => {
      if (c.dataset.cause === key) c.classList.add('active');
      else c.classList.remove('active');
    });

    if (this.titleEl) this.titleEl.innerText = data.title;
    if (this.confEl) this.confEl.innerText = `Confidence: ${data.confidence}%`;
    if (this.descEl) this.descEl.innerText = data.desc;

    this.drawWaveform(data.waveType);
  }

  drawWaveform(type) {
    if (!this.canvas || !this.ctx) return;
    const ctx = this.ctx;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio;
    this.canvas.height = 120 * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const w = rect.width;
    const h = 120;
    ctx.clearRect(0, 0, w, h);

    // Baseline grid
    ctx.strokeStyle = '#F1F5F9';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const points = 80;
    const step = w / points;

    for (let i = 0; i <= points; i++) {
      const x = i * step;
      let y = h / 2;

      if (type === 'spike') {
        // Flat nominal noise with sudden sharp spike at index 45
        const noise = Math.sin(i * 0.4) * 4;
        if (i === 44) y = h / 2 - 15;
        else if (i === 45) y = 14; // extreme spike
        else if (i === 46) y = h / 2 - 10;
        else y = h / 2 + noise;
      } else if (type === 'frozen') {
        // Normal micro-noise up to index 30, then dead flat horizontal line
        if (i < 30) y = h / 2 + Math.sin(i * 0.5) * 6;
        else y = h / 2 + 2; // frozen flatline
      } else if (type === 'drift') {
        // Continuous upward slope drift
        const trend = (i / points) * (h * 0.6);
        const noise = Math.sin(i * 0.6) * 3;
        y = (h - 20) - trend + noise;
      } else if (type === 'comm') {
        // Erratic jagged noise bursts
        if (i > 35 && i < 55) {
          y = (i % 2 === 0) ? 18 : h - 18;
        } else {
          y = h / 2 + Math.sin(i * 0.3) * 5;
        }
      } else if (type === 'missing') {
        // Gap in data
        if (i > 35 && i < 50) {
          ctx.stroke();
          ctx.beginPath();
          continue;
        }
        y = h / 2 + Math.sin(i * 0.4) * 4;
      } else if (type === 'env') {
        // Smooth physically realistic sigmoidal transition
        const t = (i - points / 2) / 8;
        const sigmoid = 1 / (1 + Math.exp(-t));
        y = 25 + sigmoid * (h - 50) + Math.sin(i * 0.3) * 3;
      } else if (type === 'calib') {
        // Clean line with constant 20px offset
        y = h / 2 - 22 + Math.sin(i * 0.3) * 4;
      } else if (type === 'hw_fail') {
        // Saturated at ceiling or floor
        if (i > 25) y = 10;
        else y = h / 2 + Math.sin(i * 0.4) * 5;
      }

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.strokeStyle = type === 'spike' || type === 'hw_fail' ? '#EF4444' : type === 'env' ? '#10B981' : '#C59B27';
    ctx.stroke();
  }
}

window.RootCauseControllerInstance = null;
window.initRootCause = function() {
  if (!window.RootCauseControllerInstance) {
    window.RootCauseControllerInstance = new RootCauseController();
  }
};
