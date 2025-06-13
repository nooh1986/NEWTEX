from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os
from config import config

# Initialize Flask app
app = Flask(__name__)

# Load configuration
config_name = os.environ.get('FLASK_CONFIG', 'development')
app.config.from_object(config[config_name])

# Enable CORS for React frontend
CORS(app, 
     origins=app.config['CORS_ORIGINS'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allow_headers=['Content-Type', 'Authorization', 'Accept'],
     supports_credentials=True)

# Initialize database
db = SQLAlchemy(app)

# Import routes
from routes.warehouse import warehouse_bp

# Register blueprints
app.register_blueprint(warehouse_bp, url_prefix='/api/warehouse')

@app.route('/')
def home():
    return jsonify({
        'message': 'NEWTEX Backend API',
        'version': '1.0.0',
        'status': 'running'
    })

@app.route('/api/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
