# ParkGuard - Smart Parking Capacity Enforcement System
### 🏆 Built for Hack4Delhi Hackathon

> **Problem Statement:** Domain 1: Civic / Governance Tech - Smart Parking Capacity Enforcement for Municipal Corporations

## 👥 Team Ignis
*   **Leader:** Mehul
*   **Members:** Ayush, Harsh, Aavya, Rachit

---

## 💡 About The Project
**ParkGuard** is a comprehensive, real-time "Digital Twin" solution designed for Municipal Corporations (like MCD) to effectively monitor and enforce parking capacity. It addresses the critical issue of overparking, revenue leakage, and contractor accountability through a tamper-proof, blockchain-integrated system.

### Key Features
*   **🛡️ Blockchain Integrity:** Every parking transaction is hashed and stored in an immutable ledger, preventing data tampering by contractors.
*   **📡 Real-Time Monitoring:** Live visualization of parking slots (Occupied vs. Empty) to detect capacity breaches instantly.
*   **🚨 Smart Alerts:** Automatic detection of "Ghost Bookings" (money collected but not recorded) and "Unauthorized Parking" via sensor-to-ledger audit.
*   **🗺️ Interactive Digital Twin:** Visual map editor to replicate exact on-ground layouts for precise monitoring.
*   **🤖 A* Pathfinding:** Intelligent algorithm to guide drivers to the nearest available slot, reducing congestion.

---

## 🏗️ Architecture

### Frontend (Dashboard)
- **Framework:** React + Vite
- **Styling:** Tailwind CSS (Modern, Dark-Themed UI)
- **Deployed:** [Vercel](https://parkguard-one.vercel.app/)

### Backend
- **Framework:** FastAPI (Python)
- **Database:** SQLite (with Blockchain Hashing)
- **Algorithm:** Pathfinding & Graph Theory
- **Deployed:** [Render](https://parkguard-backend.onrender.com/)

---

## 🚀 Live Demo
**Try the live prototype here:** [https://parkguard-one.vercel.app](https://parkguard-one.vercel.app)

> [!WARNING]
> **Observer Note:** This project is hosted on the **Render Free Tier**.
> If the API has been inactive for 15+ minutes, the first request may take **30-60 seconds** to wake up the server (Cold Start).
> *Please be patient on the first load!*

## 🎥 Demo Video
**Watch the Project Walkthrough:** [Google Drive Link](https://drive.google.com/file/d/17SFXwscScg0ZacvhTzYRI_t0HFBE6YZp/view?usp=drive_link)

---

## 🎯 Usage Manual

1.  **Map Editor:** Draw slots to configure the parking site layout.
2.  **Driver Portal:** Enter vehicle number to get an assigned slot and generate a secure ticket.
3.  **Sensor Simulator:** Manually toggle "sensors" to simulate cars parking/leaving.
    *   *Try entering a car without a ticket to trigger a Security Alert!*
4.  **Auditor View:** Inspect the immutable ledger to verify revenue and occupancy data.

---

## 🛠️ Local Installation

### Backend Setup
1.  Navigate to the backend:
    ```bash
    cd ParkTrust-Backend-main
    ```
2.  Install requirements:
    ```bash
    pip install -r requirements.txt
    ```
3.  Run Server:
    ```bash
    python -m uvicorn main:app --reload
    ```
    *(Runs on http://localhost:8000)*

### Frontend Setup
1.  Navigate to dashboard:
    ```bash
    cd dashboard
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run Frontend:
    ```bash
    npm run dev
    ```
    *(Runs on http://localhost:5173)*

---

## 🔮 Future Roadmap
*   Integration with IoT LoRaWAN sensors for city-wide deployment.
*   Municipal Corporation (MCD) specific reporting module.
*   Public API for navigation apps (Google Maps integration).

---
*Built with ❤️ by Team Ignis for a Smarter Delhi.*
