from sqlalchemy import create_engine, Column, String, Text, Date, DateTime, JSON, Integer, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.dialects.postgresql import UUID, TSVECTOR
from datetime import datetime
from app.config import get_settings
import uuid

settings = get_settings()

# Create SQLAlchemy engine
engine = create_engine(
    settings.database_url,
    pool_size=settings.db_pool_size,
    max_overflow=settings.db_max_overflow,
    pool_pre_ping=True,
    echo=False
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

# Document model with versioning and full-text search
class Document(Base):
    __tablename__ = "documents"
    
    doc_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content = Column(Text, nullable=False)
    valid_from = Column(Date, nullable=False)
    valid_to = Column(Date, nullable=False)
    source = Column(String(255))
    extra_metadata = Column(JSON)
    created_at = Column(DateTime, default=datetime.now)
    
    # Version tracking
    version = Column(Integer, default=1)
    parent_doc_id = Column(UUID(as_uuid=True), nullable=True)
    is_latest = Column(Boolean, default=True)
    updated_at = Column(DateTime, default=datetime.now)
    change_summary = Column(Text, nullable=True)
    
    # Full-text search (NEW)
    content_tsv = Column(TSVECTOR)

# Dependency to get DB session
def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Test connection
def test_connection():
    """Test database connection"""
    try:
        with engine.connect() as conn:
            print("✅ Database connection successful!")
            return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False