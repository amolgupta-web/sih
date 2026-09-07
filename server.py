#!/usr/bin/env python3
"""SkyGuard AI — Unified Local Presentation & Inference Server

Serves static dashboard files and exposes the /api/predict endpoint.
"""

import http.server
import json
import os
import socketserver
import sys
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(DIRECTORY, "backend")
MODEL_PATH = os.path.join(BACKEND_DIR, "skyguard_model.pkl")
if BACKEND_DIR not in sys.path:
  sys.path.insert(0, BACKEND_DIR)
try:
  from inference_engine import SkyGuardInferenceEngine

  engine = SkyGuardInferenceEngine(model_bundle_path=MODEL_PATH)
  print(f"✅ SkyGuard ML Engine loaded successfully from: {MODEL_PATH}")
except Exception as e:
  print(f"⚠️ Warning: Could not initialize ML engine: {e}")
  engine = None
PORT = 8000
class SkyGuardHandler(http.server.SimpleHTTPRequestHandler):
  def __init__(self, *args, **kwargs):
    super().__init__(*args, directory=DIRECTORY, **kwargs)
  def end_headers(self):
    self.send_header("Access-Control-Allow-Origin", "*")
    self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    self.send_header("Access-Control-Allow-Headers", "Content-Type")
    self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
    super().end_headers()
  def do_OPTIONS(self):
    self.send_response(200)
    self.end_headers()
  def do_POST(self):
    if self.path == "/api/predict":
      content_length = int(self.headers.get("Content-Length", 0))
      post_data = self.rfile.read(content_length)
      try:
        packet = json.loads(post_data.decode("utf-8"))
        if engine:
          result = engine.process_packet(packet)
        else:
          result = {"error": "ML engine offline", "is_anomaly": False}
        response_bytes = json.dumps(result).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(response_bytes)
      except Exception as e:
        err_bytes = json.dumps({"error": str(e)}).encode("utf-8")
        self.send_response(500)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(err_bytes)
    else:
      self.send_response(404)
      self.end_headers()
def run():
  global PORT
  while PORT < 8020:
    try:
      with socketserver.TCPServer(("", PORT), SkyGuardHandler) as httpd:
        print("=" * 60, flush=True)
        print("✨ SkyGuard AI Platform Server Running", flush=True)
        print(f"🌐 Local URL: http://localhost:{PORT}", flush=True)
        print(
            f"🔗 Inference API: http://localhost:{PORT}/api/predict", flush=True
        )
        print("=" * 60, flush=True)
        httpd.serve_forever()
    except OSError:
      PORT += 1
if __name__ == "__main__":
  run()
