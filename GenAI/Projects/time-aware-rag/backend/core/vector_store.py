import faiss
import numpy as np
import os
import pickle
from typing import List, Tuple, Optional
from app.config import get_settings

class VectorStore:
    def __init__(self):
        self.settings = get_settings()
        self.index = None
        self.dimension = None
        self.doc_ids = []  # Keep track of document IDs
        
        # Paths
        self.index_path = os.path.join(self.settings.faiss_index_path, "index.faiss")
        self.doc_ids_path = os.path.join(self.settings.faiss_index_path, "doc_ids.pkl")
        
        print("🗄️ VectorStore initialized")
    
    def create_index(self, dimension: int):
        """Create a new FAISS index"""
        self.dimension = dimension
        # Using IndexFlatL2 for exact search (good for small-medium datasets)
        self.index = faiss.IndexFlatL2(dimension)
        print(f"✅ Created FAISS index with dimension: {dimension}")
    
    def add_vectors(self, embeddings: np.ndarray, doc_ids: List[str]):
        """
        Add vectors to the index
        
        Args:
            embeddings: numpy array of shape (n, dimension)
            doc_ids: list of document IDs corresponding to embeddings
        """
        if self.index is None:
            self.create_index(embeddings.shape[1])
        
        # Ensure correct shape
        if len(embeddings.shape) == 1:
            embeddings = embeddings.reshape(1, -1)
        
        # Add to FAISS
        self.index.add(embeddings.astype('float32'))
        self.doc_ids.extend(doc_ids)
        
        print(f"✅ Added {len(doc_ids)} vectors to index. Total: {self.index.ntotal}")
    
    def search(self, query_embedding: np.ndarray, k: int = 5) -> Tuple[List[float], List[str]]:
        """
        Search for similar vectors
        
        Args:
            query_embedding: query vector
            k: number of results to return
            
        Returns:
            Tuple of (distances, doc_ids)
        """
        if self.index is None or self.index.ntotal == 0:
            print("⚠️ Index is empty!")
            return [], []
        
        # Ensure correct shape
        if len(query_embedding.shape) == 1:
            query_embedding = query_embedding.reshape(1, -1)
        
        # Search
        k = min(k, self.index.ntotal)  # Don't request more than available
        distances, indices = self.index.search(query_embedding.astype('float32'), k)
        
        # Get doc_ids for the indices
        result_doc_ids = [self.doc_ids[idx] for idx in indices[0]]
        result_distances = distances[0].tolist()
        
        print(f"🔍 Found {len(result_doc_ids)} results")
        return result_distances, result_doc_ids
    
    def save(self):
        """Save index and doc_ids to disk"""
        if self.index is None:
            print("⚠️ No index to save")
            return
        
        os.makedirs(self.settings.faiss_index_path, exist_ok=True)
        
        # Save FAISS index
        faiss.write_index(self.index, self.index_path)
        
        # Save doc_ids
        with open(self.doc_ids_path, 'wb') as f:
            pickle.dump(self.doc_ids, f)
        
        print(f"💾 Saved index to {self.index_path}")
    
    def load(self) -> bool:
        """Load index and doc_ids from disk"""
        if not os.path.exists(self.index_path):
            print("⚠️ No saved index found")
            return False
        
        try:
            # Load FAISS index
            self.index = faiss.read_index(self.index_path)
            self.dimension = self.index.d
            
            # Load doc_ids
            with open(self.doc_ids_path, 'rb') as f:
                self.doc_ids = pickle.load(f)
            
            print(f"✅ Loaded index with {self.index.ntotal} vectors")
            return True
        except Exception as e:
            print(f"❌ Error loading index: {e}")
            return False
    
    def get_stats(self) -> dict:
        """Get index statistics"""
        return {
            "total_vectors": self.index.ntotal if self.index else 0,
            "dimension": self.dimension,
            "doc_count": len(self.doc_ids)
        }

# Singleton instance
_vector_store = None

def get_vector_store() -> VectorStore:
    """Get or create vector store singleton"""
    global _vector_store
    if _vector_store is None:
        _vector_store = VectorStore()
        _vector_store.load()  # Try to load existing index
    return _vector_store