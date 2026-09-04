#!/usr/bin/env python3
"""
SkyGuard AI — Local Development & Presentation Server
Serves the SkyGuard AI platform with automatic port detection and clean MIME handling.
"""

import http.server
import socketserver
import os
import sys

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Enable CORS and caching headers for high responsiveness
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

def run():
    global PORT
    while PORT < 8020:
        try:
            with socketserver.TCPServer(("", PORT), Handler) as httpd:
                print(f"============================================================", flush=True)
                print(f"✨ SkyGuard AI Platform Server Running", flush=True)
                print(f"🌐 Local URL: http://localhost:{PORT}", flush=True)
                print(f"📂 Directory: {DIRECTORY}", flush=True)
                print(f"🛡️ PS 73: AI/ML Anomaly Detection for Weather Stations", flush=True)
                print(f"============================================================", flush=True)
                httpd.serve_forever()
        except OSError:
            PORT += 1

if __name__ == '__main__':
    run()
