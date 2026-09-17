export interface Employee {
  id: string;
  name: string;
  role: string;
  maxWeeklyHours: number;
  targetHours: number;
  currentHours: number;
  createdAt?: string;
  updatedAt?: string;
  absences?: Absence[];
}

export type ShiftStatus = 'ASSIGNED' | 'OPEN' | 'CONFLICT';

export interface Shift {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  requiredRole: string;
  status: ShiftStatus;
  assignedEmployeeId?: string | null;
  assignedEmployee?: Employee | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Absence {
  id: string;
  date: string;
  reason: string;
  employeeId: string;
  employee?: Employee;
}

export interface ScheduleResponse {
  startDate: string;
  endDate: string;
  dates: string[];
  shifts: Shift[];
  absences: Absence[];
}

export interface CandidateEvaluation {
  employee: Employee;
  isEligible: boolean;
  exclusionReason?: string;
  roleMatch: boolean;
  hasAbsence: boolean;
  hasOverlap: boolean;
  wouldExceedMaxHours: boolean;
  currentHours: number;
  targetHours: number;
  maxWeeklyHours: number;
  projectedHours: number;
  hoursBelowTarget: number;
}

export interface AutoResolveResponse {
  shiftId: string;
  shiftDetails: {
    date: string;
    startTime: string;
    endTime: string;
    durationHours: number;
    requiredRole: string;
  };
  recommendedEmployee: Employee | null;
  reasoning: string;
  eligibleCount: number;
  candidates: CandidateEvaluation[];
}
