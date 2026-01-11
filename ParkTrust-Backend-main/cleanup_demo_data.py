from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models

# Ensure tables exist
models.Base.metadata.create_all(bind=engine)

def cleanup_demo_data():
    db = SessionLocal()
    print("🧹 Cleaning up demo data...")

    try:
        # Delete transactions marked as demo
        deleted = db.query(models.Transaction).filter(models.Transaction.is_demo == True).delete()
        db.commit()
        print(f"✅ Removed {deleted} demo transactions.")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    cleanup_demo_data()
