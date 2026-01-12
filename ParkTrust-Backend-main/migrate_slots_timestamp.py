import sqlite3
import models
from database import engine

def migrate():
    print("Migrating Slots table to add occupied_timestamp...")
    
    # 1. Connect to DB directly
    conn = sqlite3.connect("parking_v2.db")
    cursor = conn.cursor()
    
    try:
        # Check if column exists
        cursor.execute("PRAGMA table_info(slots)")
        columns = [info[1] for info in cursor.fetchall()]
        
        if "occupied_timestamp" not in columns:
            print("Column missing. Adding...")
            cursor.execute("ALTER TABLE slots ADD COLUMN occupied_timestamp INTEGER DEFAULT 0")
            conn.commit()
            print("Migration Successful.")
        else:
            print("Column already exists. Skipping.")
            
    except Exception as e:
        print(f"Migration Failed: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
