from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from dotenv import load_dotenv
import os

# Import our database components
from database import get_db, init_db, InventoryItem

# Load environment variables
load_dotenv()

# Create FastAPI app instance
app = FastAPI(
    title="Grocery Recipe App API",
    description="Backend API for grocery inventory and AI-powered recipe generation",
    version="1.0.0"
)

# CORS middleware configuration for React Native
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your React Native app's origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for API requests/responses
class InventoryItemCreate(BaseModel):
    name: str
    quantity: float
    unit: str
    category: Optional[str] = None

class InventoryItemResponse(BaseModel):
    id: int
    name: str
    quantity: float
    unit: str
    category: Optional[str]
    added_date: datetime
    
    class Config:
        from_attributes = True

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Grocery Recipe App API", 
        "status": "running",
        "version": "1.0.0"
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# INVENTORY ENDPOINTS

@app.post("/api/inventory/add", response_model=InventoryItemResponse)
async def add_inventory_item(
    item: InventoryItemCreate, 
    db: Session = Depends(get_db)
):
    """Add a new grocery item to inventory"""
    
    # Check if item already exists
    existing_item = db.query(InventoryItem).filter(
        InventoryItem.name.ilike(f"%{item.name}%")
    ).first()
    
    if existing_item:
        # If item exists, update quantity instead of creating new
        existing_item.quantity += item.quantity  # type: ignore
        db.commit()
        db.refresh(existing_item)
        return existing_item
    
    # Create new inventory item
    db_item = InventoryItem(
        name=item.name.title(),  # Capitalize first letter
        quantity=item.quantity,
        unit=item.unit.lower(),
        category=item.category.lower() if item.category else None
    )
    
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    
    return db_item

@app.get("/api/inventory", response_model=List[InventoryItemResponse])
async def get_all_inventory(db: Session = Depends(get_db)):
    """Get all items in inventory"""
    items = db.query(InventoryItem).all()
    return items

@app.get("/api/inventory/{item_id}", response_model=InventoryItemResponse)
async def get_inventory_item(item_id: int, db: Session = Depends(get_db)):
    """Get a specific inventory item by ID"""
    item = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@app.put("/api/inventory/{item_id}", response_model=InventoryItemResponse)
async def update_inventory_item(
    item_id: int, 
    item_update: InventoryItemCreate,
    db: Session = Depends(get_db)
):
    """Update an existing inventory item"""
    item = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    item.name = item_update.name.title()  # type: ignore
    item.quantity = item_update.quantity  # type: ignore
    item.unit = item_update.unit.lower()  # type: ignore
    item.category = item_update.category.lower() if item_update.category else None  # type: ignore
    
    db.commit()
    db.refresh(item)
    return item

@app.delete("/api/inventory/{item_id}")
async def delete_inventory_item(item_id: int, db: Session = Depends(get_db)):
    """Delete an inventory item"""
    item = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    db.delete(item)
    db.commit()
    return {"message": f"Item '{item.name}' deleted successfully"}

if __name__ == "__main__":
    import uvicorn
    
    # Get host and port from environment variables
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    debug = os.getenv("DEBUG", "True").lower() == "true"
    
    # Run the server
    uvicorn.run(
        "main:app", 
        host=host, 
        port=port, 
        reload=debug  # Auto-reload on code changes during development
    )

if __name__ == "__main__":
    import uvicorn
    
    # Get host and port from environment variables
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    debug = os.getenv("DEBUG", "True").lower() == "true"
    
    # Run the server
    uvicorn.run(
        "main:app", 
        host=host, 
        port=port, 
        reload=debug  # Auto-reload on code changes during development
    )