# SkyGuard AI — Weather Data Trust Intelligence

**Problem Statement 73 (PS 73): AI/ML-Based Intelligent Anomaly Detection for Automatic Weather Stations (AWS)**  
**Tagline**: *“From Weather Data to Trusted Decisions.”*  
**Product Promise**: *“Continuously determining whether your weather station is measuring reality — or reporting a problem.”*

---

## 🧭 Core Product Positioning: “Can I trust this weather data?”

Automatic Weather Stations (AWS) provide critical ground truth for national numerical weather prediction (NWP) models, civil flood/cyclone warning systems, and aviation routing. However, extreme thermal gradients, condensation, and electrical noise routinely trigger abnormal readings.

Conventional threshold systems fail to answer the operational question:
> **"Is this reading a genuine meteorological event (e.g. squall line, microburst, cold front) or an isolated hardware sensor failure?"**

SkyGuard AI guides meteorological network operators, environmental data scientists, and field maintenance teams through the complete operational decision journey:

```
LIVE READING
     ↓
DATA TRUST ASSESSMENT (0 - 100)
     ↓
ANOMALY DETECTION (3σ + Autoencoder + Isolation Forest)
     ↓
AI INVESTIGATION MODE
     ↓
EVIDENCE & EXPLANATION (SHAP Attribution & Physics Rules)
     ↓
REAL WEATHER EVENT OR SENSOR FAULT (Reality Check)
     ↓
ROOT CAUSE CLASSIFICATION
     ↓
SENSOR HEALTH IMPACT (90-Day Degradation Timeline)
     ↓
RECOMMENDED ACTION & WORK ORDER DISPATCH (P1 / P2 / P3)
```

---

## 🎨 Enterprise Environmental Design Language

Built with a calm, scientific, enterprise-grade environmental palette:
* **Main Background**: Warm cloud white (`#F7F8F6`) — non-glare, operational workspace.
* **Secondary Surface**: Pale slate (`#EEF2F0`) for control clusters and inactive tabs.
* **Primary Brand Accent**: Deep environmental teal (`#0F766E`) for primary actions, active navigation, and key positive states.
* **Healthy / Trusted**: Soft emerald green (`#2E9B73`, background `#E6F5ED`).
* **Monitoring / Attention**: Professional amber (`#C98A1C`, background `#FFF4DC`).
* **Critical Anomaly**: Controlled scientific red (`#C94F4F`, background `#FCEBEC`).
* **Primary Text**: Deep slate (`#17201E`) for maximum contrast and legibility.
* **Custom Scientific Mercury Thermometer Cursor**: Thin outline with deep slate glass body and responsive red mercury level that reacts dynamically to data trust levels.

---

## 📂 The 6 Domain-Specific Operational Workflows

### 1. Command Center (`#command-center`)
* **Network Trust Metric**: Prominent horizontal confidence bar (**94.8 / 100**) with algorithmic breakdown (*"Based on live sensor reliability, anomaly activity, data continuity, and network consistency"*).
* **Network Summary**: `24 Active Stations` | `72 Monitored Sensors` | `03 Require Attention` | `98.2% Trusted Data`.
* **Unified Multi-Sensor Comparative Chart**: Synchronized comparative time-series tracking of Temperature, Humidity, and Pressure with normal operating tolerance bands, observed readings, and AI imputed values.
* **Actionable AI Attention Queue**: Prioritized queue on the right sidebar with direct one-click deep links (`Investigate Incident →`, `Review Drift Trend →`, `Check Modem Telemetry →`).

### 2. Live Network (`#live-network`)
* **Hybrid Directory Table**: Lists station ID, geographic location, current measurements, Data Trust Score, and status.
* **Geographic Mesonet Vector Map**: Interactive topology map of monitoring nodes across India / regional grid with status indicator dots.

### 3. Investigate — Incident Investigation Mode (`#investigate`)
* **Incident Header**: Station ID (`AWS-JPR-04`), Parameter (`Temperature`), Observed Reading (`55.2°C`), Timestamp (`14:32:18`).
* **AI Verdict**: `PROBABLE SENSOR ANOMALY` | `Confidence: 98.4%` | `Severity: CRITICAL` | `Root Cause: SUDDEN SENSOR SPIKE`.
* **Raw vs Imputed (AI Estimated) Data Audit Card**:
  * Raw Sensor Value: `55.2°C`
  * AI Estimated (Imputed) Value: `25.4°C` (Confidence: `91%`)
  * Data Integrity Guarantee: *"Original raw sensor reading preserved for audit."*
* **Interactive Event Replay Scrubber**: Step-by-step incident timeline (`14:31:30 (25.1°C)` → `14:31:45 (25.3°C)` → `14:32:00 (25.2°C)` → `14:32:15 (55.2°C Anomaly Detected)` → `14:32:16 (AI Started)` → `14:32:18 (Root Cause Classified)`).
* **Ranked Evidence Stack**:
  1. `01 Historical Deviation`: 55.2°C is outside expected historical range 22°C–27.5°C (Impact: High)
  2. `02 Temporal Deviation`: Increased by ~30°C within seconds (Impact: High)
  3. `03 Cross-Sensor Consistency`: Humidity & pressure contradict heat (Impact: High)
  4. `04 Nearby Station Comparison`: Surrounding stations remain 24°C–25.8°C (Impact: Very High)
  * Expandable "Technical Details" with SHAP feature vectors and reconstruction loss.
* **Reality Check Component**: Side-by-side evidence balance weighing Genuine Weather Event vs Sensor Anomaly.

### 4. Sensor Health (`#sensor-health`)
* Transducer degradation cards for Temperature, Humidity, and Pressure.
* 90-day component degradation timeline (`Stable Baseline` → `Minor Noise Increase` → `Repeated Micro-Spikes` → `Critical Spike` → `AI Failure Forecast`).
* Metrics for Drift Velocity, Noise Floor, Data Continuity, and Calibration Windows.

### 5. Maintenance Queue (`#maintenance`)
* Operational work orders table prioritized by urgency (`P1`, `P2`, `P3`).
* Columns: Priority, Station, Sensor, Issue, AI Confidence, Recommended Operational Action, Urgency, Action ("Dispatch Team").

### 6. Data Trust Log (`#data-trust-log`)
* Complete traceable audit trail recording every sensor reading, raw vs imputed value, Data Trust Score, and AI decision.
* Searchable interface with CSV Export capability.

---

## 🧪 "Test the AI" Evaluator Sandbox

Allows evaluators and hackathon judges to verify the core innovation across 3 distinct scenarios:
1. **Normal Weather**: Sensors fluctuate naturally, Data Trust: `98%`.
2. **Genuine Weather Event**: Temperature drops 8°C, humidity surges, pressure dips, surrounding stations corroborate → AI classifies: `GENUINE WEATHER EVENT (94% confidence, No Maintenance Required)`.
3. **Sensor Failure**: Temperature spikes to 55.2°C, surrounding stations stay normal, humidity contradicts → AI classifies: `PROBABLE SENSOR SPIKE (98.4% confidence, Action: Inspect Sensor Hardware)`.

---

## 🚀 Running Locally

```bash
cd /Users/amol/.gemini/antigravity/scratch/skyguard-ai
python3 server.py
```
Open **[http://localhost:8000](http://localhost:8000)** in any modern browser.
