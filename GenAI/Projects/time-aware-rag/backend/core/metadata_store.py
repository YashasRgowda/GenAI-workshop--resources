import json
import os
from typing import List, Dict, Optional
from datetime import datetime
from app.config import get_settings
import uuid

class MetadataStore:
    def __init__(self):
        self.settings = get_settings()
        self.metadata_path = self.settings.metadata_path
        self.metadata = {}
        self.load()
        print("📋 MetadataStore initialized")
    
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
        doc_id = str(uuid.uuid4())
        
        self.metadata[doc_id] = {
            "doc_id": doc_id,
            "content": content,
            "valid_from": valid_from,
            "valid_to": valid_to,
            "source": source or "unknown",
            "created_at": datetime.now().isoformat(),
            "metadata": metadata or {}
        }
        
        print(f"✅ Added document: {doc_id[:8]}...")
        return doc_id
    
    def get_document(self, doc_id: str) -> Optional[Dict]:
        """Get document by ID"""
        return self.metadata.get(doc_id)
    
    def get_all_documents(self) -> List[Dict]:
        """Get all documents"""
        return list(self.metadata.values())
    
    def get_valid_documents(self, query_date: str) -> List[Dict]:
        """
        Get documents valid on a specific date
        
        Args:
            query_date: Date to check (YYYY-MM-DD)
            
        Returns:
            List of valid documents
        """
        valid_docs = []
        
        for doc in self.metadata.values():
            if doc["valid_from"] <= query_date <= doc["valid_to"]:
                valid_docs.append(doc)
        
        print(f"✅ Found {len(valid_docs)} valid documents for date: {query_date}")
        return valid_docs
    
    def filter_by_ids(self, doc_ids: List[str]) -> List[Dict]:
        """Get documents by list of IDs"""
        return [self.metadata[doc_id] for doc_id in doc_ids if doc_id in self.metadata]
    
    def delete_document(self, doc_id: str) -> bool:
        """Delete a document"""
        if doc_id in self.metadata:
            del self.metadata[doc_id]
            print(f"🗑️ Deleted document: {doc_id[:8]}...")
            return True
        return False
    
    def save(self):
        """Save metadata to disk"""
        os.makedirs(os.path.dirname(self.metadata_path), exist_ok=True)
        
        with open(self.metadata_path, 'w') as f:
            json.dump(self.metadata, f, indent=2)
        
        print(f"💾 Saved metadata: {len(self.metadata)} documents")
    
    def load(self):
        """Load metadata from disk"""
        if not os.path.exists(self.metadata_path):
            print("⚠️ No metadata file found, starting fresh")
            self.metadata = {}
            return
        
        try:
            with open(self.metadata_path, 'r') as f:
                self.metadata = json.load(f)
            print(f"✅ Loaded metadata: {len(self.metadata)} documents")
        except Exception as e:
            print(f"❌ Error loading metadata: {e}")
            self.metadata = {}
    
    def get_stats(self) -> dict:
        """Get metadata statistics"""
        return {
            "total_documents": len(self.metadata),
            "sources": list(set(doc["source"] for doc in self.metadata.values()))
        }

# Singleton instance
_metadata_store = None

def get_metadata_store() -> MetadataStore:
    """Get or create metadata store singleton"""
    global _metadata_store
    if _metadata_store is None:
        _metadata_store = MetadataStore()
    return _metadata_store