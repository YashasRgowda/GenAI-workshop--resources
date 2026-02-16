"""
Rate Limiting using Redis.
Limits how many API requests a user can make per minute.
Prevents abuse, protects Gemini API costs, and keeps server healthy.
"""
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from core.cache import get_cache_manager
from core.logger import get_logger
import time

logger = get_logger("rate_limiter")


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, requests_per_minute: int = 20):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.window_seconds = 60
        logger.info(f"Rate limiter initialized: {requests_per_minute} requests/minute")
    
    def _get_client_ip(self, request: Request) -> str:
        """Get the client's IP address."""
        # Check for forwarded header (when behind a proxy/load balancer)
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host
    
    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for health checks and docs
        skip_paths = ["/health", "/docs", "/openapi.json", "/redoc"]
        if any(request.url.path.startswith(path) for path in skip_paths):
            return await call_next(request)
        
        # Get Redis client
        cache = get_cache_manager()
        
        # If Redis is not available, let the request through
        # (don't block users just because Redis is down)
        if not cache.enabled or not cache.redis_client:
            return await call_next(request)
        
        try:
            # Create a unique key for this user based on IP
            client_ip = self._get_client_ip(request)
            rate_key = f"ratelimit:{client_ip}"
            
            # Get current request count
            current_count = cache.redis_client.get(rate_key)
            
            if current_count is None:
                # First request — start counting
                cache.redis_client.setex(rate_key, self.window_seconds, 1)
                remaining = self.requests_per_minute - 1
            else:
                current_count = int(current_count)
                
                if current_count >= self.requests_per_minute:
                    # RATE LIMITED — too many requests
                    ttl = cache.redis_client.ttl(rate_key)
                    logger.warning(
                        f"Rate limited: {client_ip} | "
                        f"{current_count}/{self.requests_per_minute} requests | "
                        f"retry in {ttl}s"
                    )
                    return JSONResponse(
                        status_code=429,
                        content={
                            "error": "Too many requests",
                            "detail": f"Rate limit: {self.requests_per_minute} requests per minute",
                            "retry_after_seconds": ttl
                        }
                    )
                
                # Increment counter
                cache.redis_client.incr(rate_key)
                remaining = self.requests_per_minute - current_count - 1
            
            # Process the request
            response = await call_next(request)
            
            # Add rate limit headers to response
            response.headers["X-RateLimit-Limit"] = str(self.requests_per_minute)
            response.headers["X-RateLimit-Remaining"] = str(max(0, remaining))
            
            return response
            
        except Exception as e:
            # If rate limiting fails, don't block the request
            logger.error(f"Rate limiter error: {e}")
            return await call_next(request)