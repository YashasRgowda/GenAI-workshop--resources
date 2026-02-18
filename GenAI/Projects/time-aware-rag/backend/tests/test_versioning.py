"""
Tests for Document Versioning
"""
import pytest
import pytest
import redis


version_test_doc_id = None


@pytest.fixture(scope="module", autouse=True)
def clear_rate_limit():
    """Clear rate limit counter before versioning tests."""
    try:
        r = redis.Redis(host="redis", port=6379, db=0)
        for key in r.scan_iter("ratelimit:*"):
            r.delete(key)
    except:
        try:
            r = redis.Redis(host="localhost", port=6380, db=0)
            for key in r.scan_iter("ratelimit:*"):
                r.delete(key)
        except:
            pass
    yield


@pytest.fixture(scope="module", autouse=True)
def setup_version_test_document():
    """Add a document to test versioning."""
    global version_test_doc_id
    from core.retriever import get_retriever
    
    retriever = get_retriever()
    version_test_doc_id = retriever.add_document(
        content="Original leave policy: Employees get 20 days paid leave per year.",
        valid_from="2023-01-01",
        valid_to="2023-12-31",
        source="test_leave_policy.pdf"
    )
    
    yield
    
    try:
        retriever.delete_document(version_test_doc_id)
    except:
        pass


def test_get_version_history(client, auth_headers):
    """Test getting version history of a document."""
    if not version_test_doc_id:
        pytest.skip("No test document")

    response = client.get(f"/api/documents/{version_test_doc_id}/versions", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert "total_versions" in data
    assert data["total_versions"] >= 1


def test_create_new_version(client, auth_headers):
    """Test creating a new version of a document."""
    if not version_test_doc_id:
        pytest.skip("No test document")
    
    response = client.post(
        f"/api/documents/{version_test_doc_id}/new-version",
        data={
            "new_content": "Updated leave policy: Employees get 25 days paid leave per year. "
                           "Additional 5 days for mental health.",
            "valid_from": "2024-01-01",
            "valid_to": "2024-12-31",
            "change_summary": "Increased leave from 20 to 25 days"
        }, headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "new_doc_id" in data


def test_version_history_after_update(client, auth_headers):
    """Test that version history shows 2 versions after creating new version."""
    if not version_test_doc_id:
        pytest.skip("No test document")

    response = client.get(f"/api/documents/{version_test_doc_id}/versions", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["total_versions"] >= 2


def test_get_latest_version(client, auth_headers):
    """Test getting the latest version of a document."""
    if not version_test_doc_id:
        pytest.skip("No test document")
    
    response = client.get(f"/api/documents/{version_test_doc_id}/latest", headers=auth_headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "25 days" in data["content"]


def test_nonexistent_document_versions(client, auth_headers):
    """Test version history for nonexistent document returns 404."""
    fake_id = "00000000-0000-0000-0000-000000000000"
    response = client.get(f"/api/documents/{fake_id}/versions", headers=auth_headers)

    assert response.status_code == 404