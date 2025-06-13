import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Database Configuration - SQL Server
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'mssql+pyodbc://almaestr_classic:Nooh1986.@104.247.167.18\\MSSQLSERVER2014/almaestr_classic?driver=ODBC+Driver+17+for+SQL+Server&MultipleActiveResultSets=True'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Alternative connection strings for different drivers:
    # For pymssql: 'mssql+pymssql://almaestr_classic:Nooh1986.@104.247.167.18:1433/almaestr_classic'
    # For pyodbc: 'mssql+pyodbc://almaestr_classic:Nooh1986.@104.247.167.18\\MSSQLSERVER2014/almaestr_classic?driver=ODBC+Driver+17+for+SQL+Server'
    
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
    SQLALCHEMY_DATABASE_URI = 'mssql+pyodbc://almaestr_classic:Nooh1986.@104.247.167.18\\MSSQLSERVER2014/almaestr_classic?driver=ODBC+Driver+17+for+SQL+Server&MultipleActiveResultSets=True'

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
