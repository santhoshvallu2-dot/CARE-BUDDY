# CareBuddy AI

> **A privacy-first HealthTech companion that converts complex medical documents into understandable care instructions, actionable reminders, smart insights, and doctor questions.**  
> **Hackathon:** iQOO Hackathon 2026  
> **Track:** HealthTech  
> **Tagline:** *Understand your care. Remember your routine.*

---

## 🌟 Overview

**CareBuddy AI** is a phone-first healthcare information organizer and daily routine companion. It empowers patients, elderly individuals, and family caregivers to transform dense, confusing medical instructions (prescriptions, discharge summaries, care plans) into structured, clear, and reassuring daily care routines.

---

## 🛡️ Important Accuracy & Health Safety Notice

> **Non-Diagnostic Notice:**  
> **CareBuddy AI is a non-diagnostic healthcare information organizer and care-routine assistant.**  
> - It does **NOT** diagnose medical conditions, prescribe treatments, or modify medication dosages.  
> - It does **NOT** invent information missing from source documents.  
> - All document interpretations require **explicit user verification** before saving routines.  
> - Unclear or ambiguous instructions are explicitly flagged with: *"Information unclear. Please verify with your healthcare professional."*

### 🤖 AI Engine Architecture Notice
- The current AI analysis runs on a **privacy-first, deterministic client-side rule-based extraction engine** (`mockAIService.ts` and `insightService.ts`).
- **No NPU, Qualcomm QNN, or on-device LLM model weights** are claimed or used.
- The **Caregiver Cross-Device Handoff** is a **custom client-side bridge** (via SVG QR vectors, 6-digit sync codes, and Base64 transfer payloads) and is **NOT an official iQOO Office Kit integration**.

---

## ✨ Features

- **Medical Document Scanning & Upload:** Capture photos via mobile camera or upload JPG/PNG/WEBP files.
- **Client-Side OCR (Tesseract.js):** Browser-based WebAssembly text extraction with contrast preprocessing.
- **Editable OCR Text Verification:** Users review and edit raw text before triggering AI analysis.
- **Deterministic Local Document Analysis:** Extracts medication names, timings, frequencies, and routine steps.
- **Care Summary & Plain-Language Instructions:** Clarifies medical instructions into simple language.
- **Smart Care Insights:** Multi-factor contextual tips (timing coordination, food rules, hydration).
- **Doctor Questions Organizer:** Automatically generates discussion points grounded in verified documents.
- **Voice Read-Aloud & Speech Input:** Web Speech API text-to-speech audio and speech-to-text input with typing fallbacks.
- **Explicit Reminder Confirmation Gate:** Zero silent reminder generation; requires explicit user review.
- **Today's Care Routine & Progress Gauge:** Check off daily doses with live adherence progress tracking.
- **SQLite Database Persistence:** FastAPI backend persists documents, reminders, completions, and questions in `carebuddy.db`.
- **Dual-Layer Offline Fallback:** Synchronizes with `localStorage` for uninterrupted offline functionality.
- **Installable Progressive Web App (PWA):** Web app manifest, service worker caching, and standalone mobile display.
- **Custom Caregiver Cross-Device Handoff:** Transfer care summaries to a caregiver laptop via QR code, 6-digit code, or JSON file.

---

## 🏗️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide React |
| **Backend** | FastAPI, Python 3.10+, SQLAlchemy, Uvicorn |
| **Database** | SQLite 3 (`backend/carebuddy.db`) |
| **OCR** | Tesseract.js v7.0.0 (WASM) |
| **Voice / Audio** | Browser Web Speech API (`SpeechRecognition` & `SpeechSynthesis`) |
| **Mobile Packaging** | Progressive Web App (PWA with Service Worker & Web Manifest) |

---

## 🚀 Local Development Guide

### 1. Backend Setup (FastAPI + SQLite)

Open a terminal in the root directory:

```powershell
# Navigate to backend directory
cd backend

# (Optional) Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server
python main.py
# Or alternately:
# uvicorn main:app --reload --port 8000
```

- **Backend API URL:** `http://localhost:8000`
- **Interactive Swagger Docs:** `http://localhost:8000/docs`
- **Health Check Endpoint:** `http://localhost:8000/api/health`

---

### 2. Frontend Setup (React + Vite)

> 💡 **Windows PowerShell Note:**  
> If PowerShell script execution policy blocks `npm.ps1`, use `npm.cmd` explicitly on Windows.

Open a second terminal:

```powershell
# Navigate to frontend directory
cd frontend

# Install dependencies
npm.cmd install

# Start Vite development server
npm.cmd run dev
```

- **Frontend Application URL:** `http://localhost:5173`

---

## 📦 Project Structure

```
CARE BUDDY/
├── backend/
│   ├── app/
│   │   ├── api/             # FastAPI REST endpoints (documents, reminders, questions, insights)
│   │   ├── core/            # Configuration and CORS settings
│   │   ├── models/          # SQLAlchemy ORM models (Document, Reminder, Question)
│   │   ├── schemas/         # Pydantic validation schemas
│   │   └── services/        # Backend insight engines
│   ├── carebuddy.db         # Persistent SQLite database
│   ├── main.py              # Backend entry point and lifespan
│   └── requirements.txt     # Python backend dependencies
├── frontend/
│   ├── public/              # PWA manifest, service worker, app icons
│   ├── src/
│   │   ├── components/      # UI components, modals, voice, handoff, PWA controls
│   │   ├── data/            # Sample prescriptions and mock fixtures
│   │   ├── pages/           # HomePage, DocumentsPage, RemindersPage, QuestionsPage, ProfilePage
│   │   ├── services/        # AI service layer, OCR, Voice, Handoff, API Client
│   │   ├── types/           # TypeScript domain definitions
│   │   ├── App.tsx          # Main layout and modal state coordinator
│   │   └── main.tsx         # React DOM entry
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── .gitignore
├── .env.example
└── README.md
```

---

## 🧪 Build & Typecheck Verification

```powershell
# In frontend directory:
npm.cmd run build
```
*Outputs production bundle to `dist/` with 0 TypeScript errors.*

---

## 👥 Hackathon Submission Details

- **Hackathon:** iQOO Hackathon 2026
- **Track:** HealthTech
- **Project Name:** CareBuddy AI
- **Tagline:** *Understand your care. Remember your routine.*
- **Live Production URL:** [https://carebuddy-ten.vercel.app/](https://carebuddy-ten.vercel.app/)
- **Repository:** [https://github.com/santhoshvallu2-dot/CARE-BUDDY](https://github.com/santhoshvallu2-dot/CARE-BUDDY)

