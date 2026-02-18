"""
API Key Authentication System
Protects all API endpoints from unauthorized access.
Users must include a valid API key in the X-API-Key header.
"""
from fastapi import Security, HTTPException, status
from fastapi.security import APIKeyHeader
from app.config import get_settings
from core.logger import get_logger

logger = get_logger("auth")

# Define where to look for the API key (in the request header)
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


def get_api_keys() -> list:
    """Get list of valid API keys from environment variables."""
    settings = get_settings()
    keys_str = getattr(settings, 'api_keys', '')
    
    if not keys_str:
        return []
    
    return [key.strip() for key in keys_str.split(",") if key.strip()]


async def verify_api_key(api_key: str = Security(api_key_header)) -> str:
    """
    Verify the API key from request header.
    Returns the API key if valid, raises 401 if not.
    """
    valid_keys = get_api_keys()
    
    # If no API keys configured, allow all requests (development mode)
    if not valid_keys:
        logger.warning("No API keys configured — authentication disabled")
        return "no-auth"
    
    # Check if key was provided
    if not api_key:
        logger.warning("Request without API key rejected")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": "Missing API key",
                "message": "Include your API key in the X-API-Key header",
                "example": "X-API-Key: your-api-key-here"
            }
        )
    
    # Check if key is valid
    if api_key not in valid_keys:
        logger.warning(f"Invalid API key attempted: {api_key[:8]}...")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": "Invalid API key",
                "message": "The provided API key is not valid"
            }
        )
    
    logger.info(f"Authenticated with key: {api_key[:8]}...")
    return api_key