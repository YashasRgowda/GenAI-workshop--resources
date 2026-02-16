"""
Database initialization script.
Creates all tables, indexes, and triggers automatically.
Run this on first startup or when database is fresh.
"""
from sqlalchemy import text
from core.database import engine, Base, Document

def init_database():
    """Create all tables and setup full-text search"""
    print("🔧 Initializing database...")
    
    # 1. Create all tables from SQLAlchemy models
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created")
    
    # 2. Create additional indexes and triggers for full-text search
    with engine.connect() as conn:
        # Add tsvector column trigger (auto-updates content_tsv when content changes)
        conn.execute(text("""
            DO $$
            BEGIN
                -- Create trigger function if not exists
                IF NOT EXISTS (
                    SELECT 1 FROM pg_proc WHERE proname = 'documents_tsv_trigger'
                ) THEN
                    CREATE FUNCTION documents_tsv_trigger() RETURNS trigger AS $func$
                    BEGIN
                        NEW.content_tsv := to_tsvector('english', COALESCE(NEW.content, ''));
                        RETURN NEW;
                    END
                    $func$ LANGUAGE plpgsql;
                END IF;
                
                -- Create trigger if not exists
                IF NOT EXISTS (
                    SELECT 1 FROM pg_trigger WHERE tgname = 'tsvectorupdate'
                ) THEN
                    CREATE TRIGGER tsvectorupdate 
                    BEFORE INSERT OR UPDATE ON documents
                    FOR EACH ROW EXECUTE FUNCTION documents_tsv_trigger();
                END IF;
            END
            $$;
        """))
        
        # Create GIN index for full-text search if not exists
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_documents_content_tsv 
            ON documents USING GIN(content_tsv);
        """))
        
        # Create other indexes
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_documents_dates 
            ON documents(valid_from, valid_to);
        """))
        
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_documents_source 
            ON documents(source);
        """))
        
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_documents_version 
            ON documents(version);
        """))
        
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_documents_latest 
            ON documents(is_latest);
        """))
        
        conn.commit()
        print("✅ Indexes and triggers created")
    
    print("🎉 Database initialization complete!")

if __name__ == "__main__":
    init_database()