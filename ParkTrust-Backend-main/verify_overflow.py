import requests
import time

BASE_URL = "http://127.0.0.1:8000"

def test_overcapacity():
    print("--- Starting Overcapacity Test ---")
    
    # 1. Reset System
    print("Resetting system...")
    try:
        requests.post(f"{BASE_URL}/reset")
    except Exception as e:
        print(f"Failed to connect to backend: {e}")
        return

    # 2. Setup Site: Clear all slots for site1 to make it full (0 capacity)
    print("Clearing slots for site1 to simulate 0 capacity...")
    requests.post(f"{BASE_URL}/slots?site_id=site1", json=[])
    
    # Verify 0 slots
    slots = requests.get(f"{BASE_URL}/slots?site_id=site1").json()
    print(f"Slots count for site1: {len(slots)}")
    
    # 3. Attempt Entry
    print("Attempting entry with plate OVER-9000...")
    payload = {
        "plate_number": "OVER-9000",
        "entry_gate_id": "Gate_A",
        "site_id": "site1",
        "entry_method": "PLATE"
    }
    
    response = requests.post(f"{BASE_URL}/vehicle-entry", json=payload)
    
    if response.status_code == 200:
        data = response.json()
        print(f"Entry Successful! Response: {data}")
        
        if data["assigned_slot"] == "OVERFLOW":
            print("SUCCESS: Assigned Slot is OVERFLOW")
        else:
            print(f"FAILURE: Expected OVERFLOW, got {data['assigned_slot']}")
    else:
        print(f"FAILURE: Entry failed with status {response.status_code}: {response.text}")
        
    # 4. Verify Alert
    print("Verifying Admin Dashboard Alerts...")
    stats = requests.get(f"{BASE_URL}/admin-dashboard?site_id=site1").json()
    alerts = stats.get("recent_alerts", [])
    
    found = False
    for alert in alerts:
        if alert["type"] == "OVERCAPACITY":
            print(f"SUCCESS: Found Alert: {alert['message']}")
            found = True
            break
            
    if not found:
        print("FAILURE: No OVERCAPACITY alert found in dashboard stats.")

if __name__ == "__main__":
    test_overcapacity()
