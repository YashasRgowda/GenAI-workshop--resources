"""
Tests for Document CRUD Operations
Tests adding, listing, and deleting documents.
"""
import pytest


# Store doc_id across tests in this module
created_doc_ids = []


def test_list_documents_initially(client):
    """Test that listing documents returns a valid response."""
    response = client.get("/api/documents")
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_add_document_via_query(client, sample_document):
    """
    Test adding a document by using the retriever directly.
    We'll add via the API and verify it appears in the list.
    """
    from core.retriever import get_retriever
    
    retriever = get_retriever()
    doc_id = retriever.add_document(
        content=sample_document["content"],
        valid_from=sample_document["valid_from"],
        valid_to=sample_document["valid_to"],
        source=sample_document["source"]
    )
    
    assert doc_id is not None
    assert len(doc_id) > 0
    created_doc_ids.append(doc_id)


def test_document_appears_in_list(client):
    """Test that the added document appears in the document list."""
    response = client.get("/api/documents")
    
    assert response.status_code == 200
    data = response.json()
    
    # Should have at least 1 document
    assert len(data) >= 1
    
    # Check document structure
    doc = data[0]
    assert "doc_id" in doc
    assert "content" in doc
    assert "valid_from" in doc
    assert "valid_to" in doc
    assert "source" in doc


def test_document_has_correct_fields(client):
    """Test that document has all required fields with correct types."""
    response = client.get("/api/documents")
    data = response.json()
    
    if len(data) > 0:
        doc = data[0]
        # valid_from and valid_to should be date strings
        assert len(doc["valid_from"]) == 10  # YYYY-MM-DD
        assert len(doc["valid_to"]) == 10
        assert doc["valid_from"].count("-") == 2
        assert doc["valid_to"].count("-") == 2


def test_delete_document(client):
    """Test deleting a document."""
    if not created_doc_ids:
        pytest.skip("No document to delete")
    
    doc_id = created_doc_ids[0]
    response = client.delete(f"/api/documents/{doc_id}")
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"


def test_delete_nonexistent_document(client):
    """Test deleting a document that doesn't exist returns 404."""
    fake_id = "00000000-0000-0000-0000-000000000000"
    response = client.delete(f"/api/documents/{fake_id}")
    
    assert response.status_code == 404