from sentence_transformers import SentenceTransformer
import numpy as np
from typing import List, Union
from app.config import get_settings
from core.logger import get_logger
logger = get_logger("embeddings")

class EmbeddingModel:
    def __init__(self):
        settings = get_settings()
        logger.info(f"Loading embedding model: {settings.embedding_model}")
        self.model = SentenceTransformer(settings.embedding_model)
        self.dimension = self.model.get_sentence_embedding_dimension()
        logger.info(f"Model loaded! Embedding dimension: {self.dimension}")
    
    def encode(self, texts: Union[str, List[str]], batch_size: int = 32) -> np.ndarray:
        """
        Encode text(s) into embeddings
        
        Args:
            texts: Single string or list of strings
            batch_size: Batch size for encoding
            
        Returns:
            numpy array of embeddings
        """
        if isinstance(texts, str):
            texts = [texts]
        
        embeddings = self.model.encode(
            texts,
            batch_size=batch_size,
            show_progress_bar=len(texts) > 10,
            convert_to_numpy=True
        )
        
        return embeddings
    
    def get_dimension(self) -> int:
        """Get embedding dimension"""
        return self.dimension

# Singleton instance
_embedding_model = None

def get_embedding_model() -> EmbeddingModel:
    """Get or create embedding model singleton"""
    global _embedding_model
    if _embedding_model is None:
        _embedding_model = EmbeddingModel()
    return _embedding_model