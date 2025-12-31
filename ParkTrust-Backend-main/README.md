# ParkGuard: AI-Enforced Immutable Parking

**Hack4Delhi 2025 Submission**

## Problem
Solves revenue leakage and overcrowding in MCD parking lots using "Chain of Custody" logs and automated logic.

## Key Features
* **Smart Routing:** Manhattan Distance Algorithm finds the nearest slot to the entry gate.
* **Dynamic Pricing:** Automatic "Surge Pricing" triggers when occupancy exceeds 80%.
* **2-Factor Verification:** Cross-references physical IoT sensor data with digital entry logs to detect illegal parking.
* **Immutable Audit:** Every Entry, Exit, and Payment is hashed (SHA-256 simulation) for anti-tampering.

## Tech Stack
* **Backend:** Python (FastAPI)
* **Algorithm:** Manhattan Distance & Dynamic Rate Scaling
* **Validation:** IoT Sensor Logic Integration
* **Security:** Immutable Ledger Hashing

## How to Run
1. `pip install -r requirements.txt`
2. `uvicorn main:app --reload`
3. Open `http://127.0.0.1:8000/docs` to test the API.

## API Endpoints
* `POST /vehicle-entry`: Assigns slot & calculates surge price.
* `POST /verify-slot-occupancy`: Validates car presence via simulated sensor.
* `POST /vehicle-exit`: Calculates final fee & generates receipt.
* `GET /admin-dashboard`: Real-time revenue analytics.

