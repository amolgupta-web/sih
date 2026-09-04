/**
 * SkyGuard AI — Investigation Mode Controller
 * Guides operators through step-by-step incident replay, raw vs imputed auditing,
 * ranked evidence stack, and the Reality Check comparison balance.
 */

class InvestigationController {
  constructor() {
    this.currentStepIdx = 3; // default at anomaly detection point
    this.isPlaying = false;
    this.playTimer = null;

    this.replaySteps = [
      { time: '14:31:30', val: '25.1°C', status: 'Nominal', isSpike: false, note: 'Normal diurnal fluctuation' },
      { time: '14:31:45', val: '25.3°C', status: 'Nominal', isSpike: false, note: 'Thermal stability verified' },
      { time: '14:32:00', val: '25.2°C', status: 'Nominal', isSpike: false, note: 'Pre-event baseline stable' },
      { time: '14:32:15', val: '55.2°C', status: 'Spike Flagged', isSpike: true, note: 'Instantaneous +30.0°C jump detected' },
      { time: '14:32:16', val: 'AI Sweep', status: 'Evaluating', isSpike: true, note: 'Cross-sensor & spatial checks initiated' },
      { time: '14:32:18', val: 'Classified', status: 'Critical Anomaly', isSpike: true, note: 'Root cause confirmed: Sensor Spike (98.4%)' }
    ];

    this.init();
  }

  init() {
    this.renderReplaySteps();
    this.bindControls();
  }

  bindControls() {
    const playBtn = document.getElementById('btn-replay-play');
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        this.togglePlay();
      });
    }

    const prevBtn = document.getElementById('btn-replay-prev');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        this.setStep(Math.max(0, this.currentStepIdx - 1));
      });
    }

    const nextBtn = document.getElementById('btn-replay-next');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.setStep(Math.min(this.replaySteps.length - 1, this.currentStepIdx + 1));
      });
    }

    // Technical details toggle
    const techToggle = document.getElementById('btn-toggle-tech-details');
    const techBox = document.getElementById('tech-details-box');
    if (techToggle && techBox) {
      techToggle.addEventListener('click', () => {
        const isHidden = techBox.style.display === 'none';
        techBox.style.display = isHidden ? 'block' : 'none';
        techToggle.innerText = isHidden ? 'Hide Technical Details ▲' : 'Show Advanced Technical Details (SHAP / Loss) ▼';
      });
    }
  }

  togglePlay() {
    const playBtn = document.getElementById('btn-replay-play');
    if (this.isPlaying) {
      clearInterval(this.playTimer);
      this.isPlaying = false;
      if (playBtn) playBtn.innerText = '▶ Replay Incident';
    } else {
      this.isPlaying = true;
      if (playBtn) playBtn.innerText = '❚❚ Pause';
      this.playTimer = setInterval(() => {
        if (this.currentStepIdx >= this.replaySteps.length - 1) {
          this.currentStepIdx = 0;
        } else {
          this.currentStepIdx++;
        }
        this.setStep(this.currentStepIdx);
      }, 1600);
    }
  }

  setStep(idx) {
    this.currentStepIdx = idx;
    this.renderReplaySteps();
  }

  renderReplaySteps() {
    const container = document.getElementById('replay-steps-container');
    const noteEl = document.getElementById('replay-step-note');
    if (!container) return;

    container.innerHTML = this.replaySteps.map((step, idx) => `
      <div class="replay-step-node ${idx === this.currentStepIdx ? 'active-step' : ''} ${step.isSpike ? 'is-spike' : ''}" onclick="window.InvestigationControllerInstance.setStep(${idx})">
        <span class="step-node-time">${step.time}</span>
        <span class="step-node-val">${step.val}</span>
        <span class="step-node-status">${step.status}</span>
      </div>
    `).join('');

    if (noteEl && this.replaySteps[this.currentStepIdx]) {
      noteEl.innerHTML = `<strong>Step ${this.currentStepIdx + 1} of 6:</strong> ${this.replaySteps[this.currentStepIdx].note}`;
    }
  }
}

window.InvestigationControllerInstance = null;
window.initInvestigation = function() {
  if (!window.InvestigationControllerInstance) {
    window.InvestigationControllerInstance = new InvestigationController();
  }
};
