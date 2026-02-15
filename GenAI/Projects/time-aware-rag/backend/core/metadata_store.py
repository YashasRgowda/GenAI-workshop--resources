from typing import List, Dict, Optional
from datetime import datetime, date
from sqlalchemy.orm import Session
from sqlalchemy import and_
from sqlalchemy import desc
from sqlalchemy import func, text
import time
from core.database import Document, SessionLocal
import uuid

class MetadataStore:
    def __init__(self):
        print("📋 MetadataStore initialized (PostgreSQL)")
    
    def add_document(
        self,
        content: str,
        valid_from: str,
        valid_to: str,
        source: Optional[str] = None,
        metadata: Optional[dict] = None
    ) -> str:
        """
        Add a document with temporal metadata
        
        Args:
            content: Document text
            valid_from: Start date (YYYY-MM-DD)
            valid_to: End date (YYYY-MM-DD)
            source: Source filename/reference
            metadata: Additional metadata
            
        Returns:
            doc_id: Generated document ID
        """
        db = SessionLocal()
        try:
            # Convert string dates to date objects
            valid_from_date = datetime.strptime(valid_from, "%Y-%m-%d").date()
            valid_to_date = datetime.strptime(valid_to, "%Y-%m-%d").date()
            
            # Create document
            doc = Document(
                doc_id=uuid.uuid4(),
                content=content,
                valid_from=valid_from_date,
                valid_to=valid_to_date,
                source=source or "unknown",
                metadata=metadata or {}
            )
            
            db.add(doc)
            db.commit()
            db.refresh(doc)
            
            doc_id = str(doc.doc_id)
            print(f"✅ Added document to PostgreSQL: {doc_id[:8]}...")
            return doc_id
        
        except Exception as e:
            db.rollback()
            print(f"❌ Error adding document: {e}")
            raise
        finally:
            db.close()
    
    def get_document(self, doc_id: str) -> Optional[Dict]:
        """Get document by ID"""
        db = SessionLocal()
        try:
            doc = db.query(Document).filter(Document.doc_id == uuid.UUID(doc_id)).first()
            if doc:
                return self._doc_to_dict(doc)
            return None
        finally:
            db.close()
    
    def get_all_documents(self) -> List[Dict]:
        """Get all documents"""
        db = SessionLocal()
        try:
            docs = db.query(Document).all()
            return [self._doc_to_dict(doc) for doc in docs]
        finally:
            db.close()
    
    def get_valid_documents(self, query_date: str) -> List[Dict]:
        """
        Get documents valid on a specific date
        
        Args:
            query_date: Date to check (YYYY-MM-DD)
            
        Returns:
            List of valid documents
        """
        db = SessionLocal()
        try:
            # Convert string to date
            query_date_obj = datetime.strptime(query_date, "%Y-%m-%d").date()
            
            # Query with date range
            docs = db.query(Document).filter(
                and_(
                    Document.valid_from <= query_date_obj,
                    Document.valid_to >= query_date_obj
                )
            ).all()
            
            result = [self._doc_to_dict(doc) for doc in docs]
            print(f"✅ Found {len(result)} valid documents for date: {query_date}")
            return result
        finally:
            db.close()
    
    def filter_by_ids(self, doc_ids: List[str]) -> List[Dict]:
        """Get documents by list of IDs"""
        db = SessionLocal()
        try:
            # Convert string IDs to UUIDs
            uuid_ids = [uuid.UUID(doc_id) for doc_id in doc_ids]
            
            docs = db.query(Document).filter(Document.doc_id.in_(uuid_ids)).all()
            return [self._doc_to_dict(doc) for doc in docs]
        finally:
            db.close()
    
    def delete_document(self, doc_id: str) -> bool:
        """Delete a document"""
        db = SessionLocal()
        try:
            doc = db.query(Document).filter(Document.doc_id == uuid.UUID(doc_id)).first()
            if doc:
                db.delete(doc)
                db.commit()
                print(f"🗑️ Deleted document: {doc_id[:8]}...")
                return True
            return False
        except Exception as e:
            db.rollback()
            print(f"❌ Error deleting document: {e}")
            return False
        finally:
            db.close()
    
    def save(self):
        """Save metadata (no-op for PostgreSQL, auto-commits)"""
        pass
    
    def load(self):
        """Load metadata (no-op for PostgreSQL, reads from DB)"""
        pass
    
    def get_stats(self) -> dict:
        """Get metadata statistics"""
        db = SessionLocal()
        try:
            total_docs = db.query(Document).count()
            sources = db.query(Document.source).distinct().all()
            source_list = [s[0] for s in sources if s[0]]
            
            return {
                "total_documents": total_docs,
                "sources": source_list
            }
        finally:
            db.close()
    
    def _doc_to_dict(self, doc: Document) -> Dict:
        """Convert SQLAlchemy model to dict"""
        return {
            "doc_id": str(doc.doc_id),
            "content": doc.content,
            "valid_from": doc.valid_from.strftime("%Y-%m-%d"),
            "valid_to": doc.valid_to.strftime("%Y-%m-%d"),
            "source": doc.source,
            "created_at": doc.created_at.isoformat(),
            "metadata": doc.metadata or {}
        }
# --------------------------------------------------------------------------        
        
    def update_document_version(
        self,
        original_doc_id: str,
        new_content: str,
        valid_from: str,
        valid_to: str,
        change_summary: str = None,
        source: str = None,
        metadata: dict = None
    ) -> str:
        """
        Create a new version of an existing document.
        Marks old version as not latest.
        
        Args:
            original_doc_id: ID of document to update
            new_content: Updated content
            valid_from: New validity start
            valid_to: New validity end
            change_summary: Description of changes
            source: Source reference
            metadata: Additional metadata
            
        Returns:
            new_doc_id: ID of new version
        """
        db = SessionLocal()
        try:
            # Get original document
            original_doc = db.query(Document).filter(
                Document.doc_id == uuid.UUID(original_doc_id)
            ).first()
            
            if not original_doc:
                raise Exception(f"Document {original_doc_id} not found")
            
            # Mark old version as not latest
            original_doc.is_latest = False
            
            # Get parent_doc_id (if this is already a version, use its parent)
            parent_id = original_doc.parent_doc_id or original_doc.doc_id
            
            # Get next version number
            max_version = db.query(Document).filter(
                (Document.doc_id == parent_id) | (Document.parent_doc_id == parent_id)
            ).order_by(desc(Document.version)).first()
            
            next_version = (max_version.version + 1) if max_version else 1
            
            # Convert dates
            valid_from_date = datetime.strptime(valid_from, "%Y-%m-%d").date()
            valid_to_date = datetime.strptime(valid_to, "%Y-%m-%d").date()
            
            # Create new version
            new_doc = Document(
                doc_id=uuid.uuid4(),
                content=new_content,
                valid_from=valid_from_date,
                valid_to=valid_to_date,
                source=source or original_doc.source,
                extra_metadata=metadata or {},
                version=next_version,
                parent_doc_id=parent_id,
                is_latest=True,
                updated_at=datetime.now(),
                change_summary=change_summary
            )
            
            db.add(new_doc)
            db.commit()
            db.refresh(new_doc)
            
            new_doc_id = str(new_doc.doc_id)
            print(f"✅ Created version {next_version} of document {original_doc_id[:8]}...")
            return new_doc_id
            
        except Exception as e:
            db.rollback()
            print(f"❌ Error creating version: {e}")
            raise
        finally:
            db.close()


    def get_document_versions(self, doc_id: str) -> List[Dict]:
        """
        Get all versions of a document.
        
        Args:
            doc_id: Document ID (can be any version)
            
        Returns:
            List of all versions sorted by version number
        """
        db = SessionLocal()
        try:
            # Get the document to find parent
            doc = db.query(Document).filter(
                Document.doc_id == uuid.UUID(doc_id)
            ).first()
            
            if not doc:
                return []
            
            # Find parent (or use current if it's the parent)
            parent_id = doc.parent_doc_id or doc.doc_id
            
            # Get all versions
            versions = db.query(Document).filter(
                (Document.doc_id == parent_id) | (Document.parent_doc_id == parent_id)
            ).order_by(Document.version).all()
            
            result = []
            for v in versions:
                result.append({
                    "doc_id": str(v.doc_id),
                    "version": v.version,
                    "parent_doc_id": str(v.parent_doc_id) if v.parent_doc_id else None,
                    "is_latest": v.is_latest,
                    "created_at": v.created_at.isoformat(),
                    "updated_at": v.updated_at.isoformat(),
                    "change_summary": v.change_summary,
                    "content": v.content,
                    "valid_from": v.valid_from.strftime("%Y-%m-%d"),
                    "valid_to": v.valid_to.strftime("%Y-%m-%d"),
                    "source": v.source
                })
            
            print(f"✅ Found {len(result)} versions")
            return result
            
        finally:
            db.close()


    def get_latest_version(self, doc_id: str) -> Optional[Dict]:
        """
        Get the latest version of a document.
        
        Args:
            doc_id: Any version's doc_id
            
        Returns:
            Latest version document
        """
        db = SessionLocal()
        try:
            # Get document to find parent
            doc = db.query(Document).filter(
                Document.doc_id == uuid.UUID(doc_id)
            ).first()
            
            if not doc:
                return None
            
            # Find parent
            parent_id = doc.parent_doc_id or doc.doc_id
            
            # Get latest version
            latest = db.query(Document).filter(
                ((Document.doc_id == parent_id) | (Document.parent_doc_id == parent_id)) &
                (Document.is_latest == True)
            ).first()
            
            if latest:
                return self._doc_to_dict(latest)
            return None
            
        finally:
            db.close()
# --------------------------------------------------------------------------            
            
    def full_text_search(
        self,
        search_text: str,
        start_date: str = None,
        end_date: str = None,
        limit: int = 10
    ) -> List[Dict]:
        """
        Full-text search in document content.
        Uses PostgreSQL's built-in text search.
        
        Args:
            search_text: Text to search for
            start_date: Optional start date filter
            end_date: Optional end date filter
            limit: Maximum results
            
        Returns:
            List of matching documents with relevance scores
        """
        db = SessionLocal()
        start_time = time.time()
        
        try:
            # Convert search text to tsquery format (words separated by &)
            # "hardware token" -> "hardware & token"
            search_query = ' & '.join(search_text.split())
            
            # Build query
            query = db.query(
                Document,
                func.ts_rank(Document.content_tsv, func.to_tsquery('english', search_query)).label('rank')
            ).filter(
                Document.content_tsv.op('@@')(func.to_tsquery('english', search_query))
            )
            
            # Add date filters if provided
            if start_date:
                start_date_obj = datetime.strptime(start_date, "%Y-%m-%d").date()
                query = query.filter(Document.valid_from >= start_date_obj)
            
            if end_date:
                end_date_obj = datetime.strptime(end_date, "%Y-%m-%d").date()
                query = query.filter(Document.valid_to <= end_date_obj)
            
            # Order by relevance and limit
            results = query.order_by(text('rank DESC')).limit(limit).all()
            
            # Extract highlights
            documents = []
            for doc, rank in results:
                # Get text snippets around matches
                highlights = self._extract_highlights(doc.content, search_text)
                
                documents.append({
                    "doc_id": str(doc.doc_id),
                    "content": doc.content,
                    "valid_from": doc.valid_from.strftime("%Y-%m-%d"),
                    "valid_to": doc.valid_to.strftime("%Y-%m-%d"),
                    "source": doc.source,
                    "created_at": doc.created_at.isoformat(),
                    "relevance_score": float(rank),
                    "highlights": highlights
                })
            
            search_time = (time.time() - start_time) * 1000  # Convert to ms
            print(f"✅ Full-text search found {len(documents)} results in {search_time:.2f}ms")
            
            return documents
            
        finally:
            db.close()


    def _extract_highlights(self, content: str, search_text: str, context_length: int = 100) -> List[str]:
        """
        Extract text snippets around search matches.
        
        Args:
            content: Full document content
            search_text: Text to find
            context_length: Characters before/after match
            
        Returns:
            List of highlighted snippets
        """
        highlights = []
        search_lower = search_text.lower()
        content_lower = content.lower()
        
        # Find all occurrences
        start = 0
        while True:
            pos = content_lower.find(search_lower, start)
            if pos == -1:
                break
            
            # Extract context around match
            context_start = max(0, pos - context_length)
            context_end = min(len(content), pos + len(search_text) + context_length)
            
            snippet = content[context_start:context_end]
            
            # Add ellipsis if truncated
            if context_start > 0:
                snippet = "..." + snippet
            if context_end < len(content):
                snippet = snippet + "..."
            
            highlights.append(snippet)
            start = pos + 1
            
            # Limit to 3 highlights per document
            if len(highlights) >= 3:
                break
        
        return highlights


    def combined_search(
        self,
        query: str,
        query_date: str,
        semantic_ids: List[str] = None,
        fulltext_search: str = None,
        k: int = 10
    ) -> List[Dict]:
        """
        Combine semantic and full-text search results.
        """
        db = SessionLocal()
        try:
            query_date_obj = datetime.strptime(query_date, "%Y-%m-%d").date()
            
            # Start with semantic results
            results = {}
            
            if semantic_ids:
                uuid_ids = [uuid.UUID(doc_id) for doc_id in semantic_ids]
                semantic_docs = db.query(Document).filter(
                    Document.doc_id.in_(uuid_ids)
                ).all()
                
                for doc in semantic_docs:
                    if doc.valid_from <= query_date_obj <= doc.valid_to:
                        results[str(doc.doc_id)] = {
                            "doc": doc,
                            "semantic_score": 1.0,
                            "fulltext_score": 0.0
                        }
            
            # Add full-text results
            if fulltext_search:
                # Convert to tsquery format
                search_query = ' & '.join(fulltext_search.split())
                
                fulltext_results = db.query(
                    Document,
                    func.ts_rank(Document.content_tsv, func.to_tsquery('english', search_query)).label('rank')
                ).filter(
                    Document.content_tsv.op('@@')(func.to_tsquery('english', search_query)),
                    Document.valid_from <= query_date_obj,
                    Document.valid_to >= query_date_obj
                ).order_by(text('rank DESC')).limit(k).all()
                
                for doc, rank in fulltext_results:
                    doc_id = str(doc.doc_id)
                    if doc_id in results:
                        results[doc_id]["fulltext_score"] = float(rank)
                    else:
                        results[doc_id] = {
                            "doc": doc,
                            "semantic_score": 0.0,
                            "fulltext_score": float(rank)
                        }
            
            # Calculate combined scores and sort
            combined = []
            for doc_id, data in results.items():
                combined_score = (data["semantic_score"] * 0.6) + (data["fulltext_score"] * 0.4)
                combined.append({
                    "doc_id": doc_id,
                    "doc": data["doc"],
                    "combined_score": combined_score,
                    "semantic_score": data["semantic_score"],
                    "fulltext_score": data["fulltext_score"]
                })
            
            # Sort by combined score
            combined.sort(key=lambda x: x["combined_score"], reverse=True)
            
            # Convert to dict format
            result_docs = []
            for item in combined[:k]:
                doc = item["doc"]
                result_docs.append(self._doc_to_dict(doc))
            
            print(f"✅ Combined search: {len(result_docs)} results")
            return result_docs
            
        finally:
            db.close()



# Singleton instance
_metadata_store = None

def get_metadata_store() -> MetadataStore:
    """Get or create metadata store singleton"""
    global _metadata_store
    if _metadata_store is None:
        _metadata_store = MetadataStore()
    return _metadata_store