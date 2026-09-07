import time
import joblib
import numpy as np
import pandas as pd
class SkyGuardInferenceEngine:
  """Calibrated two-tier AWS anomaly detection, health scoring, and auto-imputation."""
  def __init__(
      self, model_bundle_path: str = 'skyguard_model.pkl', alpha: float = 0.92
  ):
    bundle = joblib.load(model_bundle_path)
    self.model = bundle['model']
    self.features = bundle['features']
    self.classes = bundle['classes']
    self.alpha = alpha
    self.station_history = {}
  def _get_station_state(self, station_id: int) -> dict:
    if station_id not in self.station_history:
      self.station_history[station_id] = {
          'raw_temps': [],
          'clean_temps': [],
          'health_index': 100.0,
      }
    return self.station_history[station_id]
  def process_packet(self, packet: dict) -> dict:
    station_id = packet.get('STATION', 1001)
    state = self._get_station_state(station_id)
    raw_history = state['raw_temps']
    clean_history = state['clean_temps']
    t_curr = float(packet['AIR_TEMP_C'])
    rh_curr = float(packet['REL_HUMIDITY'])
    slp_curr = float(packet.get('SLP_HPA', 1013.25))
    dew_curr = float(packet.get('DEW_POINT_C', t_curr - 4.0))
    if len(clean_history) > 0:
      t_diff = t_curr - clean_history[-1]
    else:
      t_diff = 0.0
    phys_violation = int(
        (dew_curr > t_curr) or (t_curr > 48.0 and rh_curr > 90.0)
    )
    raw_window_3 = raw_history[-2:] + [t_curr] if len(raw_history) >= 2 else []
    is_flatline = (
        len(raw_window_3) == 3
        and abs(raw_window_3[0] - raw_window_3[1]) < 0.01
        and abs(raw_window_3[1] - raw_window_3[2]) < 0.01
    )
    recent_clean = (
        clean_history[-5:] + [t_curr] if len(clean_history) >= 1 else [t_curr]
    )
    t_drift_dev = float(abs(t_curr - np.mean(recent_clean)))
    tier1_fault = None
    tier1_conf = 0.0
    if phys_violation:
      tier1_fault = 'PHYSICAL_INCONSISTENCY'
      tier1_conf = 99.0
    elif abs(t_diff) > 8.0 and len(clean_history) >= 1:
      tier1_fault = 'SPIKE'
      tier1_conf = 96.5
    elif is_flatline:
      tier1_fault = 'STUCK_VALUE'
      tier1_conf = 95.0
    if tier1_fault:
      fault_type = tier1_fault
      confidence = tier1_conf
    else:
      if abs(t_diff) <= 1.5 and t_drift_dev < 3.0:
        fault_type = 'NORMAL'
        confidence = 94.0
      else:
        row_df = pd.DataFrame([{
            'AIR_TEMP_C': t_curr,
            'REL_HUMIDITY': rh_curr,
            'SLP_HPA': slp_curr,
            'TEMP_DEW_SPREAD': t_curr - dew_curr,
            'TEMP_DIFF': t_diff,
            'HUMIDITY_DIFF': 0.0,
            'TEMP_VARIANCE_5': (
                float(np.std(recent_clean)) if len(recent_clean) >= 5 else 1.0
            ),
            'TEMP_DRIFT_DEV': t_drift_dev,
            'PHYSICS_VIOLATION': phys_violation,
        }])[self.features]
        probs = self.model.predict_proba(row_df)[0]
        pred_idx = np.argmax(probs)
        fault_type = self.classes[pred_idx]
        confidence = round(float(probs[pred_idx]) * 100, 1)
    is_anomaly = fault_type != 'NORMAL'
    if is_anomaly:
      # Impute from historical median of validated clean readings
      imputed_temp = (
          round(float(np.median(clean_history[-4:])), 1)
          if clean_history
          else t_curr
      )
    else:
      imputed_temp = t_curr
    penalties = {
        'NORMAL': 0.0,
        'DRIFT': 3.0,
        'SPIKE': 5.0,
        'STUCK_VALUE': 7.0,
        'PHYSICAL_INCONSISTENCY': 12.0,
    }
    penalty = penalties.get(fault_type, 0.0)
    target_score = max(0.0, 100.0 - penalty * 4.0)
    state['health_index'] = round(
        self.alpha * state['health_index'] + (1 - self.alpha) * target_score, 1
    )
    action_map = {
        'NORMAL': 'Nominal: System operating within normal atmospheric bounds.',
        'DRIFT': 'Calibration bias: Schedule physical sensor probe maintenance.',
        'STUCK_VALUE': (
            'Hardware lockup: Frozen ADC detected. Reset station serial bus.'
        ),
        'SPIKE': 'Electrical noise surge: Transient spike filter applied.',
        'PHYSICAL_INCONSISTENCY': (
            'Severe physics violation: Replace temperature probe.'
        ),
    }
    raw_history.append(t_curr)
    clean_history.append(imputed_temp)
    if len(raw_history) > 20:
      raw_history.pop(0)
    if len(clean_history) > 20:
      clean_history.pop(0)
    return {
        'timestamp': packet.get('DATE', 'N/A'),
        'station_id': station_id,
        'observed_temp': t_curr,
        'imputed_temp': imputed_temp,
        'is_anomaly': is_anomaly,
        'fault_type': fault_type,
        'confidence_score': confidence,
        'sensor_health_pct': state['health_index'],
        'action_required': action_map.get(fault_type, 'Monitor status.'),
    }
if __name__ == '__main__':
  print('Initializing SkyGuard Calibrated Inference Engine (v4)...')
  engine = SkyGuardInferenceEngine()
  stream = [
      {
          'DATE': '2026-09-06 12:00:00',
          'STATION': 42182,
          'AIR_TEMP_C': 28.5,
          'REL_HUMIDITY': 55.0,
          'SLP_HPA': 1008.2,
          'DEW_POINT_C': 18.0,
      },
      {
          'DATE': '2026-09-06 12:30:00',
          'STATION': 42182,
          'AIR_TEMP_C': 28.8,
          'REL_HUMIDITY': 54.0,
          'SLP_HPA': 1008.0,
          'DEW_POINT_C': 18.2,
      },
      {
          'DATE': '2026-09-06 13:00:00',
          'STATION': 42182,
          'AIR_TEMP_C': 49.5,
          'REL_HUMIDITY': 52.0,
          'SLP_HPA': 1007.8,
          'DEW_POINT_C': 18.5,
      },
      {
          'DATE': '2026-09-06 13:30:00',
          'STATION': 42182,
          'AIR_TEMP_C': 29.1,
          'REL_HUMIDITY': 53.0,
          'SLP_HPA': 1007.5,
          'DEW_POINT_C': 18.3,
      }, 
      {
          'DATE': '2026-09-06 14:00:00',
          'STATION': 42182,
          'AIR_TEMP_C': 29.1,
          'REL_HUMIDITY': 53.0,
          'SLP_HPA': 1007.5,
          'DEW_POINT_C': 18.3,
      },
      {
          'DATE': '2026-09-06 14:30:00',
          'STATION': 42182,
          'AIR_TEMP_C': 29.1,
          'REL_HUMIDITY': 53.0,
          'SLP_HPA': 1007.5,
          'DEW_POINT_C': 18.3,
      }, 
      {
          'DATE': '2026-09-06 15:00:00',
          'STATION': 42182,
          'AIR_TEMP_C': 29.1,
          'REL_HUMIDITY': 53.0,
          'SLP_HPA': 1007.5,
          'DEW_POINT_C': 18.3,
      },
  ]
  print('\nStreaming Telemetry Diagnostics:')
  print('-' * 105)
  print(
      f"{'Time':<20} | {'Raw °C':<6} | {'Imputed':<7} | {'Diagnosis':<12} |"
      f" {'Conf %':<6} | {'Health':<6} | {'Status'}"
  )
  print('-' * 105)
  for packet in stream:
    result = engine.process_packet(packet)
    status_flag = '[ALERT]' if result['is_anomaly'] else '[OK]   '
    print(
        f"{result['timestamp']:<20} | "
        f"{result['observed_temp']:<6.1f} | "
        f"{result['imputed_temp']:<7.1f} | "
        f"{result['fault_type']:<12} | "
        f"{result['confidence_score']:<6.1f} | "
        f"{result['sensor_health_pct']:<5.1f}% | "
        f"{status_flag} {result['action_required']}"
    )
    time.sleep(0.15)