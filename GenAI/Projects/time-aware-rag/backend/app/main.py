from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.models import HealthCheck
from app.api import routes
import os

settings = get_settings()

app = FastAPI(
    title="Time-Aware RAG API",
    description="Retrieval Augmented Generation with Temporal Intelligence",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(routes.router)

@app.get("/", response_model=HealthCheck)
async def health_check():
    """Health check endpoint"""
    faiss_index_exists = os.path.exists(os.path.join(settings.faiss_index_path, "index.faiss"))
    metadata_exists = os.path.exists(settings.metadata_path)
    
    return HealthCheck(
        status="healthy",
        embedding_model=settings.embedding_model,
        faiss_index_exists=faiss_index_exists,
        metadata_exists=metadata_exists
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=True
    )