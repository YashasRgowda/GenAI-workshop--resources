"""
Tests for Health Check Endpoints
Verifies that the app and its dependencies are working.
"""


def test_basic_health(client):
    """Test basic health check returns healthy status."""
    response = client.get("/health")
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "Time-Aware RAG API"


def test_detailed_health(client):
    """Test detailed health check shows all services."""
    response = client.get("/health/detailed")
    
    assert response.status_code == 200
    data = response.json()
    
    # Should have status and services
    assert "status" in data
    assert "services" in data
    
    # Should check PostgreSQL
    assert "postgresql" in data["services"]
    pg_status = data["services"]["postgresql"]["status"]
    assert pg_status in ["connected", "disconnected"]
    
    # Should check Redis
    assert "redis" in data["services"]