# 📄 DocuMate: AI-Powered PDF Assistant with RAG

An AI-powered document assistant that reads your PDFs—so you don't have to.

This project builds a smart assistant using **Large Language Models (LLMs)** and **Retrieval-Augmented Generation (RAG)** to answer questions about uploaded PDF files. Users can interact via a conversational interface to get **contextual, accurate responses** from their documents.

---

## 🔗 Repository

[https://github.com/ADongol123/pdf_parser_ai](https://github.com/ADongol123/pdf_parser_ai)

---

## 🧠 Project Overview

### 👨‍🏫 Business Scenario

Students and researchers often deal with lengthy academic PDFs that are hard to sift through. **DocuMate** allows users to:

- Upload academic or technical PDFs
- Ask questions using natural language
- Receive relevant, accurate answers in real-time

### 💡 Solution

A full-stack, RAG-powered system that integrates:

- FastAPI for the backend
- LangChain for RAG orchestration
- Mistral LLM (via Ollama)
- MongoDB for chat history & metadata
- ChromaDB as the vector database

---

## 🧩 Tech Stack

| Layer            | Tools & Frameworks                               |
|------------------|---------------------------------------------------|
| **Frontend**     | React (or similar) — Chat Interface               |
| **Backend**      | FastAPI                                           |
| **LLM**          | Mistral via Ollama                                |
| **Embeddings**   | Sentence Transformers + ChromaDB                  |
| **Storage**      | MongoDB (chat history, metadata), Local Files     |
| **Auth**         | JWT-based authentication                          |

---

## 🔁 Pipeline Flow

1. **PDF Upload**
2. **Text Extraction** – Clean and structure text from PDFs
3. **Text Chunking** – Overlapping window chunking for context preservation
4. **Embedding Generation** – Convert text chunks to semantic vectors
5. **Vector Storage** – Store in ChromaDB for efficient similarity search
6. **User Query** – Natural language input from frontend
7. **Similarity Search** – Retrieve relevant chunks via vector matching
8. **Prompt Construction** – Combine user query + results + chat history
9. **LLM Response** – Generate answer using Mistral (via Ollama)
10. **Contextual Conversation** – Store and resume chat sessions

---

## 📌 Key Features

### ✅ Natural Language Question Answering

Chat with your document like a human tutor. Ask follow-up questions with full context.

### 🧠 Topic Extraction

Automatically extract 5–10 key topics from the PDF using embedding clustering for:

- TOC Generation
- Navigation
- Summarization

### 🔐 Secure User Authentication

JWT tokens ensure secure access to:

- PDF uploads
- Chat endpoints
- User-specific metadata

### 💬 Chat History & Context Management

- Saves sessions by user & PDF
- Context-aware answers
- Seamless resumption of prior interactions

---

## 🛠️ Developer Setup

```bash
# Clone the repo
git clone https://github.com/ADongol123/pdf_parser_ai.git
cd pdf_parser_ai

# (Optional) Create virtual environment
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install dependencies
pip install -r requirements.txt

# Run FastAPI server 
uvicorn main:app --reload


### For the Frontend Side
# Navigate to frontend directory
cd ../auth-ui  # or `frontend` based on your folder name

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Update the .env.local with your backend API URL and other settings

# Start the development server
npm run dev
