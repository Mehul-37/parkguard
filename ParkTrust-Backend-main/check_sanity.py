import sys
import os

try:
    print("Importing database...", flush=True)
    from database import get_db, engine
    print("Importing models...", flush=True)
    import models
    from sqlalchemy.orm import Session

    print("Creating session...", flush=True)
    db = next(get_db())
    
    print("Querying sites...", flush=True)
    count = db.query(models.Site).count()
    print(f"Sites found: {count}", flush=True)
    
    print("Querying slots...", flush=True)
    slot_count = db.query(models.Slot).count()
    print(f"Slots found: {slot_count}", flush=True)

    print("Sanity Check Passed!")
except Exception as e:
    print(f"Sanity Check Failed: {e}", flush=True)
