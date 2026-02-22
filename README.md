<div align="center">

# ⚡ Pulse

### A premium real-time messaging app — installable as a PWA

![Built with React](https://img.shields.io/badge/Frontend-React_+_Vite-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Backend-Node.js_+_Express-339933?style=for-the-badge&logo=nodedotjs)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb)
![Socket.io](https://img.shields.io/badge/Realtime-Socket.io-010101?style=for-the-badge&logo=socketdotio)
![PWA](https://img.shields.io/badge/PWA-Installable-5A0FC8?style=for-the-badge&logo=pwa)

</div>

---

## ✨ Features

| Feature | Details |
|---|---|
| � **Real-time Messaging** | Instant delivery via Socket.io with typing indicators |
| 👥 **Group Chats** | Create groups, manage members, rename — admin controls included |
| 🟢 **Presence Status** | See who's online or offline in real-time |
| 🔐 **JWT Auth** | Secure login & registration with bcrypt password hashing |
| �️ **Avatar System** | Dynamic avatars via DiceBear — 6 unique visual styles |
| � **Mobile-First** | WhatsApp-style navigation — switch between chat list and conversation |
| 📲 **PWA / Installable** | Install on Android, iPhone, or desktop — works like a native app |
| 🎨 **Premium UI** | Glassmorphism design, Framer Motion animations, responsive layout |

---

## 🛠️ Tech Stack

### Frontend
- **React** + **Vite** — Fast dev & build
- **Tailwind CSS** — Utility-first styling
- **Framer Motion** — Smooth animations
- **Zustand** — Lightweight state management
- **Socket.io-client** — Real-time events
- **Lucide React** — Icon library

### Backend
- **Node.js** + **Express** — REST API
- **MongoDB** + **Mongoose** — Database & ODM
- **Socket.io** — WebSocket server
- **JWT** + **bcryptjs** — Authentication
- **Cloudinary** + **Multer** — Profile image uploads

---

## 🚀 Local Setup

### Prerequisites
- Node.js v18+
- MongoDB (local or [Atlas](https://mongodb.com/atlas))
- A [Cloudinary](https://cloudinary.com) account (free) for image uploads

### 1. Clone the repo
```bash
git clone https://github.com/your-username/pulse.git
cd pulse
```

### 2. Backend
```bash
cd server
npm install
```

Create a `server/.env` file:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

```bash
npm run dev
```

### 3. Frontend
```bash
cd client
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🌐 Free Hosting

### Frontend → [Vercel](https://vercel.com)
1. Push code to GitHub
2. Import repo on Vercel
3. Set **Root Directory** to `client`
4. Deploy — done ✅

### Backend → [Render](https://render.com)
1. New → **Web Service** → connect repo
2. Set **Root Directory** to `server`
3. **Build command:** `npm install`
4. **Start command:** `node server.js`
5. Add all `.env` variables in the Render dashboard
6. Deploy ✅

### Database → [MongoDB Atlas](https://mongodb.com/atlas)
Free M0 tier — no credit card required.

> **After deploying**, update the backend URL in `client/src/api.js` to point to your Render service URL.

---

## 📲 Install as App (PWA)

| Platform | Steps |
|---|---|
| **Android (Chrome)** | 3-dot menu → "Add to Home Screen" |
| **iPhone (Safari)** | Share button → "Add to Home Screen" |
| **Desktop (Chrome/Edge)** | Install icon (⊕) in the address bar |

---

## 📁 Project Structure

```
pulse/
├── client/               # React frontend (Vite)
│   ├── public/           # Static assets + PWA files (manifest, sw.js)
│   └── src/
│       ├── components/   # Sidebar, ChatWindow, Modals
│       ├── pages/        # Landing, Auth, Dashboard
│       └── store/        # Zustand stores
└── server/               # Node.js backend
    ├── controllers/      # Route handlers
    ├── models/           # Mongoose schemas
    ├── routes/           # Express routes
    └── middleware/        # Auth & upload middleware
```

---

<div align="center">
  Made with ❤️ using the MERN stack
</div>
