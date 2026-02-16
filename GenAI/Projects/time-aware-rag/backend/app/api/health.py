"""
Health Check Endpoints
Used by Docker, monitoring tools, and load balancers
to check if the app and its dependencies are working.
"""
from fastapi import APIRouter
from core.database import engine
from core.cache import get_cache_manager
from core.logger import get_logger
import time

logger = get_logger("health")

router = APIRouter(tags=["Health"])


@router.get("/health")
async def basic_health():
    """
    Basic health check — is the app alive?
    Returns 200 if the server is running.
    """
    return {
        "status": "healthy",
        "service": "Time-Aware RAG API"
    }


@router.get("/health/detailed")
async def detailed_health():
    """
    Detailed health check — checks all dependencies.
    Shows status of PostgreSQL, Redis, and Vector Store.
    """
    health = {
        "status": "healthy",
        "services": {}
    }
    
    # Check PostgreSQL
    try:
        start = time.time()
        with engine.connect() as conn:
            conn.execute("SELECT 1")
        pg_time = (time.time() - start) * 1000
        
        health["services"]["postgresql"] = {
            "status": "connected",
            "response_time_ms": round(pg_time, 2)
        }
        logger.info(f"PostgreSQL health OK ({pg_time:.2f}ms)")
    except Exception as e:
        health["services"]["postgresql"] = {
            "status": "disconnected",
            "error": str(e)
        }
        health["status"] = "degraded"
        logger.error(f"PostgreSQL health FAILED: {e}")
    
    # Check Redis
    try:
        cache = get_cache_manager()
        start = time.time()
        
        if cache.enabled and cache.redis_client:
            cache.redis_client.ping()
            redis_time = (time.time() - start) * 1000
            
            health["services"]["redis"] = {
                "status": "connected",
                "response_time_ms": round(redis_time, 2)
            }
            logger.info(f"Redis health OK ({redis_time:.2f}ms)")
        else:
            health["services"]["redis"] = {
                "status": "disabled"
            }
    except Exception as e:
        health["services"]["redis"] = {
            "status": "disconnected",
            "error": str(e)
        }
        health["status"] = "degraded"
        logger.error(f"Redis health FAILED: {e}")
    
    return health