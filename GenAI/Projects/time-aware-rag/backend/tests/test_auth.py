"""
Tests for API Key Authentication
"""


def test_no_api_key_returns_401(client):
    """Request without API key should be rejected."""
    response = client.get("/api/documents")
    assert response.status_code == 401
    assert "Missing API key" in str(response.json())


def test_invalid_api_key_returns_401(client):
    """Request with wrong API key should be rejected."""
    response = client.get("/api/documents", headers={"X-API-Key": "wrong-key"})
    assert response.status_code == 401
    assert "Invalid API key" in str(response.json())


def test_valid_api_key_works(client, auth_headers):
    """Request with valid API key should succeed."""
    response = client.get("/api/documents", headers=auth_headers)
    assert response.status_code == 200


def test_health_no_auth_needed(client):
    """Health endpoints should work without API key."""
    response = client.get("/health")
    assert response.status_code == 200

    response = client.get("/health/detailed")
    assert response.status_code == 200


def test_query_requires_auth(client):
    """Query endpoint should require API key."""
    response = client.post("/api/query", json={
        "query": "test", "query_date": "2024-01-01", "k": 5
    })
    assert response.status_code == 401


def test_search_requires_auth(client):
    """Search endpoint should require API key."""
    response = client.post("/api/search-fulltext", json={
        "search_text": "test", "limit": 5
    })
    assert response.status_code == 401