from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.models import HealthCheck
from app.api import routes
from app.api import health
from app.middleware import RequestLoggingMiddleware
from app.rate_limiter import RateLimitMiddleware
from core.logger import get_logger
import os

settings = get_settings()
logger = get_logger("main")

app = FastAPI(
    title="Time-Aware RAG API",
    description="Retrieval Augmented Generation with Temporal Intelligence",
    version="2.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiting middleware (outermost — checks FIRST before anything else)
app.add_middleware(RateLimitMiddleware, requests_per_minute=20)

# Request logging middleware
app.add_middleware(RequestLoggingMiddleware)

# Include routes
app.include_router(routes.router)
app.include_router(health.router)

@app.on_event("startup")
async def startup_event():
    logger.info("🚀 Time-Aware RAG API starting up...")
    logger.info(f"📦 Embedding model: {settings.embedding_model}")
    logger.info(f"🗄️ Database: connected")
    logger.info(f"💾 Redis caching: {'enabled' if settings.enable_caching else 'disabled'}")
    logger.info(f"🛡️ Rate limiting: 20 requests/minute")
    logger.info("✅ API ready to serve requests")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("🛑 Time-Aware RAG API shutting down...")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=True
    )