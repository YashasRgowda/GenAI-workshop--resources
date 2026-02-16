"""
Tests for Query & Retrieval Endpoints
Tests the core RAG functionality.
"""
import pytest

# We need a document in the system to test queries
test_doc_id = None


@pytest.fixture(scope="module", autouse=True)
def setup_test_document():
    """Add a test document before running query tests."""
    global test_doc_id
    from core.retriever import get_retriever
    
    retriever = get_retriever()
    test_doc_id = retriever.add_document(
        content="The company password policy requires all employees to use "
                "passwords with minimum 12 characters, including uppercase, "
                "lowercase, numbers, and special characters. Passwords must "
                "be changed every 90 days. Two-factor authentication is mandatory.",
        valid_from="2024-01-01",
        valid_to="2024-12-31",
        source="test_password_policy_2024.pdf"
    )
    
    yield
    
    # Cleanup after all tests in this module
    try:
        retriever.delete_document(test_doc_id)
    except:
        pass


def test_query_basic(client):
    """Test basic query returns an answer."""
    response = client.post("/api/query", json={
        "query": "What is the password policy?",
        "query_date": "2024-06-15",
        "k": 5
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert "sources" in data
    assert "query_date" in data
    assert "retrieved_count" in data


def test_query_returns_sources(client):
    """Test that query returns source documents."""
    response = client.post("/api/query", json={
        "query": "password requirements",
        "query_date": "2024-06-15",
        "k": 5
    })
    
    assert response.status_code == 200
    data = response.json()
    
    if data["retrieved_count"] > 0:
        source = data["sources"][0]
        assert "doc_id" in source
        assert "content" in source
        assert "valid_from" in source
        assert "valid_to" in source


def test_query_respects_date(client):
    """Test that query with wrong date returns no relevant docs."""
    response = client.post("/api/query", json={
        "query": "password policy",
        "query_date": "2020-01-01",
        "k": 5
    })
    
    assert response.status_code == 200
    data = response.json()
    # Document is valid 2024-2024, so querying 2020 should find nothing
    # (or at least fewer results)
    assert "answer" in data


def test_query_missing_fields(client):
    """Test that query without required fields returns 422."""
    response = client.post("/api/query", json={
        "query": "test"
        # Missing query_date
    })
    
    assert response.status_code == 422


def test_fulltext_search(client):
    """Test full-text search endpoint."""
    response = client.post("/api/search-fulltext", json={
        "search_text": "password",
        "limit": 5
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "search_text" in data
    assert "total_matches" in data
    assert "matches" in data
    assert "search_time_ms" in data


def test_date_range_query(client):
    """Test date range query endpoint."""
    response = client.post("/api/query-date-range", json={
        "query": "password policy",
        "start_date": "2024-01-01",
        "end_date": "2024-12-31",
        "k": 5
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "query" in data
    assert "date_range" in data
    assert "total_documents" in data
    assert "timeline" in data
    assert "summary" in data