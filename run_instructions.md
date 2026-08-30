# Smart Blood Testing & Home Sample Collection — Local Setup & Run Guide

This monorepo contains a full-stack MERN application for home blood sample collection and laboratory workflow tracking with real-time updates via Socket.io.

---

## 📋 Prerequisites

1. **Node.js** (v18.x or higher)
2. **MongoDB** (running locally on `mongodb://localhost:27017` or via MongoDB Atlas connection string)

---

## ⚡ Quick Start (Monorepo Concurrent Launcher)

### 1. Install All Dependencies
From the root directory (`c:\Smart-Blood-Testing`):
```bash
npm run install:all
```
*Or manually:*
```bash
# Root
npm install

# Server
cd server && npm install

# Client
cd ../client && npm install
```

### 2. Seed Database
Run the database seeder to populate default test catalog items and create demo accounts:
```bash
npm run seed
```
*Or directly in server:*
```bash
cd server
node seed.js
```

### 3. Launch Both Server & Client Concurrently
From the root directory:
```bash
npm run dev
```

This starts:
- 📡 **Backend Server**: [http://localhost:5000](http://localhost:5000)
- 💻 **Frontend Client**: [http://localhost:5173](http://localhost:5173)

---

## 🔑 Demo Credentials

| Role | Email | Password | Dashboard Route |
|---|---|---|---|
| **Patient** | `patient@test.com` | `password123` | `/patient/dashboard` |
| **Phlebotomist** | `phlebotomist@test.com` | `password123` | `/phlebotomist/dashboard` |
| **Lab Admin** | `labadmin@test.com` | `password123` | `/lab/dashboard` |

> 💡 **Tip**: On the Login page (`/login`), click any of the **Demo Quick Login** buttons to immediately log in as that role without typing credentials!

---

## 🔄 End-to-End Workflow Demonstration

1. **Login as Patient** (`patient@test.com`):
   - Browse or search the blood test catalog (e.g., *Complete Blood Count (CBC)*, *Thyroid Profile*).
   - Select a test, pick an appointment date/time, and click **Confirm Booking**.
   - Your booking will generate a unique **QR Code**.

2. **Login as Phlebotomist** (`phlebotomist@test.com` in a 2nd tab or window):
   - Switch to **Nearby Bookings** tab to see patient bookings within 10km.
   - Click **Accept** on the booking.
   - Click **Broadcast Location** to simulate live GPS updates (updates the patient's live Leaflet map in real time).
   - Click **Scan QR**, paste the patient's QR token, and verify arrival.
   - Click **Attach Barcode** and input a tube barcode (e.g., `SBT-2024-00123`).
   - Click **Dispatch to Lab**.

3. **Login as Lab Admin** (`labadmin@test.com` in a 3rd tab or window):
   - Locate the incoming sample or use the **Barcode Verification Tool** searching for `SBT-2024-00123`.
   - Click **Process Sample** (changes status to `processing`).
   - Click **Upload Report**, insert the demo PDF URL, and click **Mark Completed**.

4. **Verify Real-Time Update**:
   - Check the Patient's tab — notice the status instantly advances to `Completed` with a **View Report** button!

---

## 🛠️ Environment Variables

The server uses `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/smart-blood-testing
JWT_SECRET=smartblood_dev_secret_key_2024
CLIENT_URL=http://localhost:5173
```
