"""
Request Logging Middleware
Automatically logs every API request with:
- Method (GET, POST, DELETE)
- Path (/api/query, /api/documents)
- Status code (200, 404, 500)
- Response time (how long it took)
"""
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from core.logger import get_logger
import time

logger = get_logger("api")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Record start time
        start_time = time.time()
        
        # Process the request
        try:
            response = await call_next(request)
        except Exception as e:
            # Log the error
            process_time = (time.time() - start_time) * 1000
            logger.error(
                f"{request.method} {request.url.path} → 500 ERROR ({process_time:.2f}ms) | {str(e)}"
            )
            raise
        
        # Calculate response time
        process_time = (time.time() - start_time) * 1000
        
        # Log based on status code
        status = response.status_code
        
        if status >= 500:
            logger.error(
                f"{request.method} {request.url.path} → {status} ({process_time:.2f}ms)"
            )
        elif status >= 400:
            logger.warning(
                f"{request.method} {request.url.path} → {status} ({process_time:.2f}ms)"
            )
        else:
            logger.info(
                f"{request.method} {request.url.path} → {status} ({process_time:.2f}ms)"
            )
        
        return response