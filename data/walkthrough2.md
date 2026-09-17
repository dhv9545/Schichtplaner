# AI-Assisted SME Shift Planner — Prototype Walkthrough

We have successfully built and verified the complete full-stack **AI-Assisted SME Shift Planner** prototype. The solution provides automated conflict detection, weekly scheduling board visualization, and AI-assisted shift auto-resolution respecting employee roles, availability, and statutory hours.

---

## 📸 Visual Walkthrough & Demo Flow

````carousel
![Initial Weekly Schedule Board with Conflict Card](/C:/Users/variy/.gemini/antigravity-ide/brain/a2112b1b-7a27-4664-a059-ad431042de3e/01_initial_ui_1789631688944.png)
<!-- slide -->
![AI Auto-Resolution Modal with Workload Reasoning](/C:/Users/variy/.gemini/antigravity-ide/brain/a2112b1b-7a27-4664-a059-ad431042de3e/02_auto_resolve_modal_1789631705286.png)
<!-- slide -->
![Shift Reassigned Successfully to Sarah Miller](/C:/Users/variy/.gemini/antigravity-ide/brain/a2112b1b-7a27-4664-a059-ad431042de3e/03_reassigned_success_1789631718191.png)
<!-- slide -->
![Simulate Staff Sick Call Modal](/C:/Users/variy/.gemini/antigravity-ide/brain/a2112b1b-7a27-4664-a059-ad431042de3e/04_simulate_sick_modal_1789631733658.png)
<!-- slide -->
![New Conflict Card Detected in Real-time](/C:/Users/variy/.gemini/antigravity-ide/brain/a2112b1b-7a27-4664-a059-ad431042de3e/05_new_conflict_created_1789631850723.png)
<!-- slide -->
![Second AI Resolution with Candidate Breakdown](/C:/Users/variy/.gemini/antigravity-ide/brain/a2112b1b-7a27-4664-a059-ad431042de3e/06_autoresolve_drawer_1789631865464.png)
<!-- slide -->
![Second Shift Resolved and Reassigned](/C:/Users/variy/.gemini/antigravity-ide/brain/a2112b1b-7a27-4664-a059-ad431042de3e/07_conflict_resolved_1789631985794.png)
<!-- slide -->
![Staff Capacity and Target Hours Quotas Drawer](/C:/Users/variy/.gemini/antigravity-ide/brain/a2112b1b-7a27-4664-a059-ad431042de3e/08_updated_quotas_1789632003292.png)
````

---

## 🛠️ Architecture & Implemented Deliverables

### Phase 1: Database Schema & Seed Data (Prisma + SQLite)
- **Schema** ([schema.prisma](file:///d:/interview/appbude/Schichtplaner/server/prisma/schema.prisma)):
  - `Employee`: `id`, `name`, `role`, `maxWeeklyHours` (default 40), `targetHours` (default 30), `currentHours`, with relations to `Shift` and `Absence`.
  - `Shift`: `id`, `date`, `startTime`, `endTime`, `requiredRole`, `status` (`ASSIGNED`, `OPEN`, `CONFLICT`), `assignedEmployeeId`.
  - `Absence`: `id`, `date`, `reason` (`SICK`, `VACATION`), `employeeId`.
- **Seed Script** ([seedService.ts](file:///d:/interview/appbude/Schichtplaner/server/src/services/seedService.ts)):
  - Dynamically anchors dates to the current active week (Monday to Sunday).
  - 6 employees across Service, Kitchen, and Bar roles.
  - 10 shifts scheduled across the week.
  - Initial `CONFLICT` shift on Thursday (Marcus Chen reported sick) ready for instant live demonstration.

### Phase 2: Express REST API (`server/`)
- Express + TypeScript + CORS + Prisma Client:
  1. `GET /api/schedule?startDate=YYYY-MM-DD`: 7-day schedule window with shift assignments and daily absence records.
  2. `GET /api/employees`: Synchronized employee workload hours and capacity.
  3. `PATCH /api/shifts/:id/assign`: Reassigns shift to target employee and updates shift status to `ASSIGNED`.
  4. `POST /api/absences/report-sick`: Records sick leave and automatically marks all employee shifts on that date as `CONFLICT`.
  5. `POST /api/ai/auto-resolve`: Multi-factor AI evaluation engine ([aiResolver.ts](file:///d:/interview/appbude/Schichtplaner/server/src/services/aiResolver.ts)) checking:
     - Strict role qualification match.
     - Absence exclusion on date.
     - Schedule time overlap exclusion.
     - Statutory weekly max hours constraint (`currentHours + duration <= maxWeeklyHours`).
     - Fair workload distribution ranking (furthest below `targetHours`).
     - Returns transparent human-readable reasoning and candidate evaluation breakdown.
  6. `POST /api/demo/reset`: Instant demo reset button to restore initial test state.

### Phase 3: Modern React Frontend (`client/`)
- Responsive SPA built with React 18, Vite, TypeScript, Tailwind CSS, and Lucide icons:
  - **Header**: Week navigation (`<`, Today, `>`), live conflict counter with pulsing alert, and "Simulate Sick Call" demo trigger.
  - **Weekly Shift Board**: 7-column Monday-to-Sunday grid with daily scheduled hours headers and "Today" marker.
  - **Shift Cards**: Color-coded role badges (Service = cyan, Kitchen = orange, Bar = purple), status tags, and glowing red border with **"✨ Auto-Resolve with AI"** button for conflicted shifts.
  - **AI Resolution Modal**: Animated multi-step evaluation progress, top candidate recommendation card, projected hour quota progress bar, natural-language reasoning explanation, candidate matrix, and **"Confirm & Reassign"** button.
  - **Simulate Sick Call Modal**: Live demo trigger allowing any employee to be reported sick on any day.
  - **Staff Quotas Drawer**: Sidebar showing weekly capacity, utilization bars, and target deficits for all staff.

---

## 🚀 Execution & Verification Guide

### Quick Start Commands

From the project root:

```bash
# 1. Install all dependencies (root, server, and client)
npm run install:all

# 2. Push schema to SQLite database and seed test data
npm run db:setup

# 3. Launch both backend (port 5000) and frontend (port 5173) concurrently
npm run dev
```

### Direct URLs:
- **Frontend Web App:** [http://localhost:5173](http://localhost:5173)
- **Backend Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Backend Schedule API:** [http://localhost:5000/api/schedule](http://localhost:5000/api/schedule)

### Automated Test Verification:
Run the comprehensive test script to verify all REST endpoints:
```bash
node test_api.js
```
Expected output:
```
GET /api/schedule -> 200 OK. Total shifts: 10
Found Conflict Shift: f17e77d6-... 2026-09-17 Service
POST /api/ai/auto-resolve -> 200 OK.
Recommended Employee: Sarah Miller
Reasoning: Recommended Sarah Miller for the Service shift (11:00-19:00, 8h)...
Eligible Count: 1
PATCH /api/shifts/:id/assign -> 200 OK. Status: ASSIGNED
POST /api/absences/report-sick -> 200 OK.
POST /api/demo/reset -> 200 OK.
All API tests passed cleanly!
```
