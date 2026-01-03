# ParkGuard - Secure Parking Management System

A modern, blockchain-integrated parking management system with real-time monitoring, multi-site support, and comprehensive security features.

## 🚀 Features

- **Multi-Site Management**: Manage multiple parking locations from a single dashboard
- **Blockchain Integration**: Immutable transaction ledger for audit trails
- **Real-time Monitoring**: Live parking slot status and occupancy tracking
- **Smart Pathfinding**: A* algorithm for optimal parking slot assignment
- **Sensor Simulation**: Hardware sensor integration simulation for security alerts
- **Interactive Map Editor**: Visual parking lot layout designer
- **Driver Portal**: Easy vehicle entry with secure ticket generation
- **Auditor View**: Comprehensive transaction history with chain integrity verification
- **Admin Dashboard**: Real-time analytics and parking lot visualization

## 🏗️ Architecture

### Frontend (Dashboard)
- **Framework**: React + Vite
- **Styling**: Tailwind CSS with custom design system
- **Features**: 
  - Admin Dashboard with live metrics
  - Driver Entry Portal
  - Auditor View with blockchain verification
  - Sensor Simulator
  - Interactive Map Editor
  - Exit Portal

### Backend (ParkTrust-Backend-main)
- **Framework**: FastAPI (Python)
- **Database**: SQLite with SQLAlchemy ORM
- **Features**:
  - RESTful API endpoints
  - Blockchain-style transaction hashing
  - A* pathfinding for slot assignment
  - Multi-site support
  - Real-time sensor status tracking

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **npm** or **yarn**

## 🛠️ Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd ParkTrust-Backend-main
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Start the backend server:
```bash
python -m uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the dashboard directory:
```bash
cd dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The dashboard will be available at `http://localhost:5173`

## 🎯 Usage

### Admin Dashboard
- View real-time parking occupancy
- Monitor security alerts
- Visualize parking lot layout
- Track revenue and statistics

### Driver Portal
- Enter license plate number
- Receive assigned parking slot
- Get blockchain-verified ticket

### Auditor View
- Review all parking sessions
- Verify blockchain integrity
- Export transaction history
- Reset system for testing

### Sensor Simulator
- Toggle parking slot occupancy
- Simulate hardware sensors
- Trigger security alerts

### Map Editor
- Design parking lot layouts
- Define parking slots visually
- Configure entry/exit gates
- Set up pathfinding nodes

## 🔌 API Endpoints

- `GET /sites` - List all parking sites
- `POST /sites` - Create new site
- `GET /slots` - Get all parking slots
- `POST /vehicle-entry` - Register vehicle entry
- `POST /vehicle-exit` - Process vehicle exit
- `GET /transactions` - Get transaction ledger
- `POST /reset` - Reset system (development only)

## 🎨 Tech Stack

**Frontend:**
- React 18
- Vite
- Tailwind CSS
- Modern ES6+

**Backend:**
- FastAPI
- SQLAlchemy
- Pydantic
- Uvicorn

## 📝 License

This project is part of a parking management prototype.

## 👥 Contributors

- Mehul 


