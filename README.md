# YT — Synchronized YouTube Watch Party

**yt** is a modern, real-time web application that lets users watch YouTube videos together in synchronized room sessions with full role-based permissions, participant requests, and chat features.

---

## Features

- **Synchronized Playback**: Sub-second synchronization across all participants (play, pause, seek, video changes).
- **Role-Based Access Control**:
  - **Host**: Full control over room settings, video playback, role assignments (promote/demote), request approvals, and host transfer.
  - **Moderator**: Can control playback and manage playback requests.
  - **Participant**: Can request playback changes or video updates for host/mod approval, chat, and react.
- **Playback Request System**: Non-hosts can queue play, pause, seek, or change video requests for host/mod approval.
- **Session Persistence**: Automatic session restoration via session tokens and MongoDB room state recovery upon reconnects.
- **Real-Time Interactive UI**: Built with React, Tailwind CSS v4, Lucide icons, live chat, interactive reactions, and connection status monitoring.

---

## Tech Stack

- **Frontend**: React 19, Vite 8, TypeScript, Tailwind CSS v4, Lucide Icons, Socket.IO Client.
- **Backend**: Node.js, Express v5, Socket.IO, Mongoose v9, MongoDB.
- **Shared**: Shared TypeScript definitions and event types across client and server.

---

## Quick Start

### 1. Prerequisites
- Node.js 18+
- MongoDB instance (Cloud MongoDB Atlas or local MongoDB)

### 2. Environment Setup

Ensure `server/.env` contains your MongoDB URI and port configuration:
```env
PORT=3001
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/yt
CLIENT_URL=http://localhost:5173
```

Ensure `client/.env` points to your backend URL:
```env
VITE_SERVER_URL=http://localhost:3001
```

### 3. Running the Application

To start both the client and server concurrently:
```bash
npm run dev
```

Or start them individually:
```bash
# Server
cd server && npm run dev

# Client
cd client && npm run dev
```

- **Client**: [http://localhost:5173](http://localhost:5173)
- **Server**: [http://localhost:3001](http://localhost:3001)

---

## Project Structure

```
.
├── client/          # Vite + React frontend application
│   └── src/
│       ├── components/  # Room controls, Chat, Video Player, UI primitives
│       ├── hooks/       # Socket & Room hooks
│       ├── pages/       # Landing page & Room page
│       └── lib/         # Socket singleton & YouTube helpers
├── server/          # Express + Socket.IO backend service
│   └── src/
│       ├── config/      # DB & Server configuration
│       ├── models/      # Mongoose schemas
│       ├── services/    # Room, Playback, Participant & Request managers
│       └── socket/      # Event handlers for socket connections
└── shared/          # Shared TypeScript interfaces and Socket event specs
```

---

## License
MIT
