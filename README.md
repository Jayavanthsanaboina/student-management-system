# Student Management System (MERN Stack)

**Institution:** Anil Neerukonda Institute of Technology and Sciences (Autonomous), Sangivalasa, Visakhapatnam  
**Department:** Computer Science and Engineering (Artificial Intelligence and Machine Learning)  
**Academic Year:** 2026-2027 (Batch: 2024-2028)  

### Team Members
1. **Sanaboina Satya Jayavanth** (Regd No: `A24126552116`)
2. **Neeli Venkata Sai Tarun** (Regd No: `A24126552092`)
3. **Rapeti Srivalli** (Regd No: `A24126552108`)
4. **Badagala Charishma** (Regd No: `A24126552069`)

**Project Guide:** Dr. Appala Srinuvasu Muttipati, Associate Professor, CSE (AI&ML), ANITS  
**Head of Department:** Dr. Selvani Deepthi, Professor & HOD, CSE (AI&ML), ANITS  

---

## 1. Project Overview & Problem Statement

This project addresses a critical defect in a deployed Student Management System:
> **"A deployed Student Management System successfully adds student records but fails to display updated records."**

### Root Cause & Resolution
1. **Database Tier (Mongoose ODM):** By default, `Model.findByIdAndUpdate()` returns the *pre-update* document. Our implementation enforces `{ new: true, runValidators: true }`, ensuring the newly modified document is returned and re-validated.
2. **Server Tier (Express):** Applied strict anti-caching HTTP headers (`Cache-Control: no-store, no-cache, must-revalidate`) preventing browsers from serving stale HTTP 304 cached lists.
3. **Frontend Tier (React):** Replaced mutable in-place array updates with immutable functional state updates (`prev.map(...)`), ensuring React re-renders the updated student rows instantly.

---

## 2. Evaluation Rubric Alignment (Total: 20 Marks)

| S.No. | Evaluation Component | Max Marks | Implementation Details |
|:---:|---|:---:|---|
| **1** | **Problem understanding & system design** | **2** | Decoupled 3-tier MERN architecture, request-response workflow, and diagnostic analysis. |
| **2** | **MongoDB database design** | **3** | Mongoose schema with strict types (String, Number, Enum, Array), roll number uniqueness, email regex, timestamps. |
| **3** | **CRUD operations** | **4** | Full REST endpoints (POST, GET, PUT, DELETE) with explicit `{ new: true }` bugfix. |
| **4** | **Aggregation and indexing** | **3** | Multi-stage pipeline (`$group`, `$project`, `$sort`) for department metrics (student counts, average GPA, total fees); compound & text indexes. |
| **5** | **React frontend development** | **2** | Clean interactive UI with Add/Edit student form, search bar, department filter, and instant table refresh. |
| **6** | **Express.js backend development** | **2** | Modular routes, controller pattern, centralized error handling middleware, and CORS configuration. |
| **7** | **Cloud deployment** | **2** | Ready for MongoDB Atlas (connection pool), Render (`render.yaml`), and Vercel (`vercel.json`). |
| **8** | **Testing, documentation & demo** | **2** | Automated test script (`node test-api.js`), test matrix, and case study report. |
| | **Total Marks** | **20** | **Complete Full-Score Implementation** |

---

## 3. Project Directory Structure

```
student-management-system/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── studentController.js  # CRUD + Aggregation + { new: true } Fix
│   │   ├── middleware/
│   │   │   └── errorHandler.js       # Centralized error handler
│   │   ├── models/
│   │   │   └── Student.js            # Mongoose Schema & Indexes
│   │   └── routes/
│   │       └── studentRoutes.js      # REST API Endpoints
│   ├── server.js                     # Express app & MongoDB connection
│   ├── test-api.js                   # Automated test script
│   ├── render.yaml                   # Cloud backend config
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.jsx                   # React Dashboard & Real-Time Sync
│   │   ├── index.css                 # Clean stylesheet
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── vercel.json                   # Cloud frontend config
│   └── package.json
└── README.md
```

---

## 4. Setup & Running Locally

### Prerequisites
- Node.js (v18 or higher)
- MongoDB running locally (`mongodb://127.0.0.1:27017`) or MongoDB Atlas connection string.

### Step 1: Run the Backend
```bash
cd backend
npm install
npm start
```
*The server will start on `http://localhost:5000`.*

### Step 2: Run the Frontend
```bash
cd frontend
npm install
npm run dev
```
*Open `http://localhost:3000` in your web browser.*

### Step 3: Run the Automated API Test Suite
```bash
cd backend
npm test
```
*This executes automated tests verifying student creation, immediate retrieval, update synchronization with `{ new: true }`, department aggregation, and deletion.*

---

## 5. Cloud Deployment Guide

### A. MongoDB Atlas (Database)
1. Create a free M0 cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a Database User with read/write privileges.
3. In Network Access, whitelist `0.0.0.0/0` (allow access from anywhere).
4. Copy the connection string: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/sms_db?retryWrites=true&w=majority`.

### B. Render (Backend)
1. Push repository to GitHub.
2. Link repository to Render as a **Web Service**.
3. Set Build Command: `cd backend && npm install`.
4. Set Start Command: `cd backend && node server.js`.
5. Add Environment Variable: `MONGODB_URI` = your Atlas connection string.

### C. Vercel (Frontend)
1. Link repository to Vercel.
2. Set Root Directory: `frontend`.
3. Set Framework Preset: `Vite`.
4. Add Environment Variable: `VITE_API_URL` = `https://<your-render-backend>.onrender.com/api`.
5. Deploy.

---

## 6. License & Academic Attribution
Developed for academic submission under the Department of CSE (AI&ML), Anil Neerukonda Institute of Technology and Sciences (ANITS), Visakhapatnam.
