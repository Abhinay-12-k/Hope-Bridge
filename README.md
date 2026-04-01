# HopeBridge NGO — Production Ready Platform

The HopeBridge NGO platform is now fully functional, production-ready, and integrated with a high-end Firebase backend.

## 🚀 Key Features

### 🖥️ Public Experience
- **Real-time Data Delivery**: All projects, team members, and gallery assets are streamed live from Firebase Firestore.
- **Functional Engagement**:
  - **Volunteer HQ**: Secure registration with validation and success tracking.
  - **Inquiry Portal**: Modern contact form with real-time Firestore persistence.
  - **Impact Counters**: Dynamic statistics pulled directly from administrative settings.
- **SEO & Performance**: Distinct meta tags and page titles for each route using `react-helmet-async`.

### 🔒 Admin HQ Management Portal
- **Dashboard**: Real-time stats visualization of all organizational metrics.
- **Initiative Manager**: Full CRUD suite for global projects with Storage integration.
- **Media Repository**: Asset management with captioning and category synchronization.
- **Candidate Vetting**: Table-based volunteer management with status vetting (Approve/Reject).
- **Communication Manager**: Inquiry tracking with response orchestration.

## 🛠️ Setup Instructions

### 1. Environment Configuration
Copy `.env.example` to `.env` in the `client` directory and populate your Firebase credentials.

```bash
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_STORAGE_BUCKET=xxx
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_FIREBASE_APP_ID=xxx
```

### 2. Dependency Management
```bash
cd client
npm install
npm run dev
```

### 3. Creating the First Admin
1. Go to the **Firebase Console** → **Authentication**.
2. Click **Add User** and create an email/password account (e.g., `admin@hopebridge.org`).
3. You can now log in at `/admin/login`.

### 4. Database Initialization
Create a document in Firestore:
- **Collection**: `settings`
- **Document ID**: `global`
- **Fields**:
  - `heroSubtitle`: string
  - `missionText`: string
  - `visionText`: string
  - `stats`: map { `families`: string, `volunteers`: string, `countries`: string, `years`: string }

## 📄 Deployment Guidelines

- **Frontend**: Deploy to **Vercel** or **Netlify** with the `.env` variables configured in the dashboard.
- **Security**: Apply the `firestore.rules` located in the root directory via the Firebase CLI or Console.
- **Storage**: Initialize Firebase Storage in the console and set rules to allow `read: if true` and `write: if request.auth != null`.
