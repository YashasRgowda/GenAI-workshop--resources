from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date

class QueryRequest(BaseModel):
    query: str = Field(..., description="Question to ask")
    query_date: str = Field(..., description="Date context (YYYY-MM-DD)")
    k: int = Field(default=5, description="Number of results to retrieve")

class QueryResponse(BaseModel):
    answer: str
    sources: List[dict]
    query_date: str
    retrieved_count: int

class DocumentResponse(BaseModel):
    doc_id: str
    content: str
    valid_from: str
    valid_to: str
    source: Optional[str]
    created_at: str

class HealthCheck(BaseModel):
    status: str
    embedding_model: str
    faiss_index_exists: bool
    metadata_exists: bool
    
# NEW: Batch Upload Models for multiple documents in one request
class BatchDocumentItem(BaseModel):
    content: str = Field(..., description="Document content/text")
    valid_from: str = Field(..., description="Start date (YYYY-MM-DD)")
    valid_to: str = Field(..., description="End date (YYYY-MM-DD)")
    source: Optional[str] = Field(None, description="Source/filename")
    metadata: Optional[dict] = Field(default_factory=dict)
    
    
# Date Range Query Models
class DateRangeQueryRequest(BaseModel):
    query: str = Field(..., description="Search query")
    start_date: str = Field(..., description="Start date (YYYY-MM-DD)")
    end_date: str = Field(..., description="End date (YYYY-MM-DD)")
    k: int = Field(default=10, description="Max results per time period")

class DateRangeDocument(BaseModel):
    doc_id: str
    content_preview: str
    valid_from: str
    valid_to: str
    source: str
    score: float
    time_period: str  # e.g., "2022", "2023-2024"

class DateRangeQueryResponse(BaseModel):
    query: str
    date_range: dict
    total_documents: int
    documents_by_period: dict
    timeline: List[dict]
    summary: str

class PolicyComparisonRequest(BaseModel):
    topic: str = Field(..., description="Topic to compare (e.g., 'VPN policy', 'password requirements')")
    start_date: str = Field(..., description="Start date (YYYY-MM-DD)")
    end_date: str = Field(..., description="End date (YYYY-MM-DD)")

class PolicyComparisonResponse(BaseModel):
    topic: str
    date_range: dict
    versions: List[dict]
    changes_detected: int
    comparison_summary: str

# Document Versioning Models
class DocumentVersionInfo(BaseModel):
    doc_id: str
    version: int
    parent_doc_id: Optional[str]
    is_latest: bool
    created_at: str
    updated_at: str
    change_summary: Optional[str]
    content_preview: str
    valid_from: str
    valid_to: str
    source: str

class DocumentVersionHistory(BaseModel):
    original_doc_id: str
    total_versions: int
    versions: List[DocumentVersionInfo]
    timeline: List[dict]
    
# Full-Text Search Models
class FullTextSearchRequest(BaseModel):
    search_text: str = Field(..., description="Text to search for in documents")
    start_date: Optional[str] = Field(None, description="Filter by start date (YYYY-MM-DD)")
    end_date: Optional[str] = Field(None, description="Filter by end date (YYYY-MM-DD)")
    limit: int = Field(default=10, description="Maximum results")

class SearchMatch(BaseModel):
    doc_id: str
    source: str
    valid_from: str
    valid_to: str
    content_preview: str
    match_highlights: List[str]
    relevance_score: float

class FullTextSearchResponse(BaseModel):
    search_text: str
    total_matches: int
    matches: List[SearchMatch]
    search_time_ms: float

class CombinedSearchRequest(BaseModel):
    query: str = Field(..., description="Search query")
    query_date: str = Field(..., description="Date context (YYYY-MM-DD)")
    use_semantic: bool = Field(default=True, description="Use semantic (vector) search")
    use_fulltext: bool = Field(default=True, description="Use full-text search")
    k: int = Field(default=5, description="Results per method")