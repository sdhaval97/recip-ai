from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./grocery_app.db")

# Create SQLAlchemy engine
engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for models
Base = declarative_base()

# Simple Inventory Model (compatible version)
class InventoryItem(Base):
    __tablename__ = "inventory"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    quantity = Column(Float, nullable=False) 
    unit = Column(String, nullable=False)
    category = Column(String, nullable=True)
    added_date = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<InventoryItem(name='{self.name}', quantity={self.quantity}, unit='{self.unit}')>"

# Create all tables
def create_tables():
    Base.metadata.create_all(bind=engine)

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Initialize database (call this when app starts)
def init_db():
    create_tables()
    print("Database initialized successfully!")