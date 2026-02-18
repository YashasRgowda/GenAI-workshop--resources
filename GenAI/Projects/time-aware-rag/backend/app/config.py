from pydantic_settings import BaseSettings
from functools import lru_cache
from pathlib import Path

class Settings(BaseSettings):
    # LLM Configuration
    gemini_api_key: str
    
    # Embeddings Configuration
    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    
    # Vector Store Configuration
    faiss_index_path: str = "data/faiss_index/"
    
    # Metadata Storage
    metadata_path: str = "data/metadata.json"
    
    # PostgreSQL Configuration
    database_url: str
    db_pool_size: int = 10
    db_max_overflow: int = 20
    
    # Redis Configuration (NEW)
    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_db: int = 0
    redis_password: str = ""
    cache_ttl: int = 3600  # 1 hour in seconds
    api_keys: str = ""
    enable_caching: bool = True
    
    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8000
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

@lru_cache()
def get_settings():
    """Get settings singleton instance"""
    return Settings()

# Ensure directories exist
settings = get_settings()
Path(settings.faiss_index_path).mkdir(parents=True, exist_ok=True)