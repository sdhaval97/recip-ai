from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

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

# We'll add route imports here later
# from app.routes import inventory, recipes, shopping_list

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