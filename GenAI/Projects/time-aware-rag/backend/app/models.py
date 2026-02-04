from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date

class DocumentUpload(BaseModel):
    content: str = Field(..., description="Document content/text")
    valid_from: str = Field(..., description="Start date (YYYY-MM-DD)")
    valid_to: str = Field(..., description="End date (YYYY-MM-DD)")
    source: Optional[str] = Field(None, description="Source/filename")
    metadata: Optional[dict] = Field(default_factory=dict)

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