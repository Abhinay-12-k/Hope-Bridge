# 🌉 HopeBridge NGO Website

A full-stack NGO website with admin portal and donations system.
Built with React + Vite + Firebase + TailwindCSS + Framer Motion.

## 🔗 Live Demo
[https://hopebridge-ngo.onrender.com](https://hopebridge-ngo.onrender.com)

## ✨ Features
- Public website: Home, About, Works, Gallery, Donate, Contact, Volunteer
- Admin portal with role-based access (superadmin / moderator)
- Real-time volunteer management with approve/reject workflow
- Donations system with campaign tracking
- Image gallery with Firebase Storage
- Contact form with admin inbox
- Notification system

## 🛠️ Tech Stack
- **Frontend:** React 18, Vite, TailwindCSS, Framer Motion
- **Backend:** Firebase (Firestore, Auth, Storage)
- **Deployment:** Render (Static Site)
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts

## 🚀 Local Setup

### 1. Clone the repository
git clone https://github.com/Abhinay-12-k/hope-bridge-ngo
cd hopebridge-ngo

### 2. Install dependencies
npm install

### 3. Firebase Setup
- Go to https://console.firebase.google.com
- Create a new project: "hopebridge-ngo"
- Enable these services:
  - Authentication → Email/Password
  - Firestore Database → Start in production mode
  - Storage → Start in production mode
- Go to Project Settings → Your Apps → Add Web App
- Copy the config values

### 4. Environment Variables
cp .env.example .env
# Fill in your Firebase values in .env

### 5. Deploy Firestore Rules
- Go to Firebase Console → Firestore → Rules
- Copy and paste the rules from firestore.rules file
- Click Publish

### 6. Run locally
npm run dev
# Opens at http://localhost:5173

### 7. Create First Admin
- Visit http://localhost:5173/admin/register
- Create your superadmin account
- Login at http://localhost:5173/admin/login

## 🌐 Deploy to Render

### Step 1: Push to GitHub
git init
git add .
git commit -m "Initial commit: HopeBridge NGO website"
git branch -M main
git remote add origin https://github.com/Abhinay-12-k/hope-bridge-ngo
git push -u origin main

### Step 2: Connect to Render
1. Go to https://render.com → Sign up/Login
2. Click "New +" → "Static Site"
3. Connect your GitHub account
4. Select the hopebridge-ngo repository
5. Configure:
   - Name: hopebridge-ngo
   - Branch: main
   - Build Command: npm install && npm run build
   - Publish Directory: dist
6. Add Environment Variables (click "Environment"):
   Add ALL variables from .env.example with your real values
7. Click "Create Static Site"
8. Wait 3-5 minutes for first deploy ✅

### Step 3: Update Firebase Auth Domain
- Firebase Console → Authentication → Settings → Authorized domains
- Add your Render URL: hopebridge-ngo.onrender.com

### Step 4: Update VITE_APP_URL
- In Render dashboard → Environment
- Update VITE_APP_URL to your actual Render URL
- Trigger redeploy

## 📁 Project Structure
src/
├── firebase/config.js       # Firebase initialization
├── hooks/                   # Custom React hooks
├── components/              # Shared components
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   └── ...
├── pages/                   # All pages
│   ├── Home.jsx
│   ├── About.jsx
│   ├── Works.jsx
│   ├── Donate.jsx
│   ├── Gallery.jsx
│   ├── Volunteer.jsx
│   ├── Contact.jsx
│   └── admin/               # Admin portal
│       ├── AdminLogin.jsx
│       ├── AdminRegister.jsx
│       ├── AdminDashboard.jsx
│       ├── AdminVolunteers.jsx
│       ├── AdminDonations.jsx
│       └── ...
└── App.jsx

## 🔐 Admin Access
- Register: /admin/register (first time only)
- Login: /admin/login
- Dashboard: /admin/dashboard

## 📋 Firestore Collections
| Collection | Description |
|---|---|
| volunteers | Volunteer applications |
| donations | Donation records |
| contacts | Contact form messages |
| projects | NGO projects/works |
| gallery | Photo gallery |
| campaigns | Donation campaigns |
| adminUsers | Admin accounts |
| settings | Website settings |

## 🤝 Contributing
Pull requests welcome. Please open an issue first.

## 📄 License
MIT License — HopeBridge Foundation 2026
