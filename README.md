# CareConnect

**A community donation and volunteer coordination platform connecting care homes, donors, volunteers, and administrators through structured and transparent workflows.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React_19-Frontend-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)

🚧 **Active Development**

---

## Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [How It Works](#how-it-works)
- [User Roles](#user-roles)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [API Overview](#api-overview)
- [Security](#security)
- [Database](#database)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [Project Status](#project-status)
- [Roadmap](#roadmap)
- [License](#license)
- [Author](#author)

---

## Overview

CareConnect bridges community care homes, donors, volunteers, and administrators. Traditional charitable efforts often encounter coordination challenges—such as supply mismatches where care homes receive surplus perishables while lacking winter clothing or educational supplies. CareConnect introduces structured item need requests, verified donation receipts, event volunteer drives, and administrative oversight to ensure end-to-end transparency and accountability.

---

## Key Features

### 🤝 Donations
- **Dual Pathways**: Supports monetary grants with presets and in-kind physical supplies.
- **Request Fulfillment**: Fulfill published care home item needs directly from need cards.
- **Auditable Receipts**: Automated generation of digital receipts (`REC-<id>-<hash>`) with printable views.
- **Contribution History**: Filter and review personal donation records and fulfillment statuses.

### 🏠 Care Home Management
- **Organization Profiles**: Public profiles with contact details, address, and verification state.
- **Verification Workflow**: Administrative review pipeline (`pending`, `verified`, `rejected`).
- **Itemized Needs**: Publish, edit, and close urgent supply requests with quantity tracking.
- **Impact Stories**: Share community milestones, narratives, and updates.

### 🙋 Volunteer Coordination
- **Volunteer Profiles**: Public profiles highlighting skills, availability, and service locations.
- **Event Scheduling**: Care homes publish workshops, mentorship sessions, and donation drives.
- **Sign-ups & Attendance**: Self-service event registration and real-time attendee tracking.

### 🔐 Security & Trust
- **Token Auth**: Stateless JWT authentication with secure session handling.
- **Role Isolation**: Strict permission boundaries for donor, volunteer, care home, and admin actions.
- **Ownership Guards**: Mutating actions verify resource ownership before database writes.
- **Community Integrity**: Safeguards against care home self-reviews and duplicate reviews.

### 📊 Administration
- **Platform Analytics**: Real-time metrics across users, homes, volunteers, and donations.
- **User Oversight**: Directory of registered accounts with role filtering.
- **Verification Queue**: Review and verify or reject care home applications.
- **Badges & Recognition**: Create and award milestone achievement badges.

---

## How It Works

```mermaid
flowchart LR
    A[Register] --> B[Discover Needs & Events]
    B --> C[Donate or Volunteer]
    C --> D[Generate Receipts]
    D --> E[Platform Transparency]
```

1. **Register**: Sign up with an initial role (`donor`, `volunteer`, or `both`).
2. **Discover**: Browse verified care homes, urgent supply requests, and upcoming events.
3. **Contribute**: Pledge monetary funds, donate physical goods, or register for volunteer drives.
4. **Audit**: Receive official digital receipts for completed donations.
5. **Oversee**: Administrators review organizations and monitor community activity.

---

## User Roles

| Role | Capabilities |
|---|---|
| **Donor** | Discover care homes, fulfill item requests, contribute funds or goods, view receipts, and post reviews. |
| **Volunteer** | Manage volunteer profile (skills, availability), browse community events, and register for sessions. |
| **Both** | Combines donor and volunteer capabilities; can donate, volunteer, and manage care home profiles. |
| **Admin** | Verify care homes, oversee user accounts, inspect platform metrics, and award badges. |

> **Note**: Care homes are modeled as an `Orphanage` entity linked to a user account (`volunteer`, `both`, or `admin`). Standalone `donor` accounts cannot create care home profiles.

---

## Architecture

```mermaid
flowchart TD
    A[React SPA] -->|Bearer JWT / JSON| B[FastAPI REST API]
    B --> C[Pydantic Validation]
    B --> D[Service Layer]
    D --> E[SQLAlchemy ORM]
    E --> F[(PostgreSQL)]
```

- **Frontend**: Single-page application built with React 19, Vite, and React Router with role guards.
- **API Layer**: FastAPI backend with async endpoints, dependency injection, and OpenAPI documentation.
- **Service Layer**: Dedicated business modules for auth, donations, receipts, and notifications.
- **Database**: PostgreSQL accessed through SQLAlchemy ORM models with foreign key constraints.

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 19, Vite, React Router | Component UI rendering, routing, and fast bundling |
| **Backend** | Python, FastAPI, Uvicorn | High-performance async REST API and ASGI server |
| **Database** | PostgreSQL | Relational persistence with transactional integrity |
| **ORM & Schemas** | SQLAlchemy, Pydantic | Object-relational mapping and request/response validation |
| **Security** | python-jose (JWT), bcrypt | Stateless bearer tokens and secure password hashing |
| **Icons** | Lucide React | Clean SVG iconography |

---

## Project Structure

```
CareConnect/
├── backend/
│   ├── app/
│   │   ├── api/routes/          # Domain routers (auth, donations, events, admin)
│   │   ├── core/                # Settings and security dependencies
│   │   ├── db/                  # Database engine and session management
│   │   ├── models/              # SQLAlchemy models (13 relational tables)
│   │   ├── schemas/             # Pydantic validation schemas
│   │   ├── services/            # Business logic (auth, donations, notifications)
│   │   └── main.py              # Application entrypoint and CORS configuration
│   ├── tests/                   # Automated pytest verification suite
│   ├── .env.example             # Backend environment template
│   └── requirements.txt         # Pinned Python dependencies
│
└── frontend/
    └── src/
        ├── api/                 # Centralized API client and service endpoints
        ├── components/          # Reusable UI controls, modals, and layouts
        ├── context/             # Auth and toast state providers
        ├── pages/               # Views for public, donor, volunteer, care home, and admin
        ├── App.jsx              # Main routing configuration and role guards
        └── index.css            # Design tokens and form styling
```

---

## API Overview

| Domain | Base Path | Key Capabilities |
|---|---|---|
| **Auth & Users** | `/auth`, `/users` | Registration, login, profile management, and badges |
| **Care Homes & Needs** | `/orphanages`, `/requests` | Directory, organization profiles, and item requests |
| **Donations & Receipts** | `/donations` | Donation processing, personal history, and audit receipts |
| **Volunteers & Events** | `/volunteers`, `/events` | Volunteer profiles, community drives, and event sign-ups |
| **Community** | `/reviews`, `/impact-stories` | Care home reviews, ratings, and impact stories |
| **Alerts & Recognition** | `/notifications`, `/badges` | Activity notifications and community badge management |
| **Administration** | `/admin` | Metrics dashboard, user moderation, and verification |
| **System** | `/`, `/health` | Application status and database health checks |

> **API Documentation**: Interactive Swagger UI is available at `http://127.0.0.1:8000/docs` when running the backend.

---

## Security

- **JWT Authentication**: Stateless tokens signed with HMAC-SHA256 (`HS256`) and configurable expiry.
- **Bcrypt Hashing**: Passwords hashed with unique salts and direct `bcrypt` verification (safe 72-byte boundary).
- **Role-Based Access Control**: Route dependencies enforce permissions across donor, volunteer, care home, and admin operations.
- **Ownership Verification**: Mutating endpoints verify record ownership prior to database commits.
- **Configured CORS**: Development CORS restricted to local frontend origins (`http://localhost:5173`, `http://127.0.0.1:5173`).
- **Input Validation**: Strict Pydantic models validate payloads, rejecting malformed requests with HTTP 422.

---

## Database

| Entity | Description |
|---|---|
| `User` | User accounts, credentials, normalized email, and role assignment |
| `Orphanage` | Care home profile, contact info, address, and verification status |
| `Volunteer` | Volunteer details, skills, availability, and location preference |
| `ItemRequest` | Care home supply requests with quantity and urgency level |
| `Donation`, `DonationReceipt` | Monetary/in-kind donation records and unique audit receipts (`REC-...`) |
| `Event`, `EventParticipation` | Community workshops, drives, and volunteer attendee registrations |
| `Review`, `ImpactStory` | Donor reviews, ratings, and published care home impact stories |
| `Notification`, `Badge`, `UserBadge` | System notifications, achievement definitions, and awarded badges |

---

## Quick Start

### Prerequisites
- **Git**, **Python 3.12+**, **Node.js 18+** with **npm**, and a running **PostgreSQL** instance.

### 1. Clone Repository
```bash
git clone https://github.com/VishakhaVB/CareConnect.git
cd CareConnect
```

### 2. Backend Setup
```bash
cd backend
python -m venv .venv

# Windows (PowerShell)
.\.venv\Scripts\Activate.ps1
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env

# Run server (requires PostgreSQL running)
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*Backend runs at `http://127.0.0.1:8000` (API Docs: `/docs`, Health: `/health`).*

### 3. Frontend Setup
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
*Frontend runs at `http://localhost:5173`.*

---

## Environment Variables

| Variable | Scope | Purpose | Example |
|---|---|---|---|
| `DATABASE_URL` | Backend | PostgreSQL connection URI | `postgresql+psycopg2://user:pass@localhost:5432/careconnect` |
| `SECRET_KEY` | Backend | Secret key for JWT signing | `<generate-random-secret>` |
| `ACCESS_TOKEN_EXPIRE_MINUTES`| Backend | JWT session lifetime (minutes) | `60` |
| `CORS_ORIGINS` | Backend | Allowed frontend origins | `http://localhost:5173,http://127.0.0.1:5173` |
| `VITE_API_URL` | Frontend | Backend API base URL | `http://127.0.0.1:8000` |

> Never commit `.env` files containing sensitive credentials to version control.

---

## Testing

### Backend Verification
Run the 26-point automated verification suite covering authentication, role isolation, ownership guards, and workflows:

```bash
cd backend
python tests/test_backend_smoke.py
```
**Verified Result**: 26/26 tests passing.

### Frontend Compilation
Verify production client bundling:

```bash
cd frontend
npm run build
```
**Verified Result**: Production build compiles cleanly with 0 errors.

---

## Project Status

🚧 **Active Development**

### Implemented
- Complete FastAPI backend with 13 relational entities, input validation, and role authorization.
- Complete React 19 frontend covering public directories, authenticated dashboards, donor flows, volunteer views, care home management, and admin moderation.
- Standardized form design system with validation, accessible controls, and responsive styling.
- 26-point automated verification test suite passing with 100% verification.

### In Progress
- Continuous user experience refinements across mobile breakpoints and tablet layouts.
- Additional automated test scenarios covering multi-step user interaction paths.

---

## Roadmap

- [ ] Payment gateway integration for automated monetary donation processing.
- [ ] Automated email and SMS notification delivery.
- [ ] Proximity- and skill-based volunteer matching algorithms.
- [ ] Regulatory document upload and storage for care home verification.
- [ ] Containerized Docker compose environment and CI/CD pipelines.

---

## License

This project is intended to be released under the **MIT License**. A formal `LICENSE` file is pending addition to the repository root.

---

## Author

**Vishakha Bhilwadkar**
- GitHub: [@VishakhaVB](https://github.com/VishakhaVB)
- Repository: [VishakhaVB/CareConnect](https://github.com/VishakhaVB/CareConnect)
