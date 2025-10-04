from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# ------------------------------------------------------------------------
# !!! CRITICAL: Change this line to switch to MySQL !!!

# For MySQL (replace 'user:password@localhost/expenseflow_db' with your actual details):
# SQLALCHEMY_DATABASE_URL = "mysql+mysqlconnector://user:password@localhost/expenseflow_db"

# Using SQLite for the fastest start:
SQLALCHEMY_DATABASE_URL = "sqlite:///./sql_app.db"
# ------------------------------------------------------------------------

# Connect to the database
# connect_args is only needed for SQLite to handle multi-threading, 
# you can remove it when using MySQL
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Create a local session to be used as a dependency
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all your models to inherit from
Base = declarative_base()

# Database Dependency (used in all FastAPI routes)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
