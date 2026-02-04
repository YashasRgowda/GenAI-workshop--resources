from fastapi import APIRouter, HTTPException
from app.models import DocumentUpload, QueryRequest, QueryResponse, DocumentResponse
from typing import List
from core.retriever import get_retriever
from llm.gemini_client import get_gemini_client

router = APIRouter(prefix="/api", tags=["RAG"])

@router.post("/upload", response_model=dict)
async def upload_document(doc: DocumentUpload):
    """Upload a document with temporal metadata"""
    try:
        retriever = get_retriever()
        
        doc_id = retriever.add_document(
            content=doc.content,
            valid_from=doc.valid_from,
            valid_to=doc.valid_to,
            source=doc.source,
            metadata=doc.metadata
        )
        
        return {
            "status": "success",
            "doc_id": doc_id,
            "message": "Document uploaded successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/query", response_model=QueryResponse)
async def query_documents(request: QueryRequest):
    """Query documents with time-aware retrieval and LLM generation"""
    try:
        retriever = get_retriever()
        gemini = get_gemini_client()
        
        # Retrieve relevant documents
        docs, scores = retriever.retrieve(
            query=request.query,
            query_date=request.query_date,
            k=request.k
        )
        
        # Generate answer using LLM
        answer = gemini.generate_answer(
            query=request.query,
            context_docs=docs,
            query_date=request.query_date
        )
        
        # Prepare sources
        sources = [
            {
                "doc_id": doc["doc_id"],
                "content": doc["content"][:200] + "..." if len(doc["content"]) > 200 else doc["content"],
                "valid_from": doc["valid_from"],
                "valid_to": doc["valid_to"],
                "source": doc["source"],
                "score": float(score)
            }
            for doc, score in zip(docs, scores)
        ]
        
        return QueryResponse(
            answer=answer,
            sources=sources,
            query_date=request.query_date,
            retrieved_count=len(docs)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/documents", response_model=List[DocumentResponse])
async def list_documents():
    """List all documents with metadata"""
    try:
        retriever = get_retriever()
        docs = retriever.get_all_documents()
        
        return [
            DocumentResponse(
                doc_id=doc["doc_id"],
                content=doc["content"],
                valid_from=doc["valid_from"],
                valid_to=doc["valid_to"],
                source=doc.get("source", "unknown"),
                created_at=doc["created_at"]
            )
            for doc in docs
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/documents/{doc_id}")
async def delete_document(doc_id: str):
    """Delete a document"""
    try:
        retriever = get_retriever()
        success = retriever.delete_document(doc_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="Document not found")
        
        return {
            "status": "success",
            "message": f"Document {doc_id} deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Test endpoints
@router.post("/test-add")
async def test_add_document():
    """Test adding a document"""
    retriever = get_retriever()
    
    doc_id = retriever.add_document(
        content="Users must enable 2FA for login starting January 2023.",
        valid_from="2023-01-01",
        valid_to="2024-12-31",
        source="policy_v1.txt"
    )
    
    return {"doc_id": doc_id, "status": "added"}

@router.post("/test-search")
async def test_search(query: str = "login policy", date: str = "2023-06-15"):
    """Test time-aware search"""
    retriever = get_retriever()
    
    docs, scores = retriever.retrieve(query, date, k=3)
    
    return {
        "query": query,
        "date": date,
        "results": [
            {
                "content": doc["content"][:100],
                "valid_from": doc["valid_from"],
                "valid_to": doc["valid_to"],
                "score": score
            }
            for doc, score in zip(docs, scores)
        ]
    }

@router.get("/stats")
async def get_stats():
    """Get system statistics"""
    retriever = get_retriever()
    vector_stats = retriever.vector_store.get_stats()
    metadata_stats = retriever.metadata_store.get_stats()
    
    return {
        "vector_store": vector_stats,
        "metadata_store": metadata_stats
    }