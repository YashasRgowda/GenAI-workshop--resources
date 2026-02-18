"""
Tests for Redis Caching
Tests cache hit, miss, and invalidation.
"""
import pytest
from core.cache import get_cache_manager


def test_cache_stats(client, auth_headers):
    """Test cache stats endpoint returns valid data."""
    response = client.get("/api/cache/stats", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    
    # Should have enabled status
    assert "enabled" in data


def test_cache_set_and_get():
    """Test storing and retrieving from cache."""
    cache = get_cache_manager()
    
    if not cache.enabled:
        pytest.skip("Redis not available")
    
    # Set a test value
    test_key = "test:cache_test"
    test_data = {"answer": "test answer", "sources": []}
    
    result = cache.set(test_key, test_data)
    assert result == True
    
    # Get it back
    retrieved = cache.get(test_key)
    assert retrieved is not None
    assert retrieved["answer"] == "test answer"
    
    # Clean up
    cache.delete(test_key)


def test_cache_miss():
    """Test that cache miss returns None."""
    cache = get_cache_manager()
    
    if not cache.enabled:
        pytest.skip("Redis not available")
    
    result = cache.get("test:nonexistent_key")
    assert result is None


def test_cache_delete():
    """Test deleting from cache."""
    cache = get_cache_manager()
    
    if not cache.enabled:
        pytest.skip("Redis not available")
    
    # Set then delete
    test_key = "test:delete_test"
    cache.set(test_key, {"data": "test"})
    
    deleted = cache.delete(test_key)
    assert deleted == True
    
    # Verify it's gone
    result = cache.get(test_key)
    assert result is None


def test_cache_clear(client, auth_headers):
    """Test clearing all caches via API."""
    response = client.post("/api/cache/clear", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"


def test_cache_key_generation():
    """Test that same query generates same cache key."""
    cache = get_cache_manager()
    
    key1 = cache._generate_cache_key("vpn policy", "2024-01-15", 5)
    key2 = cache._generate_cache_key("vpn policy", "2024-01-15", 5)
    key3 = cache._generate_cache_key("different query", "2024-01-15", 5)
    
    assert key1 == key2          # Same params → same key
    assert key1 != key3          # Different query → different key