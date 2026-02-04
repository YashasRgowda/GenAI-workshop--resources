from pydantic_settings import BaseSettings
from functools import lru_cache
from pathlib import Path

class Settings(BaseSettings):
    # LLM
    gemini_api_key: str
    
    # Embeddings
    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    
    # Paths
    faiss_index_path: str = "data/faiss_index/"
    metadata_path: str = "data/metadata.json"
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

@lru_cache()
def get_settings():
    return Settings()

# Ensure directories exist
settings = get_settings()
Path(settings.faiss_index_path).mkdir(parents=True, exist_ok=True)
Path(settings.metadata_path).parent.mkdir(parents=True, exist_ok=True)