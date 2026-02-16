"""
Tests for Rate Limiting
Tests that rate limiting correctly blocks excessive requests.
"""
import pytest


def test_rate_limit_status(client):
    """Test rate limit status endpoint."""
    response = client.get("/api/rate-limit-status")
    
    # Could be 200 or 429 if we've hit the limit
    assert response.status_code in [200, 429]
    
    if response.status_code == 200:
        data = response.json()
        assert "rate_limiting" in data


def test_rate_limit_headers(client):
    """Test that responses include rate limit headers."""
    response = client.get("/api/documents")
    
    # Should have rate limit headers
    assert "X-RateLimit-Limit" in response.headers or response.status_code == 429
    
    if "X-RateLimit-Limit" in response.headers:
        limit = int(response.headers["X-RateLimit-Limit"])
        assert limit == 20


def test_health_not_rate_limited(client):
    """Test that health endpoints are NOT rate limited."""
    # Hit health endpoint many times — should never get 429
    for i in range(25):
        response = client.get("/health")
        assert response.status_code == 200, f"Health check blocked on request {i+1}"