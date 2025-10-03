import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from src.routers import analysis, jobs

app = FastAPI(title="AI Text Analysis API", version="1.0.0")

# CORS middleware
print("DEBUG: Setting up CORS middleware", os.getenv('FRONTEND_URL'))
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv('FRONTEND_URL'),
        'https://kai-developer-test.web.app',
        'localhost:3000',
        'http://localhost:3000'
    ],  
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],  
)

# Include routers
app.include_router(analysis.router)
app.include_router(jobs.router)

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# CORS preflight
@app.options("/api/{path:path}")
async def preflight_handler(path: str):
    return {"message": "OK"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
