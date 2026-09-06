# SkyGuard AI — B2B Environmental Intelligence & Data Trust Platform (PS 73)
## Comprehensive Architecture & UX Redesign Plan

**Problem Statement 73 (PS 73)**: AI/ML-Based Intelligent Anomaly Detection for Automatic Weather Stations (AWS)  
**Product Positioning**: *“SkyGuard AI — Weather Data Trust Intelligence: Continuously determining whether your weather station is measuring reality — or reporting a problem.”*  
**Core Question**: *“Can I trust this weather data?”*

---

## 1. UX & Information Architecture Restructure

We are transforming the website from a generic SaaS marketing layout into an **enterprise B2B operational workstation** used by:
1. **Weather Network Operators** (Monitoring 24+ mesonet stations, anomaly attention queue, real-time trust metrics)
2. **Environmental Data Scientists** (Deep inspection of raw vs imputed values, temporal physics, and SHAP evidence)
3. **Field Maintenance Engineers** (Prioritized P1/P2/P3 dispatch queue, component degradation timelines, preventive calibration windows)

### Navigation & Page Workflow (6 Dedicated Domain Views):
```
[ SKYGUARD AI ]  Status: 24 Nodes Online (98.2% Network Trust)  [Reduce Motion / Cursor]
-----------------------------------------------------------------------------------------
1. Command Center   ─ Main operational screen: network trust meter, unified multi-sensor
                      comparative chart, and actionable AI attention queue.
2. Live Network     ─ Mesonet directory (hybrid table/cards) + supporting geographic station map.
3. Investigate      ─ Dedicated Incident Investigation Mode: header, AI verdict, interactive
                      event replay (scrubber), ranked evidence stack, and Reality Check.
4. Sensor Health    ─ Deep degradation analytics: noise floor, drift velocity, 90-day lifecycle.
5. Maintenance      ─ Operational P1/P2/P3 engineering work orders with prescriptive actions.
6. Data Trust Log   ─ Immutable audit trail with raw sensor readings, AI imputed values, and confidence.
-----------------------------------------------------------------------------------------
[ Test the AI ]     ─ 3-Scenario Interactive Sandbox: Normal Weather vs Genuine Front vs Sensor Failure.
```

---

## 2. Refined Professional Color System & Design Language

Replacing the decorative gold/bright scheme with a **calm, scientific, enterprise-grade environmental palette**:

| Token | Hex Value | Usage |
|---|---|---|
| **Main Background** | `#F7F8F6` | Warm cloud white canvas (calm, non-glare, professional) |
| **Secondary Background** | `#EEF2F0` | Subtle contrast for controls, sidebars, and inactive tabs |
| **Surface / Cards** | `#FFFFFF` | Clean, crisp panels with 1px border (`#E2E8E5`) and soft 2px shadows |
| **Primary Text** | `#17201E` | Deep slate (high-contrast, scientific readability) |
| **Secondary Text** | `#66716D` | Muted slate for metadata, timestamps, and units |
| **Primary Brand Accent** | `#0F766E` | Deep environmental teal (navigation, primary CTAs, active filters) |
| **Healthy / Trusted** | `#2E9B73` | Soft emerald green (trusted data badges, nominal envelope bands) |
| **Healthy Background** | `#E6F5ED` | Light emerald tint for trusted badges |
| **Monitoring / Attention**| `#C98A1C` | Professional amber (sensor drift, recalibration required) |
| **Attention Background** | `#FFF4DC` | Light amber tint |
| **Critical Anomaly** | `#C94F4F` | Controlled scientific red (spikes, hardware failures, packet drops) |
| **Anomaly Background** | `#FCEBEC` | Light red tint for critical alert badges |
| **Accent / Borders** | `#DCE7E5` | Atmospheric blue-grey for dividers and grid lines |

---

## 3. Detailed Component Improvements

### A. Navigation & Shell
* Domain-specific header with **SkyGuard AI: Weather Data Trust Intelligence**.
* Seamless tab/view routing between all 6 pages with persistent URL hash `#command-center`, `#live-network`, `#investigate`, `#sensor-health`, `#maintenance`, `#data-trust-log`.
* Refined minimal scientific mercury thermometer cursor that subtly reacts based on the data trust of elements hovered over.

### B. Command Center View
* **Network Trust Banner**: Clean horizontal metric bar: **94.8 / 100** (*"Based on live sensor reliability, anomaly activity, data continuity, and network consistency"*).
* **Compact Operational Metrics**: `24 Active Stations` | `72 Monitored Sensors` | `03 Require Attention` | `98.2% Trusted Data`.
* **Unified Multi-Sensor Comparative Chart**:
  * Temperature, Relative Humidity, and Atmospheric Pressure displayed in a synchronized, comparative canvas visualizer.
  * Timeframe selectors: `1 Hour`, `6 Hours`, `24 Hours`, `7 Days`.
  * Visual expected range bands, raw readings, and highlighted anomaly pins.
* **AI Attention Queue** (Right sidebar):
  * Actionable cards (e.g. `Critical: Temperature Spike AWS-JPR-04 → Investigate`, `Warning: Humidity Drift AWS-DEL-07 → Review`, `Communication: Data Interruption AWS-MUM-02 → Check Connection`).

### C. Live Network View
* Station directory hybrid table/card grid with columns: Station ID, Region, Temperature, Humidity, Pressure, Data Trust Score, Network Connectivity, Sensor Status, and Actions.
* Interactive Geographic Mesonet Map Context (Vector SVG canvas with nodes colored by trust state, showing micro-status popovers).
* Filter by All, Attention Needed, Healthy, Offline.

### D. Investigate View (Signature Incident Investigation Workflow)
* **Investigation Header**: Station ID (`AWS-JPR-04`), Parameter (`Temperature`), Observed Reading (`55.2°C`), Timestamp (`14:32:18`).
* **AI Verdict Card**: `PROBABLE SENSOR ANOMALY` | Confidence: `98.4%` | Severity: `CRITICAL` | Root Cause: `SUDDEN SENSOR SPIKE`.
* **Raw vs Imputed (Corrected) Data Box**:
  * Raw Sensor Value: `55.2°C`
  * AI Estimated (Imputed) Value: `25.4°C` (Confidence: `91%`)
  * Audit Note: *"Original raw sensor reading preserved for legal & scientific traceability."*
* **Interactive Event Replay Scrubber**:
  * 5-step incident sequence (`14:31:30 (25.1°C)` → `14:31:45 (25.3°C)` → `14:32:00 (25.2°C)` → `14:32:15 (55.2°C Spike Flagged)` → `14:32:18 (Root Cause Classified)`).
  * Play / Pause / Step controls with dynamic data visualization.
* **Ranked Evidence Stack**:
  1. Historical Deviation (`55.2°C` outside expected 22°C–27°C, Impact: High)
  2. Temporal Deviation (+30°C in < 15 seconds, Impact: High)
  3. Cross-Sensor Thermodynamic Inconsistency (Pressure & humidity contradict heat, Impact: High)
  4. Nearby Station Spatial Comparison (4 neighbors stay 24°C–27°C, Impact: Very High)
  * Expandable "Technical Details" with SHAP feature weights, Z-scores, and autoencoder loss.
* **Reality Check Comparison**:
  * Genuine Weather Event vs Sensor Anomaly side-by-side evidence balance with calculated probabilistic verdict.

### E. Sensor Health View
* Individual sensor degradation cards for Temperature, Humidity, and Pressure.
* 90-Day Sensor Degradation Timeline (`90 Days Ago: Stable` → `30 Days Ago: Minor noise` → `7 Days Ago: Micro-spikes` → `Today: Critical spike` → `AI Forecast: Inspection in 7 days`).
* Drift velocity, Noise floor (SNR), Data continuity, and Anomaly recurrence metrics.

### F. Maintenance View
* Prioritized P1/P2/P3 Field Engineering Work Queue:
  * P1: `AWS-JPR-04` — Temperature — Critical Sensor Spike (Confidence 98%) — Action: Inspect ADC & Wiring — Urgency: Immediate (Today).
  * P2: `AWS-DEL-07` — Humidity — Gradual Polymer Drift (Confidence 91%) — Action: Salt Chamber Calibration — Urgency: Within 7 Days.
  * P3: `AWS-MUM-11` — Pressure — Minor Micro-Noise (Confidence 72%) — Action: Check Barometer Port — Urgency: Low Priority (Next Cycle).
* Work Order Status buttons: "Acknowledge", "Dispatch Team", "Mark Calibrated".

### G. Data Trust Log View
* Traceable historical log of all readings with trust tags:
  * Columns: `Timestamp`, `Station`, `Sensor`, `Raw Reading`, `AI Estimated`, `Trust Score (0-100)`, `Status`, `Decision`, `Actions`.
  * Search, sensor filter, and CSV Export feature.

### H. "Test the AI" Scenario Simulator
* 3-Button Sandbox:
  1. **Normal Weather** → Trusted Data (96%), Natural Diurnal Fluctuation.
  2. **Genuine Weather Event** → Coordinated multi-sensor cold front/squall, Confidence 94%, No maintenance required.
  3. **Sensor Failure** → 25.0°C → 25.4°C → 55.2°C spike, Confidence 98.4%, Action: Inspect hardware.

---

## 4. Proposed File Modifications

```
skyguard-ai/
├── index.html                 # [MODIFY] Restructure into 6 domain views + modal/view switcher + clean B2B layout
├── css/styles.css             # [MODIFY] Implement #F7F8F6 / #0F766E palette, remove neon gradients, add refined enterprise UI
├── js/
│   ├── app.js                 # [MODIFY] Master state manager for view routing (Command Center, Live Network, Investigate, etc.)
│   ├── cursor.js              # [MODIFY] Refined, subtle scientific thermometer cursor with data-aware mercury level
│   ├── stream-engine.js       # [MODIFY] Enhanced with 3 test scenarios, raw vs imputed generation, and network-wide trust scoring
│   ├── ai-detector.js         # [MODIFY] Enhanced with composite Data Trust Score (0-100), ranked evidence generator, and reality check scoring
│   ├── charts.js              # [MODIFY] Unified comparative multi-sensor canvas chart with expected range bands and raw vs imputed markers
│   └── components/
│       ├── command-center.js  # [NEW] Network trust meter, compact KPIs, attention queue controller
│       ├── live-network.js    # [NEW] Station directory table + vector geographic mesonet map
│       ├── investigate.js     # [NEW] Incident investigation mode, event replay scrubber, evidence stack, reality check
│       ├── sensor-health.js   # [MODIFY] 90-day degradation timeline and noise/drift metrics
│       ├── maintenance.js     # [NEW] Prioritized P1/P2/P3 operational engineering queue
│       └── data-trust-log.js  # [NEW] Traceable audit history log with CSV export and raw vs imputed verification
```

---

## 5. Verification Plan

1. **Information Architecture Verification**:
   - Verify all 6 navigation tabs (`Command Center`, `Live Network`, `Investigate`, `Sensor Health`, `Maintenance`, `Data Trust Log`) switch views smoothly without page reload.
2. **Investigation Mode & Replay**:
   - Click "Investigate →" from the Attention Queue or Live Network table; verify it opens the dedicated investigation view populated with `AWS-JPR-04` 55.2°C incident data.
   - Test the Event Replay scrubber: scrubbing moves the timestamp and shows the transition from 25.1°C to 55.2°C.
   - Verify raw (`55.2°C`) vs AI estimated (`25.4°C`) display is prominent with audit note.
3. **Multi-Sensor Comparative Charting**:
   - Verify Temperature, Humidity, and Pressure are plotted on the unified chart with timeframe switching (`1h`, `6h`, `24h`, `7d`).
4. **"Test the AI" Scenarios**:
   - Test each button: "Normal Weather", "Genuine Weather Event", "Sensor Failure"; verify the AI properly discriminates and updates the Data Trust Score accordingly.
5. **Color & Aesthetic Verification**:
   - Confirm background is warm cloud white (`#F7F8F6`), primary text is deep slate (`#17201E`), and brand color is deep environmental teal (`#0F766E`).
   - Confirm all neon glows, excessive gradients, and marketing clutter are eliminated.

---

Please review this implementation plan. Upon your approval, we will immediately implement the edits.
