"""
Tests for Document Versioning
Tests version creation and history tracking.
"""
import pytest

version_test_doc_id = None


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
    
    # Cleanup
    try:
        retriever.delete_document(version_test_doc_id)
    except:
        pass


def test_get_version_history(client):
    """Test getting version history of a document."""
    if not version_test_doc_id:
        pytest.skip("No test document")
    
    response = client.get(f"/api/documents/{version_test_doc_id}/versions")
    
    assert response.status_code == 200
    data = response.json()
    assert "total_versions" in data
    assert "versions" in data
    assert data["total_versions"] >= 1


def test_create_new_version(client):
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
            "change_summary": "Increased leave from 20 to 25 days, added mental health days"
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "new_doc_id" in data
    assert data["original_doc_id"] == version_test_doc_id


def test_version_history_updated(client):
    """Test that version history now shows 2 versions."""
    if not version_test_doc_id:
        pytest.skip("No test document")
    
    response = client.get(f"/api/documents/{version_test_doc_id}/versions")
    
    assert response.status_code == 200
    data = response.json()
    assert data["total_versions"] >= 2
    
    # Check versions are ordered
    versions = data["versions"]
    for i in range(len(versions) - 1):
        assert versions[i]["version"] <= versions[i + 1]["version"]


def test_get_latest_version(client):
    """Test getting the latest version of a document."""
    if not version_test_doc_id:
        pytest.skip("No test document")
    
    response = client.get(f"/api/documents/{version_test_doc_id}/latest")
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "25 days" in data["content"]  # Should be the updated version


def test_nonexistent_document_versions(client):
    """Test version history for nonexistent document returns 404."""
    fake_id = "00000000-0000-0000-0000-000000000000"
    response = client.get(f"/api/documents/{fake_id}/versions")
    
    assert response.status_code == 404