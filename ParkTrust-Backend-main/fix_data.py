from database import get_db, engine
import models

# Ensure tables
models.Base.metadata.create_all(bind=engine)

INITIAL_SLOTS = [
    {"id": "A1", "site_id": "site1", "x": 0, "y": 10, "occupied": False, "sensor_status": "EMPTY"},
    {"id": "A2", "site_id": "site1", "x": 0, "y": 20, "occupied": False, "sensor_status": "EMPTY"},
    {"id": "B1", "site_id": "site1", "x": 20, "y": 10, "occupied": False, "sensor_status": "EMPTY"}, 
    {"id": "B2", "site_id": "site1", "x": 20, "y": 20, "occupied": False, "sensor_status": "EMPTY"},
    # Site 2 Slots
    {"id": "X1", "site_id": "site2", "x": 5, "y": 5, "occupied": False, "sensor_status": "EMPTY"},
    {"id": "X2", "site_id": "site2", "x": 15, "y": 5, "occupied": False, "sensor_status": "EMPTY"},
]

db = next(get_db())
try:
    if db.query(models.Slot).count() == 0:
        print("Populating slots...")
        for s in INITIAL_SLOTS:
            slot = models.Slot(
                slot_id=s["id"],
                site_id=s["site_id"],
                x=s["x"],
                y=s["y"],
                occupied=s["occupied"],
                sensor_status=s["sensor_status"]
            )
            db.add(slot)
        db.commit()
        print("Slots populated.")
    else:
        print("Slots already exist.")
finally:
    db.close()
