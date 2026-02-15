from core.database import test_connection, SessionLocal, Document

# Test connection
print("Testing database connection...")
if test_connection():
    print("✅ Connection successful!")
    
    # Test query
    db = SessionLocal()
    count = db.query(Document).count()
    print(f"📊 Current documents in DB: {count}")
    db.close()
else:
    print("❌ Connection failed!")