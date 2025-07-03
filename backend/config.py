import os
from dotenv import load_dotenv

# Load environment variables from a .env file
load_dotenv()

class Config:
    """Base configuration class. Contains default settings."""
    # Secret key for session management, CSRF protection, etc.
    # It's crucial to set this in your environment for production.
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'a-super-secret-key-that-you-should-change'

    # Database Configuration using pyodbc for broad compatibility.
    # Individual database parameters for flexibility
    DB_SERVER = os.environ.get('DB_SERVER', '104.247.167.18')
    DB_USER = os.environ.get('DB_USER', 'almaestr_classic')
    DB_PASSWORD = os.environ.get('DB_PASSWORD', 'Nooh1986.')
    DB_NAME = os.environ.get('DB_NAME', 'almaestr_classic')
    DB_INSTANCE = os.environ.get('DB_INSTANCE', 'MSSQLSERVER2014')
    DB_DRIVER = os.environ.get('DB_DRIVER', 'ODBC Driver 17 for SQL Server')
    
    # Build connection string using pyodbc
    # Format: mssql+pyodbc://user:password@server\instance/database?driver=ODBC+Driver+17+for+SQL+Server
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
                              f"mssql+pyodbc://{DB_USER}:{DB_PASSWORD}@{DB_SERVER}\\{DB_INSTANCE}/{DB_NAME}?driver={DB_DRIVER.replace(' ', '+')}"
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = False  # Default to not logging SQL queries

    # Default connection pool settings
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,      # Check connections before use
        'pool_recycle': 3600,       # Recycle connections every hour
        'pool_timeout': 30,         # Wait 30 seconds for a connection
        'max_overflow': 2,
        'pool_size': int(os.environ.get('DB_POOL_SIZE', 5))
    }
    
    # CORS Configuration for frontend access
    CORS_ORIGINS = ["http://localhost:3000", "http://localhost:5173"]
    
    # API Configuration
    API_PREFIX = '/api'
    API_HOST = os.environ.get('API_HOST', 'localhost')
    API_PORT = int(os.environ.get('API_PORT', 5000))
    
    # Default to production mode (DEBUG=False) unless specified
    DEBUG = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    TESTING = False

class DevelopmentConfig(Config):
    """Configuration for local development."""
    DEBUG = True
    SQLALCHEMY_ECHO = True  # Log SQL queries to the console for debugging

class ProductionConfig(Config):
    """Configuration for production environments."""
    DEBUG = False
    SQLALCHEMY_ECHO = False

    # Use a smaller connection pool for shared hosting to conserve resources
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
        'pool_recycle': 3600,
        'pool_timeout': 60,
        'max_overflow': 1,
        'pool_size': int(os.environ.get('DB_POOL_SIZE', 2)) # A smaller pool for production
    }

class TestingConfig(Config):
    """Configuration for running tests."""
    TESTING = True
    # Use an in-memory SQLite database for fast, isolated tests
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    SQLALCHEMY_ENGINE_OPTIONS = {} # Use default engine options for SQLite

# A dictionary to map configuration names to their respective classes
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}