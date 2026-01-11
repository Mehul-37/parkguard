import requests

BASE_URL = "http://127.0.0.1:8000"

INITIAL_SLOTS = [
    {"id": "X1", "x": "5", "y": "5", "occupied": False, "sensor_status": "EMPTY"},
    {"id": "X2", "x": "15", "y": "5", "occupied": False, "sensor_status": "EMPTY"},
    {"id": "X3", "x": "25", "y": "5", "occupied": False, "sensor_status": "EMPTY"},
    {"id": "X4", "x": "35", "y": "5", "occupied": False, "sensor_status": "EMPTY"},
    {"id": "X5", "x": "45", "y": "5", "occupied": False, "sensor_status": "EMPTY"},
    {"id": "X6", "x": "55", "y": "5", "occupied": False, "sensor_status": "EMPTY"},
    {"id": "X7", "x": "65", "y": "5", "occupied": False, "sensor_status": "EMPTY"},
    {"id": "X8", "x": "75", "y": "5", "occupied": False, "sensor_status": "EMPTY"},
    {"id": "X9", "x": "85", "y": "5", "occupied": False, "sensor_status": "EMPTY"},
    {"id": "X10", "x": "95", "y": "5", "occupied": False, "sensor_status": "EMPTY"},
]

def restore_slots():
    print("Restoring site1 slots...")
    try:
        resp = requests.post(f"{BASE_URL}/slots?site_id=site1", json=INITIAL_SLOTS)
        print(f"Restore Status: {resp.status_code}")
        print(resp.json())
    except Exception as e:
        print(e)

if __name__ == "__main__":
    restore_slots()
