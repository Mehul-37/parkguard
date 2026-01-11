import random
import time
from datetime import datetime, timedelta
import hashlib
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models

# Ensure tables exist
models.Base.metadata.create_all(bind=engine)

def generate_hash(data: str) -> str:
    return hashlib.sha256(data.encode()).hexdigest()

def seed_historical_data():
    db = SessionLocal()
    print("🌱 Seeding Historical Data (Last 30 Days)...")

    try:
        # Clear existing transactions to avoid chain conflicts (optional, but cleaner for demo)
        # db.query(models.Transaction).delete()
        # db.commit()
        
        sites = ["site1", "site2"]
        slots = ["A1", "A2", "B1", "B2", "C1"]
        
        start_date = datetime.now() - timedelta(days=30)
        
        prev_hash = "GENESIS_HASH"
        
        # Get the last hash if we are appending
        last_tx = db.query(models.Transaction).order_by(models.Transaction.id.desc()).first()
        if last_tx:
            prev_hash = last_tx.hash

        total_tx = 0
        
        for day_offset in range(31):
            current_day = start_date + timedelta(days=day_offset)
            
            # Generate 5-15 cars per day
            daily_cars = random.randint(5, 15)
            
            for _ in range(daily_cars):
                # Random time between 8 AM and 8 PM
                hour = random.randint(8, 20)
                minute = random.randint(0, 59)
                entry_time = current_day.replace(hour=hour, minute=minute, second=0)
                entry_ts = int(entry_time.timestamp())
                
                plate = f"MH-{random.randint(10,99)}-{chr(random.randint(65,90))}{chr(random.randint(65,90))}-{random.randint(1000,9999)}"
                ticket_id = f"TKT-{entry_ts}-{random.randint(1000,9999)}"
                site_id = random.choice(sites)
                slot = random.choice(slots)
                
                # ENTRY
                raw_entry = f"{plate}{slot}{entry_ts}{prev_hash}{site_id}PLATE"
                tx_hash = generate_hash(raw_entry)
                
                entry_tx = models.Transaction(
                    timestamp=entry_ts,
                    ticket_id=ticket_id,
                    plate_number=plate,
                    assigned_slot=slot,
                    site_id=site_id,
                    prev_hash=prev_hash,
                    hash=tx_hash,
                    type="ENTRY",
                    entry_method="PLATE",
                    is_demo=True  # Mark as demo data
                )
                db.add(entry_tx)
                prev_hash = tx_hash
                total_tx += 1
                
                # EXIT (1-4 hours later)
                duration_hours = random.randint(1, 4)
                exit_time = entry_time + timedelta(hours=duration_hours)
                exit_ts = int(exit_time.timestamp())
                
                fee = duration_hours * 20
                
                raw_exit = f"{ticket_id}_EXIT_{exit_ts}{prev_hash}"
                exit_hash = generate_hash(raw_exit)
                
                exit_tx = models.Transaction(
                    timestamp=exit_ts,
                    ticket_id=ticket_id,
                    plate_number=plate,
                    assigned_slot="EXIT",
                    site_id=site_id,
                    prev_hash=prev_hash,
                    hash=exit_hash,
                    type="EXIT",
                    fee=f"₹{fee}",
                    is_demo=True  # Mark as demo data
                )
                db.add(exit_tx)
                prev_hash = exit_hash
                total_tx += 1
        
        db.commit()
        print(f"✅ Successfully added {total_tx} transactions over 30 days.")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_historical_data()
