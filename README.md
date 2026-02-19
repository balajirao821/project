# OpsMind AI – Context-Aware Corporate Knowledge Brain

## Overview

OpsMind AI is an AI-first Retrieval Augmented Generation (RAG) system that allows enterprises to upload Standard Operating Procedure (SOP) PDFs and ask natural-language questions. The system retrieves the most relevant SOP sections using vector search and generates grounded answers strictly from the documents, streaming responses in real time.

This project implements Project 1: Enterprise SOP Agent from the Zaalima Development Q4 Product Roadmap.

---

## Architecture (AI‑MERN Hybrid Stack)

* Frontend: React.js (Vite) with Server‑Sent Events (SSE) for streaming responses
* Backend: Node.js + Express (Orchestrator)
* Database: MongoDB Atlas with Vector Search
* Embeddings: Sentence‑Transformers (384‑dim vectors)
* LLM: Groq (Llama‑3.1‑8B‑Instant)
* File Handling: Multer + PDF parsing

---

## Core Features

* 📄 SOP Upload & Deletion (Admin Knowledge Base)
* ✂️ PDF parsing + chunking
* 🧠 Vector embedding + MongoDB Atlas Vector Search
* 🔎 Semantic retrieval of top‑K SOP chunks
* 💬 Chat interface with SSE streaming
* 🚫 Hallucination prevention ("I don't know" when missing)

---

## Folder Structure

```
backend/
 ├─ routes/
 │   ├─ upload.js
 │   ├─ chat.js
 │   ├─ files.js
 ├─ services/
 │   ├─ embedder.js
 │   ├─ llm.js
 │   ├─ pdfParser.js
 │   ├─ chunker.js
 ├─ models/
 │   ├─ SopChunk.js
 │   ├─ SopFile.js
 ├─ server.js

frontend/
 ├─ src/App.jsx
 ├─ src/main.jsx
```

---

## Environment Variables

Create a `.env` file in `backend/`:

```
PORT=5050
MONGO_URI=your_mongodb_atlas_uri
GROQ_API_KEY=your_groq_key
```

---

## How It Works (RAG Flow)

1. Upload SOP PDF
2. Parse + chunk text
3. Generate embeddings and store in MongoDB
4. User asks a question
5. Query embedding → Vector Search
6. Top chunks merged as context
7. LLM generates answer **only from context**
8. Answer streamed to UI

---

## Running the Project

### Backend

```bash
cd backend
npm install
node server.js
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Security & Constraints

* No external knowledge allowed in answers
* Explicit fallback: `I don't know.`
* Vector search limited to SOP content

---
### Chat History API
The system stores every user query and AI response in MongoDB.

GET /api/chat/history

Returns the latest 20 chat interactions for audit and review.

---
## License

Internal / Internship Project – Zaalima Development
