# Implementation Plan: AI-Assisted SME Shift Planner

An automated, full-stack shift management prototype for small and medium-sized enterprises (restaurants, retail, medical practices) featuring real-time conflict detection and AI-assisted shift auto-resolution.

## User Review Required

> [!IMPORTANT]
> - **Database**: SQLite via Prisma ORM for file-based setup with zero external database dependencies.
> - **AI Auto-Resolve Engine**: Built with a dedicated evaluation agent service in Express that calculates role eligibility, statutory limits (`maxWeeklyHours`), absence collisions, shift overlaps, and prioritizes fair workload distribution (furthest below `targetHours`). The endpoint also provides clean, transparent natural-language reasoning.
> - **Dynamic Dates**: Seed data and schedule queries will default to the current active week (anchored dynamically to the current date) so the conflict shift and AI resolution can be tested immediately upon launch.

---

## Proposed Architecture & Changes

### 1. Root Workspace & Coordination
We will initialize the project root with a unified `package.json` that orchestrates both `client/` and `server/` via `concurrently`, providing seamless one-command setup and launch:
- `npm run install:all`: Installs root, server, and client dependencies.
- `npm run db:setup`: Generates Prisma client, applies schema migrations, and seeds test data.
- `npm run dev`: Boots both backend (port 5000) and frontend (port 5173) concurrently.

---

### 2. Backend (`server/`)
Express with TypeScript, Prisma, SQLite, and CORS.

#### Schema (`server/prisma/schema.prisma`):
- `Employee`: `id`, `name`, `role` (Service, Kitchen, Bar), `maxWeeklyHours` (default 40), `targetHours` (default 30), `currentHours` (Int, calculated/stored), relations to `Shift` and `Absence`.
- `Shift`: `id`, `date` (YYYY-MM-DD), `startTime`, `endTime`, `requiredRole`, `status` (`ASSIGNED`, `OPEN`, `CONFLICT`), `assignedEmployeeId` (optional relation).
- `Absence`: `id`, `date`, `reason` (`SICK`, `VACATION`), `employeeId` (relation).

#### Seed Script (`server/prisma/seed.ts`):
- 6 diverse employees across Service, Kitchen, and Bar (e.g., Sarah Miller, Marcus Chen, Elena Rostova, David Kim, Lisa Becker, Tom Wright).
- 10 realistic shifts scheduled across the current week.
- At least 1 shift explicitly flagged as `CONFLICT` with an absent employee (reported sick), ready for live AI auto-resolution.
- Calculated and synced weekly hours for all employees.

#### API Endpoints (`server/src/routes/`):
- `GET /api/schedule?startDate=YYYY-MM-DD`: Fetches 7-day schedule with shift details, assigned employees, and absences.
- `GET /api/employees`: Returns all employees with updated weekly hours and target quotas.
- `PATCH /api/shifts/:id/assign`: Assigns/replaces an employee to a shift and updates status to `ASSIGNED`.
- `POST /api/absences/report-sick`: Records a sick leave and flips overlapping shifts on that date to `CONFLICT`.
- `POST /api/ai/auto-resolve`: Evaluates candidate employees against the conflicted shift:
  - Role requirement check.
  - Absence check for the date.
  - Overlapping shift check for that time window.
  - Statutory weekly hour limit check (`currentHours + shiftHours <= maxWeeklyHours`).
  - Workload balance ranking (furthest below `targetHours`).
  - Generates clear structured JSON: `{ recommendedEmployee, reasoning, eligibleCount, candidateBreakdown }`.
- `POST /api/demo/reset`: Quick endpoint to re-seed database at any time during demos.

---

### 3. Frontend (`client/`)
React 18 + Vite + TypeScript + Tailwind CSS + Lucide React.

#### UI Components (`client/src/components/`):
- **`Header`**:
  - Week navigation (`<`, Today, `>`).
  - Real-time stat chips (Total Shifts, Assigned, Conflicts alert badge).
  - "Simulate Sick Call" demo trigger button.
  - "Reset Demo Data" helper button.
- **`ShiftBoard`**:
  - 7-column calendar grid (Monday through Sunday).
  - Day headers displaying date, day name, total scheduled hours, and "Today" badge.
- **`ShiftCard`**:
  - Time window, duration badge, role badge (color-coded per role).
  - Assigned employee avatar and name.
  - Conflict warning banner when `status === 'CONFLICT'`.
  - Prominent **"✨ Auto-Resolve with AI"** button on conflicted cards.
- **`AIResolveModal`**:
  - Multi-step loading animation simulating AI rule evaluation.
  - Detailed candidate recommendation card (role, target vs. current hours progress bar).
  - AI reasoning card highlighting why this employee was selected over others.
  - **"Confirm & Reassign"** action button that updates the shift and refreshes the board.
- **`SimulateSickModal`**:
  - Modal allowing demo presenter to select any employee and date to report sick, instantly turning their shifts into conflicts.
- **`StaffDrawer`**:
  - Collapsible staff sidebar/overview showing weekly capacity and utilization across the team.

---

## Verification Plan

### Automated / API Verification:
- Run Prisma migration and seed script: `npx prisma db push` and `npx ts-node prisma/seed.ts`.
- Test `GET /api/schedule` to ensure shifts and employee relations load.
- Test `POST /api/ai/auto-resolve` with the seeded conflicted shift to verify proper recommendation and reasoning output.
- Test `PATCH /api/shifts/:id/assign` to verify state change from `CONFLICT` to `ASSIGNED`.
- Test `POST /api/absences/report-sick` to verify shift status transitions to `CONFLICT`.

### Interactive UI Verification:
- Launch frontend & backend concurrently.
- Verify initial board display shows the conflicted shift prominently highlighted.
- Click "✨ Auto-Resolve with AI", inspect reasoning modal, click "Confirm & Reassign", and verify shift updates immediately to `ASSIGNED`.
- Use "Simulate Sick Call" to report another employee sick, verify their shift switches to `CONFLICT` in real-time.
- Test week navigation and responsive layout.
