import { prisma } from '../prisma.js';
import { calculateShiftDuration, doTimesOverlap } from '../utils/hours.js';

export interface CandidateEvaluation {
  employee: any;
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
  hoursBelowTarget: number; // target - projected
}

export interface AutoResolveResult {
  shiftId: string;
  shiftDetails: {
    date: string;
    startTime: string;
    endTime: string;
    durationHours: number;
    requiredRole: string;
  };
  recommendedEmployee: any | null;
  reasoning: string;
  eligibleCount: number;
  candidates: CandidateEvaluation[];
}

export async function autoResolveShift(shiftId: string): Promise<AutoResolveResult> {
  const shift = await prisma.shift.findUnique({
    where: { id: shiftId },
    include: { assignedEmployee: true },
  });

  if (!shift) {
    throw new Error(`Shift with ID "${shiftId}" not found`);
  }

  const shiftDuration = calculateShiftDuration(shift.startTime, shift.endTime);

  // Fetch all employees and their absences/shifts
  const allEmployees = await prisma.employee.findMany({
    include: {
      absences: {
        where: { date: shift.date },
      },
      shifts: {
        where: {
          date: shift.date,
          status: 'ASSIGNED',
          id: { not: shift.id }, // Ignore the shift being resolved
        },
      },
    },
  });

  const evaluations: CandidateEvaluation[] = [];

  for (const emp of allEmployees) {
    const roleMatch = emp.role.toLowerCase() === shift.requiredRole.toLowerCase();
    const hasAbsence = emp.absences.length > 0;
    
    // Check for overlapping shifts on the same day
    let hasOverlap = false;
    for (const existingShift of emp.shifts) {
      if (doTimesOverlap(shift.startTime, shift.endTime, existingShift.startTime, existingShift.endTime)) {
        hasOverlap = true;
        break;
      }
    }

    const projectedHours = emp.currentHours + shiftDuration;
    const wouldExceedMaxHours = projectedHours > emp.maxWeeklyHours;
    const hoursBelowTarget = emp.targetHours - projectedHours;

    let isEligible = true;
    let exclusionReason: string | undefined;

    if (!roleMatch) {
      isEligible = false;
      exclusionReason = `Role mismatch (Employee is ${emp.role}, shift requires ${shift.requiredRole})`;
    } else if (hasAbsence) {
      isEligible = false;
      const absenceType = emp.absences[0].reason || 'ABSENT';
      exclusionReason = `Reported ${absenceType} on ${shift.date}`;
    } else if (hasOverlap) {
      isEligible = false;
      exclusionReason = `Already assigned to an overlapping shift on ${shift.date}`;
    } else if (wouldExceedMaxHours) {
      isEligible = false;
      exclusionReason = `Would exceed legal statutory limit (${projectedHours}h / ${emp.maxWeeklyHours}h max)`;
    }

    evaluations.push({
      employee: {
        id: emp.id,
        name: emp.name,
        role: emp.role,
        currentHours: emp.currentHours,
        targetHours: emp.targetHours,
        maxWeeklyHours: emp.maxWeeklyHours,
      },
      isEligible,
      exclusionReason,
      roleMatch,
      hasAbsence,
      hasOverlap,
      wouldExceedMaxHours,
      currentHours: emp.currentHours,
      targetHours: emp.targetHours,
      maxWeeklyHours: emp.maxWeeklyHours,
      projectedHours,
      hoursBelowTarget,
    });
  }

  // Filter eligible candidates and sort by who is furthest below their targetHours
  const eligibleCandidates = evaluations
    .filter((e) => e.isEligible)
    .sort((a, b) => b.hoursBelowTarget - a.hoursBelowTarget);

  const recommended = eligibleCandidates.length > 0 ? eligibleCandidates[0] : null;

  // Generate structured, human-readable reasoning
  let reasoning = '';
  if (recommended) {
    const emp = recommended.employee;
    const remainingBeforeShift = emp.targetHours - emp.currentHours;
    reasoning =
      `Recommended ${emp.name} for the ${shift.requiredRole} shift (${shift.startTime}-${shift.endTime}, ${shiftDuration}h). ` +
      `${emp.name} is fully qualified, has zero reported absences or schedule conflicts on ${shift.date}, ` +
      `and is currently ${remainingBeforeShift}h below their ${emp.targetHours}h weekly target (currently at ${emp.currentHours}h). ` +
      `Assigning this shift brings them to ${recommended.projectedHours}h, maintaining fair workload distribution while staying well below the ${emp.maxWeeklyHours}h statutory ceiling.`;

    if (eligibleCandidates.length > 1) {
      const runnerUp = eligibleCandidates[1].employee;
      reasoning += ` Preferred over ${runnerUp.name} who already has ${runnerUp.currentHours}h assigned this week.`;
    }
  } else {
    reasoning = `No eligible employees found for the ${shift.requiredRole} shift on ${shift.date}. All available staff either have role mismatches, active absences, overlapping assignments, or exceed weekly hour quotas.`;
  }

  return {
    shiftId: shift.id,
    shiftDetails: {
      date: shift.date,
      startTime: shift.startTime,
      endTime: shift.endTime,
      durationHours: shiftDuration,
      requiredRole: shift.requiredRole,
    },
    recommendedEmployee: recommended ? recommended.employee : null,
    reasoning,
    eligibleCount: eligibleCandidates.length,
    candidates: evaluations,
  };
}
