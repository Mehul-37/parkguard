import requests
import time

BASE_URL = "http://127.0.0.1:8000"

def verify_timestamp():
    print("--- Verifying Timestamp Logic ---")
    
    # 1. Reset System
    requests.post(f"{BASE_URL}/reset")
    
    # 2. Enter Vehicle
    print("Simulating Entry...")
    res = requests.post(f"{BASE_URL}/vehicle-entry", json={
        "plate_number": "DELAY-TEST",
        "site_id": "site1",
        "entry_gate_id": "Gate_A"
    })
    
    if res.status_code != 200:
        print(f"Entry Failed: {res.text}")
        return

    data = res.json()
    slot_id = data["assigned_slot"]
    print(f"Assigned Slot: {slot_id}")
    
    if slot_id == "OVERFLOW":
        print("Got OVERFLOW slot, timestamp behavior might differ (model doesn't store OVERFLOW slots). Retrying with reset if needed.")
        # But for valid slots:
        return

    # 3. Check /slots
    print("Checking /slots for timestamp...")
    slots_res = requests.get(f"{BASE_URL}/slots?site_id=site1")
    slots = slots_res.json()
    
    target_slot = next((s for s in slots if s["id"] == slot_id), None)
    
    if target_slot:
        ts = target_slot.get("occupied_timestamp", 0)
        now = int(time.time())
        print(f"Slot Timestamp: {ts}")
        print(f"Current Time:   {now}")
        
        if ts > 0 and (now - ts) < 5:
            print("SUCCESS: Timestamp is recent.")
        else:
            print("FAILURE: Timestamp invalid or too old.")
    else:
        print("FAILURE: Slot not found in list.")

if __name__ == "__main__":
    verify_timestamp()
