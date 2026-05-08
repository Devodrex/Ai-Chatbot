# 🚀 Neural AI Chatbot

A production-ready, full-stack AI chatbot application that enables real-time, context-aware conversations with persistent chat sessions.

Built with a modern architecture using React (Vite), Node.js, MongoDB, and Groq-powered LLaMA models.

---

# 🌐 Live Application

* 🔗 Frontend (Vercel): https://ai-chatbot-three-brown-15.vercel.app
* 🔗 Backend (Render): https://ai-chatbot-u1zo.ounrender45.com

---

# 📌 Problem Statement

Modern conversational applications require:

* Fast AI inference
* Persistent conversation memory
* Scalable backend architecture
* Clean, responsive UI

This project solves these by integrating:

* High-speed inference via Groq
* MongoDB-backed session storage
* REST-based scalable backend
* Modern frontend with optimized build tooling

---

# 🧠 System Architecture

```id="arch123"
User (Browser)
     ↓
Frontend (React + Vite)
     ↓
REST API (Express Server)
     ↓
AI Model (Groq - LLaMA 3.1)
     ↓
MongoDB (Session Storage)
```

---

# ⚙️ Tech Stack Breakdown

## 🖥 Frontend

* React (Vite)
* Axios (API calls)
* Modern UI with message bubbles
* Environment-based API configuration

## 🧠 Backend

* Node.js + Express
* RESTful API design
* Modular routing
* Clean architecture separation

## 🗄 Database

* MongoDB Atlas
* Mongoose ODM
* Session-based schema design

## 🤖 AI Layer

* Groq API
* LLaMA 3.1 model
* Stateless inference + contextual memory from DB

## 🚀 Deployment

* Frontend → Vercel
* Backend → Render
* Database → MongoDB Atlas

---

# ✨ Core Features

## 💬 Conversational AI

* Real-time interaction with LLM
* Context-aware responses using session history

## 🗂 Session Management

* Create new chat sessions
* Load previous conversations
* Persistent storage in MongoDB

## ✏️ Chat Controls

* Rename sessions
* Delete sessions
* Preview recent chats

## ⚡ Performance

* Fast responses using Groq inference
* Optimized frontend build via Vite

## 🌐 Fully Deployed System

* Production-ready architecture
* Environment variable-based configuration

---

# 📂 Folder Structure

```id="struct456"
ai-chatbot/
│
├── client-new/              # Vite frontend
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/                  # Backend API
│   ├── models/
│   │   └── Session.js
│   ├── routes/
│   │   └── chat.js
│   ├── db.js
│   └── server.js
│
├── .gitignore
└── README.md
```

---

# 🔌 API Design

## 🔹 Create Session

```id="api1"
POST /session
```

## 🔹 Get All Sessions

```id="api2"
GET /sessions
```

## 🔹 Get Messages of Session

```id="api3"
GET /sessions/:id
```

## 🔹 Send Message to AI

```id="api4"
POST /chat-stream
```

## 🔹 Rename Session

```id="api5"
PUT /sessions/:id
```

## 🔹 Delete Session

```id="api6"
DELETE /sessions/:id
```

---

# 🗄 Database Schema

## Session Model

```id="schema1"
{
  title: String,
  messages: [
    {
      role: "user" | "assistant",
      content: String,
      createdAt: Date
    }
  ]
}
```

---

# 🔐 Environment Variables

## Backend (.env)

```id="env1"
MONGO_URI=your_mongodb_uri
OPENAI_API_KEY=your_groq_api_key
PORT=5000
```

---

## Frontend (Vercel)

```id="env2"
VITE_API_URL=https://your-backend.onrender.com
```

---

# 🧪 Local Development Setup

## 1️⃣ Clone Repository

```id="setup1"
git clone https://github.com/Devodrex/ai-chatbot.git
cd ai-chatbot
```

---

## 2️⃣ Backend Setup

```id="setup2"
cd server
npm install
node server.js
```

---

## 3️⃣ Frontend Setup (Vite)

```id="setup3"
cd client-new
npm install
npm run dev
```

---

# 🚀 Deployment Guide

## 🔹 Backend (Render)

* Root Directory: `server`
* Build Command: `npm install`
* Start Command: `node server.js`
* Add environment variables manually

---

## 🔹 Frontend (Vercel)

* Root Directory: `client-new`
* Framework: Vite
* Build Command: `npm run build`
* Output Directory: `dist`

---

# ⚠️ Challenges & Solutions

## ❌ Issue: API 404 Errors

**Cause:** Incorrect endpoint or trailing slash
**Fix:** Normalized BASE_URL using `.replace(/\/$/, "")`

---

## ❌ Issue: Vercel Build Freezing

**Cause:** Create React App inefficiency
**Fix:** Migrated to Vite for faster builds

---

## ❌ Issue: Git Submodule Errors

**Cause:** Nested Git repo in frontend
**Fix:** Removed submodule and restructured repo

---

## ❌ Issue: Environment Variables Not Working

**Cause:** Missing prefix
**Fix:** Used `VITE_` prefix for frontend

---

# 📈 Future Improvements

* 🔐 User Authentication (JWT / OAuth)
* ⚡ Streaming AI responses
* 🎨 Advanced UI (glassmorphism + animations)
* 🧠 Conversation summarization
* 📊 Usage analytics dashboard

---

# 📊 What This Project Demonstrates

* Full-stack system design
* API integration with AI models
* Deployment across multiple platforms
* Debugging real-world issues
* Clean separation of concerns

---

# 🙌 Acknowledgements

* Groq → High-speed AI inference
* MongoDB Atlas → Cloud database
* Vercel → Frontend deployment
* Render → Backend hosting

---

# 📬 Contact

* GitHub: https://github.com/your-Devodrex
* LinkedIn: www.linkedin.com/in/addy60456

---

# ⭐ Support

If you found this project useful:

👉 Star ⭐ the repo
👉 Fork and build on it

---

# 🔥 Final Note

This project reflects not just implementation, but problem-solving, debugging, and deployment experience—key aspects of real-world software development.
