from typing import List, Dict, Tuple
from core.embeddings import get_embedding_model
from core.vector_store import get_vector_store
from core.metadata_store import get_metadata_store

class TimeAwareRetriever:
    def __init__(self):
        self.embedder = get_embedding_model()
        self.vector_store = get_vector_store()
        self.metadata_store = get_metadata_store()
        print("🧠 TimeAwareRetriever initialized")
    
    def add_document(
        self,
        content: str,
        valid_from: str,
        valid_to: str,
        source: str = None,
        metadata: dict = None
    ) -> str:
        """
        Add a document to the system
        
        Args:
            content: Document text
            valid_from: Start date (YYYY-MM-DD)
            valid_to: End date (YYYY-MM-DD)
            source: Source reference
            metadata: Additional metadata
            
        Returns:
            doc_id: Document ID
        """
        # 1. Add to metadata store
        doc_id = self.metadata_store.add_document(
            content=content,
            valid_from=valid_from,
            valid_to=valid_to,
            source=source,
            metadata=metadata
        )
        
        # 2. Generate embedding
        embedding = self.embedder.encode(content)
        
        # 3. Add to vector store
        self.vector_store.add_vectors(embedding, [doc_id])
        
        # 4. Save both stores
        self.metadata_store.save()
        self.vector_store.save()
        
        print(f"✅ Document added successfully: {doc_id[:8]}...")
        return doc_id
    
    def retrieve(
        self,
        query: str,
        query_date: str,
        k: int = 5
    ) -> Tuple[List[Dict], List[float]]:
        """
        Time-aware retrieval
        
        Args:
            query: Search query
            query_date: Date context (YYYY-MM-DD)
            k: Number of results
            
        Returns:
            Tuple of (documents, scores)
        """
        print(f"\n🔍 Retrieving for query: '{query}' on date: {query_date}")
        
        # 1. Embed query
        query_embedding = self.embedder.encode(query)
        
        # 2. Get top candidates from FAISS (get more than k for filtering)
        search_k = min(k * 3, self.vector_store.index.ntotal) if self.vector_store.index else k
        distances, candidate_ids = self.vector_store.search(query_embedding, k=search_k)
        
        if not candidate_ids:
            print("⚠️ No candidates found in vector store")
            return [], []
        
        print(f"📦 Retrieved {len(candidate_ids)} candidates from vector store")
        
        # 3. Get metadata for candidates
        candidates = self.metadata_store.filter_by_ids(candidate_ids)
        
        # 4. Filter by time validity
        valid_docs = []
        valid_scores = []
        
        for doc, distance in zip(candidates, distances):
            if doc["valid_from"] <= query_date <= doc["valid_to"]:
                valid_docs.append(doc)
                # Convert L2 distance to similarity score (lower is better)
                valid_scores.append(float(distance))
        
        # 5. Sort by score and limit to k
        sorted_pairs = sorted(zip(valid_docs, valid_scores), key=lambda x: x[1])
        valid_docs = [doc for doc, _ in sorted_pairs[:k]]
        valid_scores = [score for _, score in sorted_pairs[:k]]
        
        print(f"✅ Found {len(valid_docs)} time-valid documents")
        
        return valid_docs, valid_scores
    
    def get_all_documents(self) -> List[Dict]:
        """Get all documents"""
        return self.metadata_store.get_all_documents()
    
    def delete_document(self, doc_id: str) -> bool:
        """Delete a document (metadata only, FAISS cleanup requires rebuild)"""
        success = self.metadata_store.delete_document(doc_id)
        if success:
            self.metadata_store.save()
        return success

# Singleton instance
_retriever = None

def get_retriever() -> TimeAwareRetriever:
    """Get or create retriever singleton"""
    global _retriever
    if _retriever is None:
        _retriever = TimeAwareRetriever()
    return _retriever