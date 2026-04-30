from http.server import BaseHTTPRequestHandler
import json
import numpy as np
from sklearn.ensemble import RandomForestClassifier

# Mock model for relapse pattern detection
# Features: [stress_spike_count_30d, urges_after_stress, avg_sleep_quality]
mock_model = RandomForestClassifier(n_estimators=10, random_state=42)
X_train = np.array([[5, 4, 3], [1, 0, 8], [8, 7, 2], [2, 1, 7]])
y_train = np.array([1, 0, 1, 0]) # 1 = Relapse Pattern Detected, 0 = Normal
mock_model.fit(X_train, y_train)

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        
        try:
            data = json.loads(post_data.decode('utf-8'))
            
            # Extract features representing 30 days of history
            stress_spikes = data.get('stress_spike_count_30d', 0)
            urges_after_stress = data.get('urges_after_stress_30d', 0)
            avg_sleep = data.get('avg_sleep_quality_30d', 5)
            
            features = np.array([[stress_spikes, urges_after_stress, avg_sleep]])
            
            # Predict
            prob = mock_model.predict_proba(features)[0][1]
            pattern_detected = bool(prob > 0.7)
            
            response = {
                "relapse_pattern_detected": pattern_detected,
                "confidence": round(float(prob), 2)
            }
            
            if pattern_detected:
                response["suggested_action"] = "Consider revisiting your 'Box Breathing' tool, which helped during a similar pattern last month."
                response["explanation"] = f"We noticed {urges_after_stress} urges following stress spikes recently. This pattern often precedes a slip."
                
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode('utf-8'))
            
        except Exception as e:
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))

    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/plain')
        self.end_headers()
        self.wfile.write("Relapse Pattern API is running.".encode('utf-8'))
