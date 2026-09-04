/**
 * SkyGuard AI — Real Weather Event vs Sensor Fault Comparison Laboratory
 * Interactive scenario switcher showing side-by-side meteorological physics vs hardware glitches.
 */

class RealVsAnomalyController {
  constructor() {
    this.scenarioBtns = document.querySelectorAll('.comparison-scenario-btn');

    // Weather Event Panel Elements
    this.weatherTitle = document.getElementById('weather-scenario-title');
    this.weatherDesc = document.getElementById('weather-scenario-desc');
    this.weatherList = document.getElementById('weather-indicator-list');

    // Sensor Anomaly Panel Elements
    this.anomalyTitle = document.getElementById('anomaly-scenario-title');
    this.anomalyDesc = document.getElementById('anomaly-scenario-desc');
    this.anomalyList = document.getElementById('anomaly-indicator-list');

    this.scenarios = {
      'storm-spike': {
        name: 'Pre-Monsoon Squall vs 55°C Spike',
        weather: {
          title: 'Genuine Squall Line / Convective Front',
          desc: 'A severe convective cell produces a gust front. As cold downdraft air reaches the ground, temperature plummets while humidity saturates.',
          indicators: [
            'Nearby stations within 20km report correlated temperature drops of 6°C – 9°C.',
            'Barometric pressure drops sharply by 4.8 hPa immediately before gust front arrival.',
            'Temporal transition duration is physically plausible (8–12 minutes).',
            'Relative humidity surges from 48% to 88% in thermodynamic alignment.'
          ]
        },
        anomaly: {
          title: 'Localized Thermistor Spike (55.2°C)',
          desc: 'A single AWS records an instantaneous reading of 55.2°C with no precursors. All atmospheric physics laws and regional stations contradict this event.',
          indicators: [
            'Only temperature sensor spikes; humidity and pressure remain completely motionless.',
            'All 4 neighboring stations within 15km report steady temperatures of 24.5°C.',
            'Spike occurs in < 10 seconds, violating thermal inertia of ambient air.',
            'Thermodynamic Clausius-Clapeyron calculation reveals impossible dew point (>44°C).'
          ]
        }
      },
      'cold-front': {
        name: 'Cold Front vs Sensor Drift',
        weather: {
          title: 'Synoptic Cold Frontal Passage',
          desc: 'Large-scale polar/western disturbance airmass displacement passing across the regional meteorological grid.',
          indicators: [
            'Simultaneous regional temperature depression of 5°C across 12 monitoring stations.',
            'Wind shear vector changes direction concurrently with pressure surge (+3.2 hPa).',
            'Dew point depression remains constant across entire mesonet.',
            'Rate of change conforms to standard synoptic frontal advection velocities.'
          ]
        },
        anomaly: {
          title: 'Capacitive Polymer Sensor Drift (+22%)',
          desc: 'Gradual accumulation of particulate matter on capacitive hygrometer substrate causing progressive gain offset.',
          indicators: [
            'Humidity reading steadily diverges +1.8% per week above regional mean.',
            'Surrounding weather stations show normal diurnal fluctuation between 40%–70%.',
            'Zero correlation with local barometric or precipitation sensor channels.',
            'AI drift tracking flags positive slope acceleration requiring calibration.'
          ]
        }
      },
      'microburst': {
        name: 'Microburst vs Barometer Port Jam',
        weather: {
          title: 'Thunderstorm Microburst Pressure Dome',
          desc: 'Intense localized downdraft causing a localized high-pressure bubble (meso-high) and surface divergent winds.',
          indicators: [
            'Pressure surges +4.5 hPa in 3 minutes, followed by intense rain gauge actuation.',
            'Adjacent Doppler radar and satellite channels confirm active cumulonimbus cloud top.',
            'Surrounding AWS nodes detect outward wind divergence.',
            'Pressure returns to ambient regional field after microburst dissipation.'
          ]
        },
        anomaly: {
          title: 'Barometer Port Blockage / Framing Error',
          desc: 'Inlet port blocked by debris or condensation, causing pressure readings to freeze at 992.0 hPa.',
          indicators: [
            'Pressure flatlines without natural atmospheric tidal micro-oscillations.',
            'Nearby stations record normal semi-diurnal barometric pressure tide (±1.5 hPa).',
            'No wind or cloud precursors present in optical or thermal imagery.',
            'Diagnostic error flag indicates sensor transducer impedance mismatch.'
          ]
        }
      }
    };

    this.init();
  }

  init() {
    this.scenarioBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.scenarioBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const key = btn.dataset.scenario;
        if (key && this.scenarios[key]) {
          this.renderScenario(key);
        }
      });
    });

    this.renderScenario('storm-spike');
  }

  renderScenario(key) {
    const sc = this.scenarios[key];
    if (!sc) return;

    if (this.weatherTitle) this.weatherTitle.innerText = sc.weather.title;
    if (this.weatherDesc) this.weatherDesc.innerText = sc.weather.desc;
    if (this.weatherList) {
      this.weatherList.innerHTML = sc.weather.indicators.map(ind => `
        <li class="indicator-item">
          <div class="indicator-icon">✓</div>
          <span>${ind}</span>
        </li>
      `).join('');
    }

    if (this.anomalyTitle) this.anomalyTitle.innerText = sc.anomaly.title;
    if (this.anomalyDesc) this.anomalyDesc.innerText = sc.anomaly.desc;
    if (this.anomalyList) {
      this.anomalyList.innerHTML = sc.anomaly.indicators.map(ind => `
        <li class="indicator-item">
          <div class="indicator-icon">✕</div>
          <span>${ind}</span>
        </li>
      `).join('');
    }
  }
}

window.RealVsAnomalyControllerInstance = null;
window.initRealVsAnomaly = function() {
  if (!window.RealVsAnomalyControllerInstance) {
    window.RealVsAnomalyControllerInstance = new RealVsAnomalyController();
  }
};
