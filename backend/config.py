import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Database Configuration - SQL Server (using pyodbc)
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'mssql+pyodbc://almaestr_classic:Nooh1986.@104.247.167.18\\MSSQLSERVER2014/almaestr_classic?driver=ODBC+Driver+17+for+SQL+Server&TrustServerCertificate=yes&MultipleActiveResultSets=True'
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = False  # Disable SQL query logging in console
    
    # Connection pool settings for better reliability
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
        'pool_recycle': 300,
        'pool_timeout': 20,
        'max_overflow': 0
    }
    
    # Security
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    
    # CORS Configuration
    CORS_ORIGINS = ["http://localhost:3000", "http://localhost:5173"]  # React dev servers
    
    # API Configuration
    API_PREFIX = '/api'
    
    # Debug Mode
    DEBUG = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'

class DevelopmentConfig(Config):
    DEBUG = True
    # Using the same working pyodbc configuration
    SQLALCHEMY_DATABASE_URI = 'mssql+pyodbc://almaestr_classic:Nooh1986.@104.247.167.18\\MSSQLSERVER2014/almaestr_classic?driver=ODBC+Driver+17+for+SQL+Server&TrustServerCertificate=yes&MultipleActiveResultSets=True'
    # Keep SQL logging disabled even in development for cleaner console
    SQLALCHEMY_ECHO = False

class ProductionConfig(Config):
    DEBUG = False
    # Use environment variables for production database
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')

class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///newtex_test.db'

# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
