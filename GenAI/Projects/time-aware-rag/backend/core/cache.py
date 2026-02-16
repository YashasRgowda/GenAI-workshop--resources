import redis
import json
import hashlib
from typing import Optional, Dict, Any
from app.config import get_settings
import time
from core.logger import get_logger
logger = get_logger("cache")

class CacheManager:
    def __init__(self):
        settings = get_settings()
        
        if not settings.enable_caching:
            logger.info("Caching is disabled")
            self.redis_client = None
            self.enabled = False
            return
        
        try:
            # Connect to Redis
            self.redis_client = redis.Redis(
                host=settings.redis_host,
                port=settings.redis_port,
                db=settings.redis_db,
                password=settings.redis_password if settings.redis_password else None,
                decode_responses=True,  # Automatically decode bytes to strings
                socket_connect_timeout=5
            )
            
            # Test connection
            self.redis_client.ping()
            logger.info(f"Redis connected: {settings.redis_host}:{settings.redis_port}")
            
            self.ttl = settings.cache_ttl
            self.enabled = True
            
        except redis.ConnectionError as e:
            logger.info(f"Redis connection failed: {e}")
            logger.info("Caching disabled - queries will run without cache")
            self.redis_client = None
            self.enabled = False
        except Exception as e:
            logger.info(f"Redis initialization error: {e}")
            self.redis_client = None
            self.enabled = False
    
    def _generate_cache_key(
        self,
        query: str,
        query_date: str,
        k: int,
        prefix: str = "query"
    ) -> str:
        """
        Generate a unique cache key based on query parameters.
        
        Args:
            query: Search query
            query_date: Date context
            k: Number of results
            prefix: Key prefix (default: "query")
            
        Returns:
            Cache key string
        """
        # Combine parameters into single string
        key_data = f"{query}|{query_date}|{k}"
        
        # Generate MD5 hash for compact key
        key_hash = hashlib.md5(key_data.encode()).hexdigest()
        
        # Return prefixed key
        return f"{prefix}:{key_hash}"
    
    def get(self, cache_key: str) -> Optional[Dict]:
        """
        Get cached result.
        
        Args:
            cache_key: Cache key
            
        Returns:
            Cached data or None if not found
        """
        if not self.enabled or not self.redis_client:
            return None
        
        try:
            cached_data = self.redis_client.get(cache_key)
            
            if cached_data:
                # Increment hit counter
                self.redis_client.incr("cache:hits")
                logger.info(f"Cache HIT: {cache_key}")
                
                # Deserialize JSON
                return json.loads(cached_data)
            else:
                # Increment miss counter
                self.redis_client.incr("cache:misses")
                logger.info(f"Cache MISS: {cache_key}")
                return None
                
        except Exception as e:
            logger.info(f"Cache get error: {e}")
            return None
    
    def set(
        self,
        cache_key: str,
        data: Dict,
        ttl: Optional[int] = None
    ) -> bool:
        """
        Store data in cache.
        
        Args:
            cache_key: Cache key
            data: Data to cache
            ttl: Time to live in seconds (uses default if None)
            
        Returns:
            True if successful, False otherwise
        """
        if not self.enabled or not self.redis_client:
            return False
        
        try:
            # Serialize to JSON
            json_data = json.dumps(data)
            
            # Set with expiration
            expiration = ttl if ttl is not None else self.ttl
            self.redis_client.setex(
                cache_key,
                expiration,
                json_data
            )
            
            logger.info(f"Cached: {cache_key} (TTL: {expiration}s)")
            return True
            
        except Exception as e:
            logger.info(f"Cache set error: {e}")
            return False
    
    def delete(self, cache_key: str) -> bool:
        """
        Delete cached data.
        
        Args:
            cache_key: Cache key
            
        Returns:
            True if deleted, False otherwise
        """
        if not self.enabled or not self.redis_client:
            return False
        
        try:
            result = self.redis_client.delete(cache_key)
            if result:
                logger.info(f"Deleted cache: {cache_key}")
            return bool(result)
        except Exception as e:
            logger.info(f"Cache delete error: {e}")
            return False
    
    def clear_all(self, pattern: str = "query:*") -> int:
        """
        Clear all cached queries matching pattern.
        
        Args:
            pattern: Key pattern to match (default: all queries)
            
        Returns:
            Number of keys deleted
        """
        if not self.enabled or not self.redis_client:
            return 0
        
        try:
            # Find all matching keys
            keys = self.redis_client.keys(pattern)
            
            if keys:
                # Delete all matching keys
                count = self.redis_client.delete(*keys)
                logger.info(f"Cleared {count} cached queries")
                return count
            return 0
            
        except Exception as e:
            logger.info(f"Cache clear error: {e}")
            return 0
    
    def get_stats(self) -> Dict[str, Any]:
        """
        Get cache statistics.
        
        Returns:
            Dictionary with cache stats
        """
        if not self.enabled or not self.redis_client:
            return {
                "enabled": False,
                "message": "Caching is disabled"
            }
        
        try:
            hits = int(self.redis_client.get("cache:hits") or 0)
            misses = int(self.redis_client.get("cache:misses") or 0)
            total = hits + misses
            hit_rate = (hits / total * 100) if total > 0 else 0
            
            # Count cached queries
            query_keys = self.redis_client.keys("query:*")
            
            # Get Redis info
            info = self.redis_client.info("memory")
            
            return {
                "enabled": True,
                "hits": hits,
                "misses": misses,
                "total_requests": total,
                "hit_rate_percent": round(hit_rate, 2),
                "cached_queries": len(query_keys),
                "memory_used_mb": round(info.get("used_memory", 0) / 1024 / 1024, 2),
                "ttl_seconds": self.ttl
            }
            
        except Exception as e:
            logger.info(f"Error getting cache stats: {e}")
            return {
                "enabled": True,
                "error": str(e)
            }
    
    def invalidate_document_cache(self, doc_id: str) -> int:
        """
        Invalidate all caches related to a document.
        Called when a document is updated or deleted.
        
        Args:
            doc_id: Document ID
            
        Returns:
            Number of caches invalidated
        """
        if not self.enabled or not self.redis_client:
            return 0
        
        # For simplicity, clear all query caches
        # In production, you might track which queries returned which documents
        return self.clear_all("query:*")


# Singleton instance
_cache_manager = None

def get_cache_manager() -> CacheManager:
    """Get or create cache manager singleton"""
    global _cache_manager
    if _cache_manager is None:
        _cache_manager = CacheManager()
    return _cache_manager