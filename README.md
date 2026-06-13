# 🏛️ MuniBond India Intelligence Terminal

India's premier real-time ledger for municipal bond tracking, revenue analytics, and fiscal transparency across state corporations. This high-integrity financial terminal provides municipal officers and analysts with critical market data and security monitoring tools.

## 🚀 Key Features

- **📊 Bond Market Screener**: Real-time tracking of municipal bonds across 18+ Indian states with CRISIL/ICRA ratings.
- **🔐 Secure Access Terminal**: Advanced authentication gateway featuring Google Sign-In and dedicated administrative profiles.
- **🛡️ Financial Gatekeeper**: Real-time monitoring of workspace sessions and detailed audit trails for every administrative action.
- **🌍 Localization & UX**: Support for regional languages (Hindi, Marathi, Kannada) and high-density Bloomberg-style compact grids.
- **🌓 Visual Comfort**: Integrated Dark Terminal Mode for high-contrast, late-night financial analysis.
- **📱 Offline-First**: Works seamlessly on static hosting with local authentication fallback.

## 🛠️ Technical Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express (Custom Vite Integration)
- **Auth**: Firebase Google Authentication
- **Icons**: Lucide React
- **Build**: Vite, esbuild

## 📥 Installation

1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment**:
   Create a `.env` file based on `.env.example` with your Firebase credentials.

## 🚦 Getting Started

Run the development terminal:
```bash
npm run dev
```
The terminal will be accessible at `http://localhost:3007` (or the next available port).

## 👤 Authorized Access

The primary administrative node is configured for:
- **ID**: `rishikeshbrijjbhushanmishra@gmail.com`
- **Signature**: `Rishi@050107`

## 🚀 Deployment Options

### Option 1: Vercel (Static Frontend Only - Recommended)
This is the easiest deployment method. The app includes offline/local authentication fallback, so it works perfectly without a backend server.

1. **Build the project**:
   ```bash
   npm run build
   ```
2. **Deploy to Vercel**:
   - Push your code to GitHub/GitLab/Bitbucket
   - Import the repository in Vercel
   - Configure environment variables in Vercel dashboard:
     - `VITE_FIREBASE_API_KEY`
     - `VITE_FIREBASE_AUTH_DOMAIN`
     - `VITE_FIREBASE_PROJECT_ID`
     - `VITE_FIREBASE_STORAGE_BUCKET`
     - `VITE_FIREBASE_MESSAGING_SENDER_ID`
     - `VITE_FIREBASE_APP_ID`
   - Deploy!

### Option 2: Full Stack Deployment (Backend + Frontend)
For full backend functionality (admin session tracking, etc.):

**Build the project**:
```bash
npm run build
```

**Deploy to Render.com / Railway.app / Fly.io**:
1. Push your code to GitHub
2. Connect repository to your chosen platform
3. Set environment variables
4. Set build command: `npm run build`
5. Set start command: `npm start`
6. Deploy!

**Deploy to any VPS (AWS EC2, DigitalOcean, etc.)**:
1. SSH into your server
2. Install Node.js 20+
3. Clone repository
4. `npm install`
5. `npm run build`
6. `npm start`
7. Use PM2 or systemd to keep it running

### Environment Variables
Copy `.env.example` to `.env` and fill in:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 📄 License
Apache-2.0
