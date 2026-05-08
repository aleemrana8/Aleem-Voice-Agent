<div align="center">

# 🏥 Aleem Voice Agent

### AI-Powered Hospital Voice Receptionist & EHR System

[![CI/CD Pipeline](https://github.com/aleemrana8/Aleem-Voice-Agent/actions/workflows/ci.yml/badge.svg)](https://github.com/aleemrana8/Aleem-Voice-Agent/actions/workflows/ci.yml)
[![Python 3.11](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)](https://python.org)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-000000?logo=next.js&logoColor=white)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?logo=mongodb&logoColor=white)](https://mongodb.com)
[![OpenAI GPT-4o](https://img.shields.io/badge/OpenAI-GPT--4o-412991?logo=openai&logoColor=white)](https://openai.com)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://docker.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Patients call → AI answers → Appointments booked — all hands-free.**

[Getting Started](#-quick-start) · [Features](#-features) · [Architecture](#-architecture) · [API Reference](#-api-reference) · [Contributing](#-contributing)

---

</div>

## 🎯 Purpose

**Aleem Voice Agent** eliminates the need for human receptionists in hospital front desks. When a patient calls the hospital number, an **AI receptionist powered by OpenAI GPT-4o** answers the call, verifies the patient's identity, checks doctor availability in real-time, and books/reschedules/cancels appointments — all through natural voice conversation.

The system provides a **real-time admin dashboard** where hospital staff can monitor live calls, view transcripts, manage schedules, and track every interaction.

## 🔭 Scope

| Area | Coverage |
|------|----------|
| **Voice Interaction** | Full-duplex voice calls with STT (Whisper) and TTS (Coqui) |
| **Appointment Management** | Book, reschedule, cancel with conflict detection |
| **Patient Management** | Registration, verification, medical history tracking |
| **Doctor Management** | Profiles, weekly schedules, real-time availability |
| **Call Analytics** | Full transcripts, call logs, intent classification |
| **Dashboard** | Real-time stats, WebSocket live updates, notifications |
| **Security** | JWT auth, RBAC (admin/doctor/staff), bcrypt passwords |
| **Deployment** | Docker Compose, CI/CD with GitHub Actions |

## 🌟 Goals

- 🏥 **Zero Wait Time** — Patients never wait on hold; AI answers instantly
- 🤖 **Intelligent Conversations** — GPT-4o with function calling for real database actions
- 📊 **Full Visibility** — Every call, transcript, and booking tracked on a live dashboard
- 🔐 **Enterprise Security** — JWT tokens, role-based access, encrypted passwords
- 🚀 **Production Ready** — Docker deployment, CI/CD pipeline, structured logging
- 📱 **Mobile Responsive** — Dashboard works on any device

---

## ✨ Features

### 🎙️ AI Voice Receptionist
> Patients call and speak naturally. The AI understands intent, asks follow-up questions, verifies identity, and performs real actions.

```
Patient: "I'd like to book an appointment with Dr. Sarah Ahmed"
   AI: "I'd be happy to help! Could you provide your phone number for verification?"
Patient: "It's +1234567890"
   AI: "Thank you. For security, could you confirm your date of birth?"
Patient: "May 15, 1990"
   AI: "You're verified! Dr. Sarah Ahmed is available tomorrow at 9:00, 9:30, 10:00, 
        10:30, and 11:00 AM. What time works best?"
Patient: "10 AM please, it's for a general checkup"
   AI: "Your appointment with Dr. Sarah Ahmed is confirmed for tomorrow at 10:00 AM 
        for a general checkup. Is there anything else I can help with?"
```

### 📅 Smart Appointment System
- **Book** — AI checks real-time slot availability before confirming
- **Reschedule** — Move appointments with conflict detection
- **Cancel** — Cancel with reason tracking and notifications
- **Availability Engine** — Generates slots from doctor weekly schedules, filters booked ones

### 📊 Real-Time Admin Dashboard
- Live statistics (patients, doctors, appointments, active calls)
- Appointment breakdown charts (scheduled/completed/cancelled)
- Recent appointments and calls feed
- **WebSocket-powered** — updates push to dashboard instantly when AI books appointments

### 📞 Call Logs & Transcripts
- Every AI call logged with duration, intent, outcome
- Full conversation transcripts (patient ↔ agent)
- Intent classification (booking, reschedule, cancel, inquiry)
- Call status tracking (in_progress, completed, failed)

### 🔔 Notification System
- Real-time notifications for new bookings, cancellations, reschedules
- Unread count badge in header
- Mark individual or bulk read
- Notification types: info, success, warning, error

### 👥 Patient & Doctor Management
- Patient registration with full profile (DOB, gender, emergency contact)
- Phone + DOB verification for security
- Doctor profiles with weekly schedule configuration
- Per-day time slots with configurable duration

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js 15)                   │
│  ┌───────────┬──────────────┬───────────┬─────────────────┐ │
│  │ Dashboard │ Appointments │ Patients  │  Voice Agent    │ │
│  │   Stats   │   Booking    │  Doctors  │  Call Logs      │ │
│  └───────────┴──────┬───────┴───────────┴─────────────────┘ │
│                     │  REST API + WebSocket                  │
├─────────────────────┼───────────────────────────────────────┤
│                     ▼       BACKEND (FastAPI)                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   API Routes  │  WebSocket Manager  │  JWT + RBAC    │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │   Voice Agent Service  │  LLM Service (GPT-4o)      │   │
│  │   Function Calling: verify, book, reschedule, cancel │   │
│  └──────────┬─────────────────┬─────────────────────────┘   │
├─────────────┼─────────────────┼─────────────────────────────┤
│             ▼                 ▼                              │
│  ┌──────────────────┐  ┌──────────────────────────────┐     │
│  │   MongoDB 7      │  │   LiveKit + Whisper + Coqui  │     │
│  │   Beanie ODM     │  │   (Voice Pipeline)           │     │
│  └──────────────────┘  └──────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Voice Call Flow

```
📞 Patient Calls Hospital
         │
         ▼
🎙️ LiveKit Room Created ──── Audio Captured
         │
         ▼
🗣️ Whisper.cpp (STT) ────── Speech → Text
         │
         ▼
🧠 OpenAI GPT-4o ─────────── Intent Detection + Function Calling
         │                         │
         │          ┌──────────────┼──────────────┐
         │          ▼              ▼              ▼
         │    verify_patient  book_appointment  check_availability
         │          │              │              │
         │          └──────────────┼──────────────┘
         │                         │
         ▼                         ▼
🔊 Coqui TTS ─────────────── Text → Speech → Patient Hears Response
         │
         ▼
💾 Saved: Transcript + Call Log + Notification
         │
         ▼
📊 Dashboard Updated via WebSocket (Real-time)
```

---

## 🛠️ Tech Stack

<div align="center">

| Layer | Technology | Purpose |
|-------|-----------|---------|
| 🖥️ **Frontend** | Next.js 15, React 19, TypeScript | Dashboard & UI |
| 🎨 **Styling** | Tailwind CSS, shadcn/ui, Lucide Icons | Modern responsive design |
| ⚡ **Backend** | FastAPI, Python 3.11, Uvicorn | Async API server |
| 🗄️ **Database** | MongoDB 7, Beanie ODM, Motor | Document storage |
| 🔐 **Auth** | JWT, bcrypt, RBAC | Security layer |
| 🧠 **LLM** | OpenAI GPT-4o with Function Calling | AI conversation engine |
| 🎙️ **Voice STT** | Whisper.cpp | Speech-to-text |
| 🔊 **Voice TTS** | Coqui TTS | Text-to-speech |
| 🎛️ **Voice Pipeline** | Pipecat AI, LiveKit | Real-time voice orchestration |
| 🔄 **Realtime** | WebSockets | Live dashboard updates |
| 🐳 **Deploy** | Docker Compose | Container orchestration |
| 🔁 **CI/CD** | GitHub Actions | Automated testing & linting |

</div>

---

## 📁 Project Structure

```
Aleem-Voice-Agent/
│
├── 🔧 .github/workflows/ci.yml    # CI/CD pipeline
├── 🐳 docker-compose.yml           # All services orchestration
├── 📋 .env.example                  # Environment template
│
├── ⚡ backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py                  # FastAPI entry + WebSocket + CORS
│       ├── core/
│       │   ├── config.py            # Settings (OpenAI, MongoDB, JWT)
│       │   ├── database.py          # MongoDB + Beanie initialization
│       │   ├── security.py          # JWT auth, password hashing, RBAC
│       │   └── logging.py           # Loguru structured logging
│       ├── models/                  # 7 MongoDB document models
│       │   ├── user.py              # User + auth schemas
│       │   ├── patient.py           # Patient + verification
│       │   ├── doctor.py            # Doctor + schedule
│       │   ├── appointment.py       # Appointment + status tracking
│       │   ├── call_log.py          # Call metadata
│       │   ├── transcript.py        # Conversation entries
│       │   └── notification.py      # Alert system
│       ├── routes/                  # 8 API route modules
│       │   ├── auth.py              # Login, register, profile
│       │   ├── patients.py          # CRUD + phone verification
│       │   ├── doctors.py           # CRUD + availability engine
│       │   ├── appointments.py      # Book / reschedule / cancel
│       │   ├── calls.py             # Call logs + transcripts
│       │   ├── notifications.py     # Read status management
│       │   ├── dashboard.py         # Stats + recent activity
│       │   └── voice.py             # Voice endpoints + WebSocket
│       └── services/                # Business logic
│           ├── llm_service.py       # GPT-4o + 7 function tools
│           ├── voice_agent.py       # Call orchestration engine
│           ├── websocket_manager.py # Real-time broadcast
│           └── livekit_service.py   # LiveKit token management
│
├── 🖥️ frontend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── app/
│       │   ├── layout.tsx           # Root layout
│       │   ├── globals.css          # Tailwind + shadcn theme
│       │   ├── login/page.tsx       # Authentication page
│       │   └── dashboard/
│       │       ├── layout.tsx       # Sidebar + header shell
│       │       ├── page.tsx         # Dashboard with live stats
│       │       ├── appointments/    # Appointment management
│       │       ├── patients/        # Patient registry
│       │       ├── doctors/         # Doctor schedules
│       │       ├── calls/           # Call logs + transcripts
│       │       ├── voice/           # Voice agent test UI
│       │       └── notifications/   # Notification center
│       ├── components/
│       │   ├── layout/              # Sidebar, Header
│       │   └── ui/                  # Button, Card, Input, Badge, Label
│       └── lib/
│           ├── api.ts               # Full API client (REST + WebSocket)
│           └── utils.ts             # Tailwind merge utility
│
└── 🗄️ docker/
    └── mongo-init.js                # DB seed (admin + 3 doctors)
```

---

## 🚀 Quick Start

### Prerequisites

- **Docker & Docker Compose** installed
- **OpenAI API Key** ([get one here](https://platform.openai.com/api-keys))

### 1. Clone

```bash
git clone https://github.com/aleemrana8/Aleem-Voice-Agent.git
cd Aleem-Voice-Agent
```

### 2. Configure

```bash
cp .env.example .env
# Edit .env → add your OPENAI_API_KEY
```

### 3. Launch

```bash
docker-compose up -d
```

### 4. Access

| Service | URL | Description |
|---------|-----|-------------|
| 🖥️ Dashboard | [http://localhost:3000](http://localhost:3000) | Admin frontend |
| ⚡ API | [http://localhost:8000](http://localhost:8000) | Backend server |
| 📚 API Docs | [http://localhost:8000/docs](http://localhost:8000/docs) | Swagger UI |
| 🗄️ MongoDB | `mongodb://localhost:27017` | Database |
| 🎙️ LiveKit | `ws://localhost:7880` | Voice server |

### 5. Login

| Field | Value |
|-------|-------|
| Email | `admin@aleemehr.com` |
| Password | `admin123` |

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/v1/auth/login` | User login (OAuth2 form) | Public |
| `POST` | `/api/v1/auth/register` | Register new user | Admin |
| `GET` | `/api/v1/auth/me` | Current user profile | Bearer |

### Patients
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/v1/patients/` | List patients (search, paginate) | Bearer |
| `POST` | `/api/v1/patients/` | Register new patient | Bearer |
| `GET` | `/api/v1/patients/{id}` | Get patient details | Bearer |
| `PUT` | `/api/v1/patients/{id}` | Update patient | Bearer |
| `POST` | `/api/v1/patients/verify` | Verify via phone + DOB | Public |

### Doctors
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/v1/doctors/` | List doctors (filter by specialty) | Bearer |
| `POST` | `/api/v1/doctors/` | Add new doctor | Admin |
| `PUT` | `/api/v1/doctors/{id}` | Update doctor / schedule | Admin |
| `POST` | `/api/v1/doctors/availability` | Check available slots | Public |

### Appointments
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/v1/appointments/` | List (filter: status, date, doctor) | Bearer |
| `POST` | `/api/v1/appointments/` | Book new appointment | Bearer |
| `PUT` | `/api/v1/appointments/{id}/reschedule` | Reschedule | Bearer |
| `PUT` | `/api/v1/appointments/{id}/cancel` | Cancel | Bearer |
| `GET` | `/api/v1/appointments/stats/summary` | Statistics | Bearer |

### Voice Agent
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/v1/voice/call/start` | Start voice call session | Public |
| `POST` | `/api/v1/voice/call/{id}/process` | Process speech text | Public |
| `POST` | `/api/v1/voice/call/{id}/end` | End call session | Public |
| `WS` | `/api/v1/voice/ws/call/{id}` | Real-time voice stream | — |

### Calls & Dashboard
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/v1/calls/` | List call logs | Bearer |
| `GET` | `/api/v1/calls/{id}/transcript` | Get full transcript | Bearer |
| `GET` | `/api/v1/dashboard/stats` | Dashboard statistics | Bearer |
| `WS` | `/ws/dashboard` | Real-time dashboard updates | — |

---

## 🗄️ MongoDB Collections

| Collection | Documents | Key Fields |
|------------|-----------|------------|
| `users` | Admin/staff accounts | email, role, hashed_password |
| `patients` | Patient records | patient_id, phone, DOB, verified |
| `doctors` | Doctor profiles | employee_id, specialization, schedule |
| `appointments` | All bookings | patient/doctor, date, time_slot, status |
| `call_logs` | Voice call metadata | call_id, duration, intent, outcome |
| `transcripts` | Conversation history | call_id, entries[speaker, text] |
| `notifications` | System alerts | title, type, read status |

---

## 🧠 AI Function Calling

The agent uses **OpenAI GPT-4o function calling** to perform real database operations during conversations:

| Function | Trigger | Action |
|----------|---------|--------|
| `verify_patient` | Patient provides phone + DOB | Checks DB, marks verified |
| `check_availability` | "Is Dr. X available on...?" | Generates slots, filters booked |
| `book_appointment` | "Book me at 10 AM" | Creates appointment + notification |
| `reschedule_appointment` | "Move my appointment to..." | Updates date/time, checks conflicts |
| `cancel_appointment` | "Cancel my appointment" | Sets status cancelled |
| `list_doctors` | "What doctors do you have?" | Queries by specialization |
| `get_patient_appointments` | "What are my appointments?" | Fetches active bookings |

---

## 🔁 CI/CD Pipeline

Every push and pull request triggers the **GitHub Actions pipeline**:

```
Push / PR → Lint Python (Ruff) → Type Check (Pyright) → Backend Tests
                                                              │
                                           Lint Frontend (ESLint) → Build Check (Next.js)
```

See [`.github/workflows/ci.yml`](.github/workflows/ci.yml) for the full configuration.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ by [Aleem Rana](https://github.com/aleemrana8)**

⭐ Star this repo if you find it useful!

</div>
