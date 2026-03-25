# 🏌️ Golf Charity Club

A full-stack web application built for an internship assignment. This platform allows users to subscribe, track golf scores, participate in monthly draws, and contribute to charity — all in one system.

---

## 🚀 Features

### 👤 User Features

* User Registration & Login (JWT Authentication)
* Subscription Management (Monthly / Yearly)
* Add and track latest golf scores (last 5 scores logic)
* Automatic qualification for monthly draw
* View draw results and history
* Track winnings and payout status
* Submit proof for unverified winnings

---

### 🛠️ Admin Features

* View and manage all users
* Monitor active subscriptions
* Run monthly draw
* View draw history and prize pool
* Verify winners and review proofs
* Mark payouts as completed

---

## 🧠 Project Overview

This project solves the problem of managing golf-based draw participation by combining:

* Score tracking
* Subscription system
* Monthly reward draws
* Admin verification and payout management

It provides a structured and user-friendly platform for both users and administrators.

---

## 🏗️ Tech Stack

### Frontend

* React (Vite)
* Tailwind CSS
* Axios
* Lucide React (Icons)

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose)
* JWT Authentication

---

## 🌐 Live Demo

* Frontend: https://your-vercel-link.vercel.app
* Backend API: https://your-render-link.onrender.com

---

## 🔐 Demo Credentials



### Admin

* Email: [admin@mail.com](mailto:admin@demo.com)
* Password: 123456

---

## ⚙️ Setup Instructions

### 1. Clone Repository

```bash
git clone https://github.com/Riyajindal525/Golf-Charity-Club.git
cd Golf-Charity-Club
```

---

### 2. Backend Setup

```bash
cd backend
npm install
npm run dev
```

Create `.env` file inside backend:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Create `.env` file inside frontend:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📌 Notes

* This project is built as part of an internship assignment.
* Payment system is simulated (no real payment gateway integrated).
* Focus was on full-stack implementation, clean UI, and core product logic.


## ⭐ Final Thoughts

This project demonstrates:

* Full-stack development skills
* API integration and authentication
* Dashboard UI/UX design
* Real-world product thinking

---

If you like the project, feel free to ⭐ the repository!
