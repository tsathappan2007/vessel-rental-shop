# Vessel Rental Shop Management System

A modern, full-stack web application designed to streamline booking, inventory management, billing, and returns tracking for a vessel rental business. Built with React (Vite) on the frontend and Node.js (Express) with MongoDB on the backend.

## 🚀 Features

- **Dynamic Analytics Dashboard**: Track monthly rental trends, active bookings, overall revenue, advance payments, pending balance, and low-stock alerts.
- **Robust Inventory System**: Add, edit, delete, and bulk import inventory items. Check real-time stock availability for specific event dates.
- **Comprehensive Booking flow**:
  - Track customer contact information, event type, event date, and return date.
  - Automatically check for stock shortages during booking creation.
  - Flag items that need sourcing from external vendors.
- **Returns & Payment Tracking**: Update returned items individually to automatically update booking statuses (`Booked` ➔ `Issued` ➔ `Partially Returned` ➔ `Returned`). Log post-event balance payments.
- **On-the-Fly PDF Receipts**: Download professionally formatted PDF receipts (with Noto Sans Tamil font support for local language rendering) which are generated dynamically on-the-fly.
- **Print Friendly View**: Easily trigger browser print layout for physical receipts.
- **Localization (i18n)**: Fully supports **English** and **Tamil (தமிழ்)** languages.

---

## 🛠️ Technology Stack

### Frontend
- **React (Vite)**
- **Tailwind CSS** (Utility-first styling)
- **Chart.js** & **React-Chartjs-2** (Visual analytics)
- **i18next** (Localization)
- **React Router DOM** (Navigation)
- **Axios** (API requests)

### Backend
- **Node.js** & **Express**
- **MongoDB** & **Mongoose** (Database & ODM)
- **PDFKit** (On-the-fly PDF document generation)

---

## 📦 Project Structure

```text
vessel-rental/
├── client/                 # Frontend React Application
│   ├── src/
│   │   ├── components/     # Reusable UI Components
│   │   ├── i18n/           # Translation settings (EN / TA)
│   │   ├── pages/          # Dashboard, Inventory, Bookings, Receipts
│   │   └── services/       # Frontend API communication
│   └── package.json
│
└── server/                 # Backend REST API
    ├── config/             # DB settings
    ├── controllers/        # Business logic for Bookings, Inventory, Dashboard
    ├── models/             # Mongoose Schemas (Booking, Inventory)
    ├── routes/             # Express API Endpoints
    ├── utils/              # PDF Generator and helper utilities
    └── package.json
```

---

## 🔧 Installation and Setup

### Prerequisites
- Node.js (v16+)
- MongoDB (Local or Atlas)

### Setup Server
1. Navigate to the `server/` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server/` root:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/vessel-rental
   SHOP_NAME="Your Shop Name"
   SHOP_PHONE="1234567890"
   SHOP_ADDRESS="Your Shop Address"
   ```
4. Start the server:
   - For development (with nodemon):
     ```bash
     npm run dev
     ```
   - For production:
     ```bash
     npm start
     ```

### Setup Client
1. Navigate to the `client/` directory:
   ```bash
   cd ../client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the web app at `http://localhost:5173` (requests are automatically proxied to the backend at port 5000).

---

## 📄 API Endpoints

### Bookings
- `GET /api/bookings` - List bookings (supports status/date/search filters)
- `GET /api/bookings/:id` - Get details of a single booking
- `POST /api/bookings` - Create a new booking
- `PUT /api/bookings/:id` - Update payment details or general info
- `PUT /api/bookings/:id/return` - Record returned item quantities
- `DELETE /api/bookings/:id` - Delete a booking

### Inventory
- `GET /api/inventory` - Get all inventory items
- `POST /api/inventory` - Create an item
- `PUT /api/inventory/:id` - Update item specifications
- `DELETE /api/inventory/:id` - Delete an item
- `POST /api/inventory/bulk` - Bulk import items using JSON
- `GET /api/inventory/check-stock` - Query stock availability for a date

### PDF & Print
- `GET /api/pdf/download/:bookingId` - Generates and streams PDF download

---

## 🤝 License
This project is proprietary. All rights reserved.