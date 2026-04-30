from http.server import BaseHTTPRequestHandler
import json
import numpy as np
from sklearn.ensemble import RandomForestClassifier

# Mock trained model for MVP
mock_model = RandomForestClassifier(n_estimators=10, random_state=42)
# Features: [avg_stress, urges_last_7_days, days_since_last_session]
X_train = np.array([[8, 5, 1], [3, 1, 5], [9, 8, 0], [2, 0, 10]])
y_train = np.array([1, 0, 1, 0]) # 1 = High Risk, 0 = Low Risk
mock_model.fit(X_train, y_train)

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        
        try:
            data = json.loads(post_data.decode('utf-8'))
            
            # Extract features (in a real app, these would be computed from user history)
            avg_stress = data.get('avg_stress', 5)
            urges_count = data.get('urges_last_7_days', 2)
            days_since = data.get('days_since_last_session', 3)
            
            features = np.array([[avg_stress, urges_count, days_since]])
            
            # Predict probability of class 1 (High Risk)
            prob = mock_model.predict_proba(features)[0][1]
            
            # Simple feature importance (Explainability AC 7.3.3)
            # In trees, we can just grab feature_importances_
            importances = mock_model.feature_importances_.tolist()
            feature_names = ["Average Stress", "Recent Urges", "Days Since Coping"]
            
            # Find the top contributor for the explanation
            top_feature_idx = np.argmax(importances)
            top_feature = feature_names[top_feature_idx]
            
            response = {
                "risk_probability": round(float(prob), 2),
                "is_high_risk": bool(prob > 0.6),
                "explanation": f"Based on your data, '{top_feature}' is the strongest factor currently."
            }
            
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
        self.wfile.write("Predict API is running. Use POST to submit data.".encode('utf-8'))
