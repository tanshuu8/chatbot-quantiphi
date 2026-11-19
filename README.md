# Spark AI • Intelligent Chat Assistant

A production-grade, full-stack AI Chat Assistant built with **React**, **Vite**, **Tailwind CSS**, **Lucide React**, **Node.js**, **Express**, **MongoDB**, **Mongoose**, and the **OpenAI official Node.js SDK**, featuring real-time **Server-Sent Events (SSE)** streaming and an Apple-inspired glassmorphic design with orange, yellow, and blue accents.

---

## 🎨 Apple-Inspired Glassmorphic Design

- **Aesthetic**: Frosted translucent glass panels (`backdrop-blur-2xl`, `bg-white/80`, `border-white/90`), subtle ambient Apple Intelligence background glow spheres (orange, amber, and electric blue), and clean micro-interactions.
- **Palette**:
  - **Electric Sapphire Blue**: Professional tone, primary iMessage user message cards, and tech accents.
  - **Warm Radiant Orange**: Casual tone, Spark AI avatar gradient, glowing active states.
  - **Glowing Amber / Yellow**: Concise tone, warm lighting accents, compact status badges.
- **Micro-Interactions**: One-click copy with `"Copied!"` feedback, dynamic response regeneration, auto-resizing floating capsule composer, and smart auto-scrolling with user-scroll detection.

---

## 🚀 Key Features

1. **Separated Message Bubbles**: Sleek Apple iMessage electric blue user bubbles and frosted glass AI response cards with syntax-highlighted code blocks and timestamps.
2. **Real-Time SSE Streaming**: Incremental token rendering via Server-Sent Events from the official OpenAI Node SDK through Express to React with live glowing cursor and typing animation.
3. **Sidebar Conversation History**: Real-time listing of previous conversations from MongoDB, chronological sorting, search filtering, auto-generated titles, and deletion.
4. **Three Selectable Response Tones**:
   - **Professional**: `"Respond in a professional, structured, and clear manner."` (Electric Blue)
   - **Casual**: `"Respond naturally, conversationally, and in a friendly tone."` (Warm Orange)
   - **Concise**: `"Respond briefly, directly, and focus on essential information."` (Radiant Amber)
   *Tones are persisted with each conversation in MongoDB and dynamically affect the AI model generation.*
5. **Regenerate Response**: Re-generates a new assistant response for the previous user message without duplicating the user prompt.
6. **Copy to Clipboard**: One-click copying of full AI responses with visual feedback (`Copied!`).
7. **Connection Resilience & Abort Support**: Abort controller cleans up active SSE connections and OpenAI streams when user stops or navigates away.
8. **Mobile Responsiveness**: Slide-over drawer sidebar, backdrop overlay, and adaptive tone selector dropdown for mobile screens.

---

## 🛠 Tech Stack

- **Frontend**:
  - React 18
  - Vite
  - JavaScript (ES Modules)
  - Tailwind CSS
  - Lucide React
- **Backend**:
  - Node.js (v20+)
  - Express.js
  - MongoDB & Mongoose
  - OpenAI Official Node.js SDK (`openai`)
- **Streaming Protocol**:
  - Server-Sent Events (SSE)

---

## 🏛 Architecture & Separation of Concerns

```
chatbot-quantiphi/
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js              # Mongoose connection & lifecycle events
│   │   │   └── openai.js          # OpenAI client configuration & model settings
│   │   ├── models/
│   │   │   ├── Conversation.js    # Conversation schema (title, tone, timestamps)
│   │   │   └── Message.js         # Message schema (conversationId, role, content)
│   │   ├── routes/
│   │   │   ├── conversationRoutes.js
│   │   │   └── chatRoutes.js
│   │   ├── controllers/
│   │   │   ├── conversationController.js
│   │   │   └── chatController.js  # SSE streaming & regeneration handlers
│   │   ├── services/
│   │   │   ├── openaiService.js   # Tone system instructions & streaming
│   │   │   └── conversationService.js # DB persistence, auto-titling, history
│   │   ├── middleware/
│   │   │   └── errorHandler.js    # Centralized error handling
│   │   ├── app.js                 # Express app configuration & middleware
│   │   └── server.js              # Server entry point
│   ├── .env.example
│   ├── .env
│   ├── test-suite.js              # 25 automated live assertions
│   └── package.json
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx        # History list, search, new chat, delete
│   │   │   ├── Header.jsx         # App bar, title, mobile toggle, tone selector
│   │   │   ├── ChatArea.jsx       # Scroll container, auto-scroll, message list
│   │   │   ├── MessageBubble.jsx  # User & AI bubbles with copy & regenerate
│   │   │   ├── StreamingMessageBubble.jsx # Incremental text & typing animation
│   │   │   ├── MessageComposer.jsx# Auto-resize textarea, send & stop controls
│   │   │   ├── EmptyState.jsx     # Greeting & 4 clickable suggested prompts
│   │   │   └── ToneSelector.jsx   # Segmented control & mobile dropdown
│   │   ├── hooks/
│   │   │   ├── useChat.js         # Context accessor
│   │   │   ├── useClipboard.js    # Copy to clipboard with tooltip state
│   │   │   └── useAutoScroll.js   # Smart auto-scroll with user scroll detection
│   │   ├── services/
│   │   │   ├── api.js             # REST API client for conversations
│   │   │   └── sseStream.js       # SSE streaming reader with event parsing
│   │   ├── state/
│   │   │   └── ChatContext.jsx    # Central application state & actions
│   │   ├── App.jsx                # Layout wrapper
│   │   ├── main.jsx               # React entry point
│   │   └── index.css              # Tailwind & custom scrollbar styles
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
└── package.json                   # Root orchestrator scripts
```

---

## 📡 API Reference

### Conversations

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/conversations` | Create a new conversation with optional `{ title, tone }` |
| `GET` | `/api/conversations` | List all conversations sorted by `updatedAt: -1` |
| `GET` | `/api/conversations/:id` | Fetch conversation details and all associated messages |
| `DELETE` | `/api/conversations/:id` | Delete conversation and its messages |
| `PATCH` | `/api/conversations/:id` | Update conversation title or tone `{ title, tone }` |

### Chat & Streaming (SSE)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/chat/:id` | Send message `{ message, tone? }`, streams response via SSE, saves user & assistant messages |
| `POST` | `/api/chat/:id/regenerate` | Discards previous assistant response and streams a regenerated response for the prior user message |

---

## ⚙️ Installation & Setup Instructions

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher)
- **MongoDB** running locally on port 27017 or a MongoDB Atlas URI

### 2. Install Dependencies

```bash
# In the project root:
npm run install:all
```

### 3. Environment Variables

Create `.env` in `server/` (and root if running from root):

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/ai-chat-assistant

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini

# Optional custom base URL for OpenAI-compatible providers (Groq, Ollama, etc.):
# OPENAI_BASE_URL=https://api.openai.com/v1
```

### 4. Running the Application

```bash
# Start backend server (port 5000):
npm run server

# Start frontend dev server (port 5173):
npm run client

# Run the 25 automated live tests:
npm test
```

### 5. Production Build

```bash
npm run build
```
Optimized static production assets are compiled to `client/dist/`.
