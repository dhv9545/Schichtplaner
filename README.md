# 🗓️ ShiftAI Planner — AI-Assisted SME Shift Management

An automated, full-stack shift management prototype for small and medium-sized enterprises (restaurants, retail shops, medical clinics). Features real-time conflict detection, weekly scheduling board visualization, and an **AI Auto-Resolve** engine that evaluates staff roles, availability, and statutory weekly hour quotas.

---

## ✨ Key Features

- 📅 **7-Day Weekly Shift Board:** Modern, responsive calendar view (Monday to Sunday) with scheduled daily hours totals and role badges.
- 🚨 **Real-Time Conflict Detection:** Automatically flags shifts when an employee reports sick or has overlapping commitments.
- 🤖 **AI Auto-Resolution Engine:**
  - Strict role qualification filtering (`Service`, `Kitchen`, `Bar`).
  - Automatic absence & overlap collision prevention.
  - Statutory weekly working hours enforcement (`maxWeeklyHours`).
  - Workload balance ranking (prioritizes candidates furthest below their `targetHours`).
  - Clear, human-readable natural-language decision reasoning.
- ⚡ **Interactive Demo Controls:**
  - **"Simulate Sick Call"** button to trigger conflicts live during presentations.
  - **"Staff Capacity"** drawer displaying live weekly quotas and utilization bars.
  - **"Reset Demo Data"** button to reset SQLite state on demand.

---

## 🛠️ Technology Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Lucide-React.
- **Backend:** Node.js, Express, TypeScript, Prisma ORM.
- **Database:** SQLite (file-based, zero setup required).
- **Tooling:** Concurrently for unified developer experience.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or newer)
- npm (v9 or newer)

### Quick Start (Single Command)

```bash
# 1. Install all dependencies (root, backend server, and frontend client)
npm run install:all

# 2. Push Prisma schema & seed SQLite database
npm run db:setup

# 3. Start both backend (port 5000) and frontend (port 5173) concurrently
npm run dev
```

Visit **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 📂 Project Structure

```
Schichtplaner/
├── client/                     # Frontend SPA (React + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/         # ShiftBoard, ShiftCard, AIResolveModal, etc.
│   │   ├── services/           # REST API client
│   │   ├── utils/              # Date calculations & formatting
│   │   └── types/              # Shared TypeScript definitions
│   └── package.json
├── server/                     # Backend API (Express + Prisma + SQLite)
│   ├── prisma/
│   │   ├── schema.prisma       # Employee, Shift, and Absence models
│   │   └── seed.ts             # Dynamic current-week test seed
│   ├── src/
│   │   ├── routes/             # Schedule, Employees, Shifts, Absences, AI
│   │   ├── services/           # AI Auto-Resolve agent logic
│   │   └── utils/              # Hours calculation & overlap detection
│   └── package.json
├── package.json                # Root orchestration & convenience scripts
└── README.md
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/schedule?startDate=YYYY-MM-DD` | Returns 7-day schedule with shifts & absences |
| `GET` | `/api/employees` | Returns staff roster with synchronized weekly hours |
| `PATCH` | `/api/shifts/:id/assign` | Assigns an employee to a shift (`ASSIGNED`) |
| `POST` | `/api/absences/report-sick` | Records sick leave and marks shift as `CONFLICT` |
| `POST` | `/api/ai/auto-resolve` | Evaluates eligible staff and returns top AI match |
| `POST` | `/api/demo/reset` | Resets SQLite database to initial demo state |

---

## 🧪 Testing

Run the automated endpoint test suite:
```bash
node test_api.js
```
