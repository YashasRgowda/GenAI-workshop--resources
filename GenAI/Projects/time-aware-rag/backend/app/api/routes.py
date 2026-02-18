from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from app.auth import verify_api_key
from app.models import (
    QueryRequest, 
    QueryResponse, 
    DocumentResponse,
    DateRangeQueryRequest,      # Add
    DateRangeQueryResponse,     # Add
    PolicyComparisonRequest,    # Add
    PolicyComparisonResponse,
    DocumentVersionInfo,     
    DocumentVersionHistory,
    FullTextSearchRequest,      # Add
    FullTextSearchResponse,     # Add
    SearchMatch,                # Add
    CombinedSearchRequest
)
from typing import List, Optional
from core.retriever import get_retriever
from llm.gemini_client import get_gemini_client
from core.pdf_processor import (
    extract_text_from_pdf, 
    validate_pdf,
    extract_metadata_from_pdf
)
from core.cache import get_cache_manager
import time
import json

router = APIRouter(prefix="/api", tags=["RAG"])


# ==================== 🤖 SMART PDF UPLOAD (AI AUTO-EXTRACTS DATES) ====================

@router.post("/smart-upload-pdf")
async def smart_upload_pdf(
    file: UploadFile = File(..., description="PDF file - dates will be auto-extracted"),
    api_key: str = Depends(verify_api_key)
):
    """
    🤖 SMART PDF UPLOAD - Automatically extracts dates from document!
    
    Just upload the PDF, AI will:
    - Extract all text
    - Find "Effective Date" 
    - Find "Valid Through" date
    - Store with correct temporal validity
    
    No manual date entry needed!
    """
    try:
        # Validate file type
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        
        # Read file
        file_content = await file.read()
        
        # Validate PDF
        if not validate_pdf(file_content):
            raise HTTPException(status_code=400, detail="Invalid PDF file")
        
        # 🤖 AI EXTRACTION - Get everything automatically!
        print(f"\n🤖 Processing {file.filename} with AI extraction...")
        extracted_data = extract_metadata_from_pdf(file_content)
        
        # Check if we got dates
        if not extracted_data["valid_from"] or not extracted_data["valid_to"]:
            raise HTTPException(
                status_code=400,
                detail=f"Could not extract dates from PDF. Please ensure document contains 'Effective Date' and 'Valid Through' fields."
            )
        
        # Add to system
        retriever = get_retriever()
        doc_id = retriever.add_document(
            content=extracted_data["content"],
            valid_from=extracted_data["valid_from"],
            valid_to=extracted_data["valid_to"],
            source=file.filename,
            metadata=extracted_data["metadata"]
        )
        
        return {
            "status": "success",
            "doc_id": doc_id,
            "filename": file.filename,
            "extracted_dates": {
                "valid_from": extracted_data["valid_from"],
                "valid_to": extracted_data["valid_to"]
            },
            "metadata": extracted_data["metadata"],
            "message": f"✅ Successfully auto-extracted dates and stored {file.filename}"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.post("/smart-batch-upload-pdf")
async def smart_batch_upload_pdfs(
    files: List[UploadFile] = File(..., description="Multiple PDFs - dates auto-extracted from each"),
    api_key: str = Depends(verify_api_key)
):
    """
    🤖 SMART BATCH UPLOAD - Upload multiple PDFs, AI extracts dates from each!
    
    Just drag & drop all your policy PDFs!
    Each document's dates are extracted individually.
    """
    try:
        results = {
            "successful": 0,
            "failed": 0,
            "doc_ids": [],
            "documents": [],
            "errors": []
        }
        
        retriever = get_retriever()
        
        for file in files:
            try:
                print(f"\n📄 Processing: {file.filename}")
                
                # Validate
                if not file.filename.lower().endswith('.pdf'):
                    results["failed"] += 1
                    results["errors"].append({
                        "filename": file.filename,
                        "error": "Not a PDF file"
                    })
                    continue
                
                # Read and validate
                file_content = await file.read()
                if not validate_pdf(file_content):
                    results["failed"] += 1
                    results["errors"].append({
                        "filename": file.filename,
                        "error": "Invalid PDF format"
                    })
                    continue
                
                # 🤖 AI EXTRACTION
                extracted_data = extract_metadata_from_pdf(file_content)
                
                # Check dates
                if not extracted_data["valid_from"] or not extracted_data["valid_to"]:
                    results["failed"] += 1
                    results["errors"].append({
                        "filename": file.filename,
                        "error": "Could not extract dates from document"
                    })
                    continue
                
                # Add to system
                doc_id = retriever.add_document(
                    content=extracted_data["content"],
                    valid_from=extracted_data["valid_from"],
                    valid_to=extracted_data["valid_to"],
                    source=file.filename,
                    metadata=extracted_data["metadata"]
                )
                
                results["successful"] += 1
                results["doc_ids"].append(doc_id)
                results["documents"].append({
                    "filename": file.filename,
                    "doc_id": doc_id,
                    "valid_from": extracted_data["valid_from"],
                    "valid_to": extracted_data["valid_to"],
                    "metadata": extracted_data["metadata"]
                })
                
                print(f"✅ {file.filename}: {extracted_data['valid_from']} to {extracted_data['valid_to']}")
                
            except Exception as e:
                results["failed"] += 1
                results["errors"].append({
                    "filename": file.filename,
                    "error": str(e)
                })
                print(f"❌ Error with {file.filename}: {e}")
        
        return {
            "status": "completed",
            "total_files": len(files),
            "successful": results["successful"],
            "failed": results["failed"],
            "documents": results["documents"],
            "errors": results["errors"]
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== QUERY & RETRIEVAL ====================

# Update the /query endpoint with caching
@router.post("/query", response_model=QueryResponse)
async def query_documents(request: QueryRequest, api_key: str = Depends(verify_api_key)):
    """Query documents with time-aware retrieval and LLM generation (with caching)"""
    try:
        cache = get_cache_manager()
        
        # Generate cache key
        cache_key = cache._generate_cache_key(
            query=request.query,
            query_date=request.query_date,
            k=request.k
        )
        
        # Try to get from cache
        cached_result = cache.get(cache_key)
        if cached_result:
            # Return cached result
            return QueryResponse(**cached_result)
        
        # Cache miss - process query normally
        start_time = time.time()
        
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
        
        # Build response
        response_data = {
            "answer": answer,
            "sources": sources,
            "query_date": request.query_date,
            "retrieved_count": len(docs)
        }
        
        # Cache the result
        cache.set(cache_key, response_data)
        
        process_time = (time.time() - start_time) * 1000
        print(f"⏱️ Query processed in {process_time:.2f}ms (uncached)")
        
        return QueryResponse(**response_data)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== DATE RANGE QUERIES ====================

@router.post("/query-date-range", response_model=DateRangeQueryResponse)
async def query_date_range(request: DateRangeQueryRequest, api_key: str = Depends(verify_api_key)):
    """
    📅 Query documents across a date range.
    
    Example: "What changed in the VPN policy between 2022-2024?"
    
    Returns documents grouped by year with AI-generated summary.
    """
    try:
        retriever = get_retriever()
        gemini = get_gemini_client()
        
        # Retrieve across date range
        range_results = retriever.retrieve_date_range(
            query=request.query,
            start_date=request.start_date,
            end_date=request.end_date,
            k=request.k
        )
        
        # Build timeline and documents by period
        timeline = []
        documents_by_period = {}
        
        for period_label, period_data in range_results["results_by_period"].items():
            docs = period_data["documents"]
            
            if docs:
                timeline.append({
                    "period": period_label,
                    "document_count": len(docs),
                    "sources": [d["source"] for d in docs]
                })
                
                documents_by_period[period_label] = [
                    {
                        "doc_id": doc["doc_id"],
                        "content_preview": doc["content"][:200] + "...",
                        "valid_from": doc["valid_from"],
                        "valid_to": doc["valid_to"],
                        "source": doc["source"]
                    }
                    for doc in docs
                ]
        
        # Generate AI summary
        if timeline:
            all_docs = []
            for period_data in range_results["results_by_period"].values():
                all_docs.extend(period_data["documents"])
            
            summary_prompt = f"""Analyze these policy documents from {request.start_date} to {request.end_date} about '{request.query}'.

Timeline: {timeline}

Provide a brief summary of:
1. What changed over this time period
2. Key policy updates
3. Major differences between versions

Keep it concise (3-4 sentences)."""

            try:
                summary = gemini.generate_answer(
                    query=summary_prompt,
                    context_docs=all_docs[:5],
                    query_date=request.end_date
                )
            except:
                summary = f"Found {len(all_docs)} documents across {len(timeline)} time periods."
        else:
            summary = "No documents found in the specified date range."
        
        return DateRangeQueryResponse(
            query=request.query,
            date_range={
                "start": request.start_date,
                "end": request.end_date
            },
            total_documents=range_results["total_documents"],
            documents_by_period=documents_by_period,
            timeline=timeline,
            summary=summary
        )
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/compare-policy", response_model=PolicyComparisonResponse)
async def compare_policy_versions(request: PolicyComparisonRequest, api_key: str = Depends(verify_api_key)):
    """
    🔄 Compare different versions of a policy across time.
    
    Example: Compare "password policy" from 2020 to 2025
    
    Shows evolution of the policy with AI-generated comparison.
    """
    try:
        retriever = get_retriever()
        gemini = get_gemini_client()
        
        # Get policy versions
        comparison = retriever.compare_policy_versions(
            topic=request.topic,
            start_date=request.start_date,
            end_date=request.end_date
        )
        
        # Generate AI comparison summary
        if comparison["versions"]:
            versions_text = "\n\n".join([
                f"Version {v['version_number']} ({v['valid_from']} to {v['valid_to']}):\n{v['content_preview']}"
                for v in comparison["versions"]
            ])
            
            comparison_prompt = f"""Compare these versions of {request.topic}:

{versions_text}

Provide a concise comparison highlighting:
1. Major changes between versions
2. What stayed the same
3. Overall evolution/trend

Keep it brief (4-5 sentences)."""

            try:
                docs = [
                    {
                        "doc_id": v["doc_id"],
                        "content": v["content_preview"],
                        "valid_from": v["valid_from"],
                        "valid_to": v["valid_to"],
                        "source": v["source"]
                    }
                    for v in comparison["versions"]
                ]
                
                comparison_summary = gemini.generate_answer(
                    query=comparison_prompt,
                    context_docs=docs,
                    query_date=request.end_date
                )
            except:
                comparison_summary = f"Found {len(comparison['versions'])} versions of {request.topic}."
        else:
            comparison_summary = f"No versions found for '{request.topic}' in the specified date range."
        
        return PolicyComparisonResponse(
            topic=request.topic,
            date_range={
                "start": request.start_date,
                "end": request.end_date
            },
            versions=comparison["versions"],
            changes_detected=len(comparison["versions"]) - 1,
            comparison_summary=comparison_summary
        )
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# ==================== DOCUMENT MANAGEMENT ====================

@router.get("/documents", response_model=List[DocumentResponse])
async def list_documents(api_key: str = Depends(verify_api_key)):
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
async def delete_document(doc_id: str, api_key: str = Depends(verify_api_key)):
    """Delete a document"""
    try:
        retriever = get_retriever()
        success = retriever.delete_document(doc_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Invalidate related caches
        cache = get_cache_manager()
        cache.invalidate_document_cache(doc_id)
        
        return {
            "status": "success",
            "message": f"Document {doc_id} deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    
# ==================== DOCUMENT VERSIONING ====================

@router.post("/documents/{doc_id}/new-version")
async def create_document_version(
    doc_id: str,
    new_content: str = Form(..., description="Updated content"),
    valid_from: str = Form(..., description="New validity start (YYYY-MM-DD)"),
    valid_to: str = Form(..., description="New validity end (YYYY-MM-DD)"),
    change_summary: Optional[str] = Form(None, description="Summary of changes"),
    api_key: str = Depends(verify_api_key)
):
    """
    📝 Create a new version of an existing document.
    
    Creates version history and marks old version as outdated.
    """
    try:
        retriever = get_retriever()
        
        # Create new version in metadata store
        new_doc_id = retriever.metadata_store.update_document_version(
            original_doc_id=doc_id,
            new_content=new_content,
            valid_from=valid_from,
            valid_to=valid_to,
            change_summary=change_summary
        )
        
        # Generate embedding for new version
        embedding = retriever.embedder.encode(new_content)
        retriever.vector_store.add_vectors(embedding, [new_doc_id])
        retriever.vector_store.save()
        
        return {
            "status": "success",
            "new_doc_id": new_doc_id,
            "original_doc_id": doc_id,
            "message": "New version created successfully"
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/documents/{doc_id}/versions", response_model=DocumentVersionHistory)
async def get_document_version_history(doc_id: str, api_key: str = Depends(verify_api_key)):
    """
    📚 Get complete version history of a document.
    
    Shows all versions with timestamps and change summaries.
    """
    try:
        retriever = get_retriever()
        
        # Get all versions
        versions = retriever.metadata_store.get_document_versions(doc_id)
        
        if not versions:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Build timeline
        timeline = []
        for v in versions:
            timeline.append({
                "version": v["version"],
                "date": v["updated_at"],
                "change": v["change_summary"] or "Initial version",
                "is_latest": v["is_latest"]
            })
        
        # Get original doc ID (first version)
        original_doc_id = versions[0]["parent_doc_id"] or versions[0]["doc_id"]
        
        # Convert to response format
        version_infos = [
            DocumentVersionInfo(
                doc_id=v["doc_id"],
                version=v["version"],
                parent_doc_id=v["parent_doc_id"],
                is_latest=v["is_latest"],
                created_at=v["created_at"],
                updated_at=v["updated_at"],
                change_summary=v["change_summary"],
                content_preview=v["content"][:200] + "...",
                valid_from=v["valid_from"],
                valid_to=v["valid_to"],
                source=v["source"]
            )
            for v in versions
        ]
        
        return DocumentVersionHistory(
            original_doc_id=original_doc_id,
            total_versions=len(versions),
            versions=version_infos,
            timeline=timeline
        )
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/documents/{doc_id}/latest")
async def get_latest_document_version(doc_id: str, api_key: str = Depends(verify_api_key)):
    """
    🔄 Get the latest version of a document.
    
    Useful when you have an old version ID but want current content.
    """
    try:
        retriever = get_retriever()
        
        latest = retriever.metadata_store.get_latest_version(doc_id)
        
        if not latest:
            raise HTTPException(status_code=404, detail="Document not found")
        
        return {
            "status": "success",
            "latest_doc_id": latest["doc_id"],
            "version": latest.get("version", 1),
            "content": latest["content"],
            "valid_from": latest["valid_from"],
            "valid_to": latest["valid_to"],
            "source": latest["source"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== FULL-TEXT SEARCH ====================

@router.post("/search-fulltext", response_model=FullTextSearchResponse)
async def full_text_search(request: FullTextSearchRequest, api_key: str = Depends(verify_api_key)):
    """
    🔍 Full-text search within document content.
    
    Fast PostgreSQL text search for keywords and phrases.
    Returns matching documents with highlighted snippets.
    
    Example: "Find all documents mentioning 'hardware token'"
    """
    try:
        import time
        start_time = time.time()
        
        retriever = get_retriever()
        
        # Perform full-text search
        results = retriever.metadata_store.full_text_search(
            search_text=request.search_text,
            start_date=request.start_date,
            end_date=request.end_date,
            limit=request.limit
        )
        
        search_time = (time.time() - start_time) * 1000
        
        # Format results
        matches = []
        for result in results:
            matches.append(SearchMatch(
                doc_id=result["doc_id"],
                source=result["source"],
                valid_from=result["valid_from"],
                valid_to=result["valid_to"],
                content_preview=result["content"][:300] + "...",
                match_highlights=result["highlights"],
                relevance_score=result["relevance_score"]
            ))
        
        return FullTextSearchResponse(
            search_text=request.search_text,
            total_matches=len(matches),
            matches=matches,
            search_time_ms=search_time
        )
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/search-combined")
async def combined_search(request: CombinedSearchRequest, api_key: str = Depends(verify_api_key)):
    """
    🎯 Combined semantic + full-text search (BEST RESULTS!)
    
    Uses both:
    - Semantic search (understands meaning via embeddings)
    - Full-text search (finds exact keywords)
    
    Returns best of both worlds!
    """
    try:
        retriever = get_retriever()
        gemini = get_gemini_client()
        
        semantic_ids = []
        semantic_docs = []
        
        # Semantic search
        if request.use_semantic:
            docs, scores = retriever.retrieve(
                query=request.query,
                query_date=request.query_date,
                k=request.k
            )
            semantic_docs = docs
            semantic_ids = [d["doc_id"] for d in docs]
        
        # Combined search
        combined_results = retriever.metadata_store.combined_search(
            query=request.query,
            query_date=request.query_date,
            semantic_ids=semantic_ids if request.use_semantic else None,
            fulltext_search=request.query if request.use_fulltext else None,
            k=request.k
        )
        
        # Generate answer
        answer = gemini.generate_answer(
            query=request.query,
            context_docs=combined_results,
            query_date=request.query_date
        )
        
        # Format sources
        sources = [
            {
                "doc_id": doc["doc_id"],
                "content": doc["content"][:200] + "...",
                "valid_from": doc["valid_from"],
                "valid_to": doc["valid_to"],
                "source": doc["source"]
            }
            for doc in combined_results
        ]
        
        return {
            "answer": answer,
            "sources": sources,
            "query_date": request.query_date,
            "search_methods": {
                "semantic": request.use_semantic,
                "fulltext": request.use_fulltext
            },
            "total_results": len(combined_results)
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    
    
# ==================== CACHE MANAGEMENT ====================

@router.get("/cache/stats")
async def get_cache_stats(api_key: str = Depends(verify_api_key)):
    """
    📊 Get cache statistics.
    
    Shows hit rate, total cached queries, memory usage.
    """
    try:
        cache = get_cache_manager()
        return cache.get_stats()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/cache/clear")
async def clear_cache(api_key: str = Depends(verify_api_key)):
    """
    🗑️ Clear all cached queries.
    
    Use this when documents are updated and you want to refresh all caches.
    """
    try:
        cache = get_cache_manager()
        count = cache.clear_all()
        return {
            "status": "success",
            "cleared_count": count,
            "message": f"Cleared {count} cached queries"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/cache/invalidate/{doc_id}")
async def invalidate_document_cache(doc_id: str, api_key: str = Depends(verify_api_key)):
    """
    ♻️ Invalidate caches related to a specific document.
    
    Called automatically when a document is updated or deleted.
    """
    try:
        cache = get_cache_manager()
        count = cache.invalidate_document_cache(doc_id)
        return {
            "status": "success",
            "invalidated_count": count,
            "message": f"Invalidated {count} cached queries"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# ==================== RATE LIMIT INFO ====================

@router.get("/rate-limit-status")
async def get_rate_limit_status(api_key: str = Depends(verify_api_key)):
    """
    🛡️ Check your current rate limit status.
    Shows how many requests you have remaining.
    """
    try:
        cache = get_cache_manager()
        
        if not cache.enabled or not cache.redis_client:
            return {
                "rate_limiting": "disabled",
                "reason": "Redis not available"
            }
        
        # Count all rate limit keys
        rate_keys = cache.redis_client.keys("ratelimit:*")
        
        active_users = []
        for key in rate_keys:
            count = cache.redis_client.get(key)
            ttl = cache.redis_client.ttl(key)
            ip = key.split(":", 1)[1] if ":" in key else key
            active_users.append({
                "ip": ip,
                "requests_made": int(count) if count else 0,
                "resets_in_seconds": ttl
            })
        
        return {
            "rate_limiting": "enabled",
            "limit": "20 requests per minute",
            "active_users": len(active_users),
            "details": active_users
        }
    except Exception as e:
        return {"error": str(e)}

# ==================== SYSTEM INFO & STATS ====================

@router.get("/stats")
async def get_stats(api_key: str = Depends(verify_api_key)):
    """Get system statistics"""
    retriever = get_retriever()
    vector_stats = retriever.vector_store.get_stats()
    metadata_stats = retriever.metadata_store.get_stats()
    
    return {
        "vector_store": vector_stats,
        "metadata_store": metadata_stats
    }