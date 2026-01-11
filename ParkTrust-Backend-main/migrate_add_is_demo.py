"""
Migration script to add is_demo column to existing database
"""
import sqlite3

def migrate():
    print("🔧 Running database migration...")
    
    conn = sqlite3.connect('parking_v2.db')
    cursor = conn.cursor()
    
    try:
        # Check if column already exists
        cursor.execute("PRAGMA table_info(transactions)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'is_demo' not in columns:
            # Add the new column with default value False
            cursor.execute("ALTER TABLE transactions ADD COLUMN is_demo BOOLEAN DEFAULT 0")
            conn.commit()
            print("✅ Added 'is_demo' column to transactions table")
        else:
            print("ℹ️  Column 'is_demo' already exists")
        
        # Update all existing transactions to be non-demo (real data)
        cursor.execute("UPDATE transactions SET is_demo = 0 WHERE is_demo IS NULL")
        conn.commit()
        print("✅ Set all existing transactions as real data (is_demo=False)")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        conn.rollback()
    finally:
        conn.close()
    
    print("🎉 Migration complete!")

if __name__ == "__main__":
    migrate()
