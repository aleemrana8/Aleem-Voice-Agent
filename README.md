<div align="center">

<img src="https://img.shields.io/badge/🏥-Aleem_Voice_Agent-0a0e1a?style=for-the-badge&labelColor=0a0e1a" alt="Aleem Voice Agent" />

# Aleem Voice Agent

### 🤖 AI-Powered Hospital Voice Receptionist & EHR System

<br/>

[![Python 3.14](https://img.shields.io/badge/Python-3.14-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.135-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![MongoDB 7](https://img.shields.io/badge/MongoDB-7.0-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io)
[![OpenAI GPT-4o](https://img.shields.io/badge/OpenAI-GPT--4o-412991?style=flat-square&logo=openai&logoColor=white)](https://openai.com)
[![LiveKit](https://img.shields.io/badge/LiveKit-Cloud-FF4785?style=flat-square&logo=webrtc&logoColor=white)](https://livekit.io)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docker.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

<br/>

```
Patient calls hospital  →  AI answers in real-time  →  Appointment booked — all hands-free
```

<br/>

[Features](#-features) · [Architecture](#-system-architecture) · [Quick Start](#-quick-start) · [Admin Panel](#-admin-panel) · [API Docs](#-api-reference) · [FSM Engine](#-24-state-fsm-voice-engine)

---

</div>

<br/>

## 🎯 Purpose

**Aleem Voice Agent** is a production-grade, AI-native healthcare platform that replaces human receptionists with an intelligent voice AI system. When patients call the hospital phone number, a **24-state Finite State Machine (FSM)** powered by **OpenAI GPT-4o** handles the entire conversation — from greeting and patient identification to appointment booking, rescheduling, and cancellation — through natural voice interaction.

The platform includes a full **Electronic Health Record (EHR)** system with an **athenahealth-inspired admin panel**, real-time dashboards, audit logging, and multi-branch support across **Islamabad** and **Multan** locations.

> **Not a chatbot.** This is a complete voice-first hospital management system with real SIP telephony, slot locking, concurrent call handling, and HIPAA-ready audit trails.

<br/>

## 🔭 Scope

| Domain | Coverage |
|--------|----------|
| 🎙️ **Voice AI** | LiveKit Cloud agent (GPT-4o + Deepgram STT + Cartesia TTS), SIP telephony, live web calls via WebRTC |
| 🏥 **Clinical** | Patient registry, doctor management, appointment scheduling, EHR sync |
| 📊 **Operations** | Real-time dashboards, analytics, audit trails, multi-branch management |
| 🌐 **Public Site** | 7 public pages (About, Doctors, Services, Contact, Appointment, Voice Call, FAQ) |
| 🔐 **Security** | JWT authentication, bcrypt passwords, RBAC, rate limiting, CORS |
| 🐳 **DevOps** | Docker Compose orchestration, CI/CD pipeline, Nginx reverse proxy |

---

## ✨ Features

### 🎙️ 24-State FSM Voice Receptionist

> Not a simple chatbot — a production-grade **Finite State Machine** that handles complex multi-turn medical conversations with slot locking, spelling confirmation, and go-back support.

```
Patient:  "I'd like to book an appointment"
   AI:    "I'd be happy to help! Are you an existing patient or a new patient?"
Patient:  "New patient"
   AI:    "Welcome! Could you tell me your first name?"
Patient:  "Muhammad"
   AI:    "And your last name?"
Patient:  "Aleem — that's A-L-E-E-M"
   AI:    "Let me confirm: A-L-E-E-M. Is that correct?"
Patient:  "Yes"
   AI:    "Thank you Muhammad Aleem! Which location — Islamabad or Multan?"
Patient:  "Islamabad"
   AI:    "We have Dr. Aleem and Dr. Mohsin available. Who would you prefer?"
Patient:  "Dr. Mohsin"
   AI:    "Dr. Mohsin has slots on May 10th at 3:00 PM, 3:30 PM, 4:00 PM, 
           4:30 PM, and 5:00 PM. What works best?"
Patient:  "3:30 PM"
   AI:    "Confirming: Dr. Mohsin, Islamabad, May 10th at 3:30 PM. Shall I book?"
Patient:  "Yes please"
   AI:    "Your appointment is confirmed! Appointment ID: APT-240510-001. 
           Is there anything else I can help with?"
```

**FSM States:**
```
greeting → identify_intent → ask_patient_type → collect_name → spell_name →
confirm_spelling → lookup_patient → collect_dob → collect_phone →
register_patient → choose_location → choose_provider → choose_date →
offer_slots → confirm_booking → booking_complete → find_appointment →
confirm_reschedule → confirm_cancel → general_info → escalate →
farewell → error_recovery → fallback
```

### 📅 Smart Scheduling Engine
- **Slot Locking** — 5-minute reservation with auto-expiry to prevent double booking
- **Real-time Availability** — Generates slots from doctor schedules, filters booked ones
- **Concurrent Safe** — Multiple AI calls can book simultaneously without conflicts
- **Multi-location** — Islamabad and Multan branches with doctor-location mapping
- **Hospital Hours** — 3:00 PM to Midnight, with 8-9 PM break, 30-minute slots

### 📊 Dual Dashboard System

**Dashboard** (`/dashboard`) — Operational staff view:
- Live KPI cards, appointment breakdown, recent activity
- WebSocket-powered real-time updates

**Admin Panel** (`/admin`) — Full administration suite:
- AI-powered insights banner with real-time metrics
- Doctor profiles with schedule visualization
- Voice Command Center with live call monitoring & transcripts
- Analytics with charts, trends, and branch comparison
- EHR sync logs, audit trails, system settings

### 🧠 AI & NLU Pipeline

```
📞 Phone Call / 🌐 Web Call → LiveKit Cloud Room
    ↓
🎙️ Deepgram Nova-3 STT (Speech → Text)
    ↓
🧠 GPT-4o (Conversational AI with function calling)
    ↓
🔊 Cartesia Sonic-3 TTS (Text → Speech)
    ↓
📞 Audio back to caller / browser
```

### 🔒 Security & Compliance
- JWT authentication with OAuth2 password flow
- bcrypt password hashing (Python 3.14 compatible)
- Full audit trail for every system operation
- Request ID middleware for tracing
- Rate limiting (120 req/min configurable)
- CORS whitelist enforcement

### 🎤 Live Web Voice Call (WebRTC)
- **Real-time browser-to-AI voice calls** via LiveKit Cloud + WebRTC
- One-click "Start Live Call" on `/voice-call` page — no phone needed
- `BarVisualizer` shows live agent audio waveform
- Real-time transcript panel with role labels (You / AI Assistant)
- Call timer, agent state display (Listening / Thinking / Speaking)
- Mic toggle, volume control, and hang-up button
- Public endpoint (`POST /api/v1/public/livekit/connect`) — no auth required

### 📞 SIP Telephony
- LiveKit SIP Trunk integration
- Inbound phone number: `+92 440-684-8838`
- Automatic room creation per call
- Call metadata logging (duration, intent, outcome)

### 🤖 LiveKit Cloud Voice Agent
- **Deployed agent**: `aleem-hospital-agent` on LiveKit Cloud (ap-south region)
- **LLM**: OpenAI GPT-4o — conversational hospital receptionist
- **STT**: Deepgram Nova-3 — real-time speech recognition
- **TTS**: Cartesia Sonic-3 — natural voice synthesis
- **VAD**: Silero — voice activity detection for turn-taking
- **Function tools**: `check_availability`, `book_appointment`, `get_doctors`
- Auto-joins rooms via LiveKit agent dispatch

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js 15)                        │
│  ┌─────────────────────────────┐  ┌────────────────────────────┐    │
│  │    Dashboard (/dashboard)   │  │   Admin Panel (/admin)     │    │
│  │  Stats · Appointments ·     │  │  Dashboard · Analytics ·   │    │
│  │  Patients · Doctors ·       │  │  Voice Center · Settings · │    │
│  │  Calls · Notifications      │  │  EHR · Audit · Doctors     │    │
│  └──────────────┬──────────────┘  └─────────────┬──────────────┘    │
│                 │           REST + WebSocket      │                   │
├─────────────────┼────────────────────────────────┼───────────────────┤
│                 ▼                                 ▼                   │
│                      BACKEND (FastAPI / Uvicorn)                     │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │  13 API Routers · 72+ Endpoints · JWT Auth · Rate Limiter   │    │
│  ├──────────────────────────────────────────────────────────────┤    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │    │
│  │  │  Workflow     │  │  Scheduling  │  │  Intent           │  │    │
│  │  │  Engine       │  │  Engine      │  │  Extractor        │  │    │
│  │  │  (24-state    │  │  (Slot lock, │  │  (GPT-4o NLU,    │  │    │
│  │  │   FSM)        │  │   reserve,   │  │   13 intents)    │  │    │
│  │  │              │  │   book)      │  │                   │  │    │
│  │  └──────┬───────┘  └──────┬───────┘  └────────┬──────────┘  │    │
│  │         └─────────────────┼───────────────────┘              │    │
│  │                           ▼                                   │    │
│  │  ┌──────────────────────────────────────────────────────┐    │    │
│  │  │  LiveKit Agent  (STT → NLU → FSM → TTS pipeline)    │    │    │
│  │  └──────────────────────────────────────────────────────┘    │    │
│  │                                                               │    │
│  │  Services: Audit · EHR Sync · WebSocket · Patient · Doctor   │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                 │                    │                    │           │
├─────────────────┼────────────────────┼────────────────────┼──────────┤
│                 ▼                    ▼                    ▼          │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐   │
│  │   MongoDB 7      │  │   Redis 7        │  │   LiveKit Cloud  │   │
│  │   Beanie ODM     │  │   Cache/Celery   │  │   SIP + WebRTC   │   │
│  │   10 collections │  │   3 databases    │  │   Whisper + TTS  │   │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

<div align="center">

| Layer | Technology | Purpose |
|:------|:-----------|:--------|
| 🖥️ **Frontend** | Next.js 15, React 19, TypeScript 5.6 | Server-side rendering, modern UI |
| 🎨 **UI/UX** | Tailwind CSS, shadcn/ui, Framer Motion, Lucide | Glass morphism dark theme, animations |
| ⚡ **Backend** | FastAPI, Python 3.14, Uvicorn, Pydantic v2 | Async API server with validation |
| 🗄️ **Database** | MongoDB 7, Beanie ODM, Motor async driver | Document storage with async queries |
| 📦 **Cache** | Redis 7, Celery | Caching, task queue, pub/sub |
| 🔐 **Auth** | JWT (python-jose), bcrypt, OAuth2 | Token-based authentication |
| 🧠 **AI/LLM** | OpenAI GPT-4o, temperature 0.1 | Intent extraction, entity recognition |
| 🔍 **Voice STT** | Deepgram Nova-3 | Real-time speech-to-text |
| 🔊 **Voice TTS** | Cartesia Sonic-3 | Natural text-to-speech |
| 🎛️ **Voice Pipeline** | LiveKit Agents SDK, LiveKit Cloud | Real-time voice orchestration |
| 📞 **Telephony** | LiveKit SIP Trunk | Inbound phone call handling |
| 🌐 **Web Voice** | @livekit/components-react, livekit-client | Browser-based WebRTC voice calls |
| 🔄 **Real-time** | WebSockets (FastAPI native) | Live dashboard updates |
| 🐳 **Infrastructure** | Docker Compose, Nginx | Container orchestration, reverse proxy |
| 🧪 **Testing** | pytest, pytest-asyncio, Ruff | Unit tests, async tests, linting |
| 🔁 **CI/CD** | GitHub Actions | Automated testing pipeline |

</div>

---

## 📸 Screenshots

<div align="center">

### Landing Page
> Modern hero section with animated features, statistics, and workflow steps

### Admin Dashboard
> AI-powered insights, KPI cards, appointment charts, doctor cards, and live activity feeds

### Voice Command Center
> Real-time AI call monitoring, FSM state visualization, intent distribution, and transcript viewer

### Patient Management
> Professional table view with search, registration form, and detail side panel

### Appointment Scheduling
> Status filters, real-time slot checking, inline reschedule with slot picker

### Analytics & Reports
> Monthly trends, weekday distribution, hourly heatmap, branch comparison, AI performance

</div>

---

## 📁 Project Structure

```
Aleem-Voice-Agent/
│
├── .github/workflows/ci.yml         # CI/CD pipeline
├── docker-compose.yml                # Full stack orchestration (7 services)
├── docker/
│   ├── mongo-init.js                 # Database initialization
│   └── nginx.conf                    # Reverse proxy config
│
├── backend/                          # Python FastAPI Backend
│   ├── Dockerfile
│   ├── requirements.txt              # 25+ production dependencies
│   ├── pyproject.toml                # Ruff linter config
│   └── app/
│       ├── main.py                   # FastAPI app + lifespan + 12 routers
│       ├── livekit_agent.py          # LiveKit voice agent worker
│       │
│       ├── core/
│       │   ├── config.py             # Settings (MongoDB, JWT, LiveKit, SIP)
│       │   ├── database.py           # MongoDB + Beanie async init
│       │   ├── security.py           # JWT + bcrypt + OAuth2
│       │   ├── logging.py            # Loguru structured logging
│       │   └── celery_app.py         # Celery task queue config
│       │
│       ├── models/                   # 10 Beanie document models
│       │   ├── user.py               # User authentication
│       │   ├── patient.py            # Patient records + verification
│       │   ├── doctor.py             # Doctor + DaySchedule + BreakTime
│       │   ├── appointment.py        # Appointment lifecycle tracking
│       │   ├── call_log.py           # Voice call metadata
│       │   ├── transcript.py         # Conversation entries
│       │   ├── notification.py       # System alerts
│       │   ├── audit_log.py          # Audit trail records
│       │   ├── ehr_sync.py           # EHR synchronization logs
│       │   └── enums.py              # Shared enums (roles, statuses)
│       │
│       ├── routes/                   # 13 API router modules (72+ endpoints)
│       │   ├── auth.py               # Login, register, profile
│       │   ├── patients.py           # CRUD + phone verification
│       │   ├── doctors.py            # CRUD + availability engine
│       │   ├── appointments.py       # Book / reschedule / cancel
│       │   ├── calls.py              # Call logs + transcripts
│       │   ├── notifications.py      # Notification management
│       │   ├── dashboard.py          # Stats + recent activity
│       │   ├── voice.py              # Voice + LiveKit endpoints
│       │   ├── schedules.py          # Doctor schedule management
│       │   ├── ehr.py                # EHR sync endpoints
│       │   ├── audit.py              # Audit log queries
│       │   ├── workflow.py           # FSM workflow endpoints
│       │   └── public.py             # Public API (no auth) + LiveKit connect
│       │
│       ├── services/                 # Business logic layer
│       │   ├── workflow_engine.py    # ★ 24-state FSM conversation engine
│       │   ├── scheduling_engine.py  # ★ Slot locking + appointment ops
│       │   ├── intent_extractor.py   # ★ GPT-4o NLU (13 intents)
│       │   ├── appointment_service.py# Appointment CRUD + EHR sync
│       │   ├── doctor_service.py     # Doctor queries + availability
│       │   ├── patient_service.py    # Patient CRUD + verification
│       │   ├── audit_service.py      # Audit trail logging
│       │   ├── ehr_service.py        # EHR sync operations
│       │   ├── websocket_manager.py  # Real-time broadcast manager
│       │   ├── livekit_service.py    # LiveKit token management
│       │   ├── llm_service.py        # OpenAI API wrapper
│       │   ├── schedule_service.py   # Schedule CRUD
│       │   └── voice_agent.py        # Voice call orchestration
│       │
│       ├── schemas/                  # Pydantic request/response models
│       ├── middleware/               # Request ID, rate limiter, errors
│       ├── tasks/                    # Celery async tasks
│       ├── utils/                    # Helpers, validators, constants
│       ├── scripts/                  # Seed scripts (doctors, SIP)
│       └── tests/                    # pytest test suite
│
├── frontend/                         # Next.js 15 Frontend
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── app/
│       │   ├── layout.tsx            # Root layout
│       │   ├── page.tsx              # Landing page (hero + features)
│       │   ├── globals.css           # Tailwind + glass morphism theme
│       │   ├── login/page.tsx        # Authentication page
│       │   ├── about/page.tsx        # Hospital about page
│       │   ├── doctors/page.tsx      # Public doctor profiles
│       │   ├── services/page.tsx     # Hospital services
│       │   ├── contact/page.tsx      # Contact information
│       │   ├── appointment/page.tsx  # Public appointment booking
│       │   ├── voice-call/page.tsx   # ★ Live AI voice call (WebRTC)
│       │   ├── faq/page.tsx          # Frequently asked questions
│       │   │
│       │   ├── dashboard/            # Staff Dashboard
│       │   │   ├── layout.tsx        # Sidebar + header shell
│       │   │   ├── page.tsx          # Live stats + recent activity
│       │   │   ├── appointments/     # Appointment management
│       │   │   ├── patients/         # Patient registry
│       │   │   ├── doctors/          # Doctor schedules
│       │   │   ├── calls/            # Call logs + transcripts
│       │   │   ├── voice/            # Voice agent test UI
│       │   │   └── notifications/    # Notification center
│       │   │
│       │   └── admin/                # ★ Admin Panel (athenahealth-inspired)
│       │       ├── layout.tsx        # Admin layout + auth guard
│       │       ├── page.tsx          # Rich dashboard (KPIs, charts, insights)
│       │       ├── patients/         # Patient management + detail panel
│       │       ├── appointments/     # Booking + reschedule + slot picker
│       │       ├── doctors/          # Profile cards + schedule view
│       │       ├── voice-center/     # AI call monitor + transcripts
│       │       ├── analytics/        # Charts, trends, AI performance
│       │       ├── ehr-records/      # EHR sync log viewer
│       │       ├── audit-logs/       # Timeline audit trail
│       │       └── settings/         # Tabbed system configuration
│       │
│       ├── components/
│       │   ├── admin/                # AdminSidebar, AdminHeader
│       │   ├── layout/              # Sidebar, Header
│       │   └── ui/                  # shadcn: Button, Card, Input, Badge, Label
│       │
│       └── lib/
│           ├── api.ts               # Full API client (250+ lines)
│           ├── types.ts             # TypeScript interfaces
│           └── utils.ts             # cn() utility
│
├── aleem-voice-agent/                # ★ LiveKit Cloud Voice Agent
│   ├── src/
│   │   └── agent.py                  # GPT-4o agent (Deepgram STT + Cartesia TTS)
│   ├── livekit.toml                  # Agent deployment config
│   ├── pyproject.toml                # Python dependencies (uv)
│   ├── Dockerfile                    # Cloud deployment image
│   └── tests/                        # Agent tests
│
└── LICENSE                          # MIT License
```

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version | Required |
|------|---------|----------|
| Docker + Docker Compose | 20+ | ✅ |
| OpenAI API Key | — | ✅ |
| Node.js | 18+ | For local frontend dev |
| Python | 3.11+ | For local backend dev |

### 1. Clone

```bash
git clone https://github.com/aleemrana8/Aleem-Voice-Agent.git
cd Aleem-Voice-Agent
```

### 2. Configure

```bash
cp .env.example .env
```

Edit `.env` and add your keys:
```env
OPENAI_API_KEY=sk-your-key-here
LIVEKIT_API_KEY=your-livekit-key
LIVEKIT_API_SECRET=your-livekit-secret
```

### 3. Launch (Docker)

```bash
docker-compose up -d
```

### 4. Launch (Local Development)

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### 5. Access

| Service | URL |
|---------|-----|
| 🖥️ Landing Page | [http://localhost:3000](http://localhost:3000) |
| 🎤 Live Voice Call | [http://localhost:3000/voice-call](http://localhost:3000/voice-call) |
| 📊 Staff Dashboard | [http://localhost:3000/dashboard](http://localhost:3000/dashboard) |
| 🏥 Admin Panel | [http://localhost:3000/admin](http://localhost:3000/admin) |
| ⚡ API Server | [http://localhost:8000](http://localhost:8000) |
| 📚 Swagger Docs | [http://localhost:8000/docs](http://localhost:8000/docs) |
| 📘 ReDoc | [http://localhost:8000/redoc](http://localhost:8000/redoc) |

### 6. Login

| Field | Value |
|-------|-------|
| Username | `aleemehr` |
| Password | `aleem811` |

---

## 🖥️ Admin Panel

The admin panel at `/admin` is an **athenahealth-inspired** healthcare administration interface with a dark glass-morphism theme:

| Page | Key Features |
|------|-------------|
| **Dashboard** | 6 KPI cards, AI insight banner, animated activity chart, appointment donut, doctor cards, recent activity |
| **Patients** | Stats banner, registration form, searchable table, side detail panel with appointment history |
| **Appointments** | Status filter pills, booking form with real-time slot checking, inline reschedule with slot picker |
| **Doctors** | Profile cards with gradient banners, location badges, full daily schedule visualization |
| **Voice Center** | FSM pipeline banner, intent distribution, call history with live indicators, transcript viewer |
| **Analytics** | Monthly trends, weekday distribution, hourly heatmap, branch comparison, AI performance metrics |
| **EHR Records** | Sync statistics, status filters, sync log timeline with type icons |
| **Audit Logs** | Timeline with action-based icons/colors, expandable JSON details, search + filter |
| **Settings** | 4 tabs: General (hospital, branches, schedule), Notifications (5 channels), Security, Integrations |

---

## ⚙️ 24-State FSM Voice Engine

The heart of the system — a deterministic conversation engine:

```
                          ┌──────────┐
                          │ GREETING │
                          └────┬─────┘
                               │
                      ┌────────▼────────┐
                      │ IDENTIFY_INTENT │
                      └────┬───┬───┬────┘
              ┌────────────┘   │   └────────────┐
              ▼                ▼                  ▼
     ┌──────────────┐  ┌─────────────┐  ┌──────────────┐
     │  BOOK FLOW   │  │ RESCHEDULE  │  │ CANCEL FLOW  │
     └──────┬───────┘  └──────┬──────┘  └──────┬───────┘
            │                  │                 │
   ┌────────▼────────┐        │        ┌────────▼────────┐
   │ ASK_PATIENT_TYPE │        │        │ FIND_APPOINTMENT │
   └────────┬────────┘        │        └────────┬────────┘
            │                  │                 │
  ┌─────────▼──────────┐      │      ┌──────────▼──────────┐
  │   COLLECT_NAME     │      │      │  CONFIRM_CANCEL     │
  │   SPELL_NAME       │      │      └─────────────────────┘
  │   CONFIRM_SPELLING │      │
  └────────┬───────────┘      │
           │                   │
  ┌────────▼────────┐  ┌──────▼──────────┐
  │ LOOKUP_PATIENT  │  │ CONFIRM_         │
  │ (or REGISTER)   │  │ RESCHEDULE       │
  └────────┬────────┘  └─────────────────┘
           │
  ┌────────▼────────┐
  │ CHOOSE_LOCATION │
  │ CHOOSE_PROVIDER │
  │ CHOOSE_DATE     │
  │ OFFER_SLOTS     │
  └────────┬────────┘
           │
  ┌────────▼──────────┐
  │ CONFIRM_BOOKING   │
  └────────┬──────────┘
           │
  ┌────────▼──────────┐         ┌──────────────────────────────┐
  │ BOOKING_COMPLETE  │────────▶│ FAREWELL                     │
  └───────────────────┘         └──────────────────────────────┘
  
  Error States: error_recovery · fallback · escalate (after 3 failures)
```

**13 Recognized Intents:**

`book_appointment` · `reschedule_appointment` · `cancel_appointment` · `check_availability` · `general_info` · `yes` · `no` · `provide_info` · `change_selection` · `go_back` · `repeat` · `escalate` · `farewell`

---

## 📡 API Reference

> **72+ endpoints** across 13 routers. Full interactive docs at `/docs` (Swagger) and `/redoc`.

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/login` | OAuth2 password login → JWT token |
| `GET` | `/api/v1/auth/me` | Get current user profile |

### Patients
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/patients/` | List patients (search, paginate) |
| `POST` | `/api/v1/patients/` | Register new patient |
| `GET` | `/api/v1/patients/{id}` | Get patient details |
| `PUT` | `/api/v1/patients/{id}` | Update patient |
| `POST` | `/api/v1/patients/verify` | Verify via phone + DOB |

### Doctors
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/doctors/` | List all doctors |
| `POST` | `/api/v1/doctors/` | Add new doctor |
| `PUT` | `/api/v1/doctors/{id}` | Update doctor + schedule |
| `POST` | `/api/v1/doctors/availability` | Check available slots |

### Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/appointments/` | List (filter: status, date, doctor) |
| `POST` | `/api/v1/appointments/` | Book new appointment |
| `GET` | `/api/v1/appointments/{id}` | Get appointment details |
| `PUT` | `/api/v1/appointments/{id}/reschedule` | Reschedule appointment |
| `PUT` | `/api/v1/appointments/{id}/cancel` | Cancel appointment |
| `GET` | `/api/v1/appointments/stats/summary` | Appointment statistics |

### Calls & Voice
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/calls/` | List call logs |
| `GET` | `/api/v1/calls/{id}` | Get call details |
| `GET` | `/api/v1/calls/{id}/transcript` | Get full transcript |
| `GET` | `/api/v1/calls/stats` | Call statistics |
| `POST` | `/api/v1/voice/livekit/connect` | Get LiveKit room token (auth required) |
| `WS` | `/ws/dashboard` | Real-time dashboard events |
| `WS` | `/ws/calls` | Real-time call events |

### Public API (No Auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/public/doctors` | List doctors (public) |
| `GET` | `/api/v1/public/doctors/{id}/availability` | Doctor availability |
| `POST` | `/api/v1/public/appointments` | Book appointment (public) |
| `POST` | `/api/v1/public/livekit/connect` | Get LiveKit token for web voice call |
| `GET` | `/api/v1/public/services` | Hospital services |
| `GET` | `/api/v1/public/faq` | FAQ items |

### Dashboard & Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/dashboard/stats` | Dashboard KPIs |
| `GET` | `/api/v1/dashboard/recent-appointments` | Recent appointments |
| `GET` | `/api/v1/dashboard/recent-calls` | Recent calls |
| `GET` | `/api/v1/audit/logs` | Audit trail |
| `GET` | `/api/v1/ehr/sync-logs` | EHR sync history |
| `GET` | `/api/v1/workflow/sessions` | Active FSM sessions |

---

## 🗄️ Database Schema

```
MongoDB: aleem_ehr
│
├── users              # Admin/staff accounts (username, role, JWT)
├── patients           # Patient records (patient_id, phone, DOB, verified)
├── doctors            # Doctor profiles (employee_id, locations[], schedule{})
├── appointments       # Bookings (patient/doctor, date, time_slot, status)
├── call_logs          # Voice call metadata (duration, intent, outcome)
├── transcripts        # Conversation history (role, content, timestamp)
├── notifications      # System alerts (type, title, read status)
├── audit_logs         # Full audit trail (action, user, resource, details)
├── ehr_syncs          # EHR sync records (type, entity, status)
└── workflow_sessions  # FSM session state (current_state, context)
```

---

## 🏥 Hospital Configuration

| Setting | Value |
|---------|-------|
| **Operating Hours** | 3:00 PM — 12:00 AM (Midnight) |
| **Break Time** | 8:00 PM — 9:00 PM |
| **Slot Duration** | 30 minutes |
| **Slots per Day** | 16 available (18 total minus break) |
| **Branches** | Islamabad, Multan |
| **Phone (SIP)** | 4406848838 |

### Doctors

| ID | Name | Specialization | Locations |
|----|------|---------------|-----------|
| DOC001 | Dr. Aleem | General Medicine | Islamabad, Multan |
| DOC002 | Dr. Mohsin | General Medicine | Islamabad |
| DOC003 | Dr. Zain | General Medicine | Multan |

---

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key | Required |
| `MONGO_URI` | MongoDB connection string | `mongodb://admin:aleemehr2024@localhost:27017/...` |
| `MONGO_DB_NAME` | Database name | `aleem_ehr` |
| `JWT_SECRET` | JWT signing secret | `change-me-in-production` |
| `LIVEKIT_URL` | LiveKit server URL | `wss://...livekit.cloud` |
| `LIVEKIT_API_KEY` | LiveKit API key | Required for voice |
| `LIVEKIT_API_SECRET` | LiveKit API secret | Required for voice |
| `REDIS_URL` | Redis connection | `redis://localhost:6379/0` |
| `ADMIN_USERNAME` | Default admin user | `aleemehr` |
| `ADMIN_PASSWORD` | Default admin password | `aleem811` |

---

## 🐳 Docker Services

```yaml
services:
  mongodb:     # MongoDB 7 — Primary database (port 27017)
  redis:       # Redis 7 — Cache + Celery broker (port 6379)
  backend:     # FastAPI — API server (port 8000)
  voice-agent: # LiveKit — Voice AI worker
  celery:      # Celery — Async task worker
  frontend:    # Next.js — Web UI (port 3000)
  nginx:       # Nginx — Reverse proxy (port 80)
```

---

## 🧪 Testing

```bash
cd backend
pytest tests/ -v
```

---

## 🔁 CI/CD Pipeline

```
Push/PR → Lint (Ruff) → Type Check → Backend Tests → Frontend Build → ✅
```

See [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

<br/>

**Built with 💙 by [Aleem Rana](https://github.com/aleemrana8)**

<br/>

<sub>AI-Native Healthcare Platform · 24-State FSM Voice Engine · Full EHR System · athenahealth-Inspired Admin Panel</sub>

<br/>

[![GitHub stars](https://img.shields.io/github/stars/aleemrana8/Aleem-Voice-Agent?style=social)](https://github.com/aleemrana8/Aleem-Voice-Agent)
[![GitHub forks](https://img.shields.io/github/forks/aleemrana8/Aleem-Voice-Agent?style=social)](https://github.com/aleemrana8/Aleem-Voice-Agent/fork)

</div>
