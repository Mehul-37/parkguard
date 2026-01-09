import requests
import time
import random

API_URL = "http://localhost:8000"

def seed_data():
    print("🌱 ParkTrust Data Seeder Starting...")
    
    # 1. Reset System
    try:
        requests.post(f"{API_URL}/reset")
        print("✅ System Reset Complete")
    except Exception as e:
        print(f"❌ Failed to reset: {e}")
        return

    # 2. Seed Mock Entries (Past 24h)
    sites = ["site1"]
    entry_gates = ["Gate_A", "Gate_B"]
    
    print("Generating 50 random transactions...")
    for i in range(50):
        site = random.choice(sites)
        
        # Simulate Entry
        plate = f"MH-{random.randint(10,50)}-{chr(random.randint(65,90))}{chr(random.randint(65,90))}-{random.randint(1000,9999)}"
        entry_payload = {
            "plate_number": plate,
            "site_id": site,
            "entry_gate_id": random.choice(entry_gates)
        }
        
        try:
            res = requests.post(f"{API_URL}/vehicle-entry", json=entry_payload)
            data = res.json()
            ticket_id = data.get("ticket_id")
            
            # Simulate Exit for 70% of cars
            if ticket_id and random.random() > 0.3:
                # Add fake delay for realism in timestamps? 
                # Impossible to backdate via API unless we hack DB, but for demo UI "Recent Parking Ledger",
                # it just shows recent adds. For Charts, we use the Mock Endpoint.
                # So this is purely to populate the "Recent Transactions" list.
                
                requests.post(f"{API_URL}/vehicle-exit", json={"ticket_id": ticket_id})
                
        except Exception as e:
            pass # Ignore random failures (slot full etc)

    print("✅ Transactions Populated")

    # 3. Simulate "Ghost Booking" scenarios
    # Park a car (Occupied = True)
    # Then force Sensor = EMPTY
    print("👻 Creating Ghost Bookings...")
    
    # Get all slots
    slots_res = requests.get(f"{API_URL}/slots?site_id=site1").json()
    
    # Scenario 1: Ghost Booking (Booked but Empty)
    if len(slots_res) > 5:
        target = slots_res[0] # First slot
        # Ensure it's occupied (we just ran random entries, so maybe?)
        # Let's force book it via entry if free
        if not target['occupied']:
             requests.post(f"{API_URL}/vehicle-entry", json={"plate_number": "GHOST-1", "site_id": "site1"})
        
        # Now force sensor EMPTY
        requests.patch(f"{API_URL}/simulate-sensor", json={
            "slot_id": target['id'], 
            "site_id": "site1",
            "sensor_status": "EMPTY"
        })
        print(f"   -> Ghost Booking created at {target['id']}")

    # Scenario 2: Unauthorized Parking (Free but Occupied)
    if len(slots_res) > 5:
        target = slots_res[1] # Second slot
        # Force Exit if occupied
        # (Hard to find ticket ID easily here without state, so let's pick a slot we KNOW is free)
        # We can just use the sensor simulator to force Alert, even if logic is consistent
        # Warning: If system says Occupied, and we set Sensor Occupied -> No Alert.
        # We need System Free + Sensor Occupied.
        
        # Let's just find a free slot
        free_slots = [s for s in slots_res if not s['occupied']]
        if free_slots:
            s = free_slots[0]
            requests.patch(f"{API_URL}/simulate-sensor", json={
                "slot_id": s['id'], 
                "site_id": "site1",
                "sensor_status": "OCCUPIED"
            })
            print(f"   -> Unauthorized Parking created at {s['id']}")

    print("🎉 Seeding Complete! Dashboard is ready for demo.")

if __name__ == "__main__":
    seed_data()
