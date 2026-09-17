import { prisma } from '../prisma.js';

/**
 * Calculates duration in hours between startTime and endTime in 'HH:mm' format.
 * Handles overnight shifts (e.g. 16:00 to 00:00 or 17:00 to 01:00).
 */
export function calculateShiftDuration(startTime: string, endTime: string): number {
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  let startMinutes = startH * 60 + startM;
  let endMinutes = endH * 60 + endM;

  // Handle midnight/overnight crossing
  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60;
  }

  const diffMinutes = endMinutes - startMinutes;
  return Math.round((diffMinutes / 60) * 10) / 10;
}

/**
 * Checks if two time windows on the same date overlap
 */
export function doTimesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  const [sAH, sAM] = startA.split(':').map(Number);
  let [eAH, eAM] = endA.split(':').map(Number);
  const [sBH, sBM] = startB.split(':').map(Number);
  let [eBH, eBM] = endB.split(':').map(Number);

  let aStart = sAH * 60 + sAM;
  let aEnd = eAH * 60 + eAM;
  if (aEnd <= aStart) aEnd += 24 * 60;

  let bStart = sBH * 60 + sBM;
  let bEnd = eBH * 60 + eBM;
  if (bEnd <= bStart) bEnd += 24 * 60;

  return Math.max(aStart, bStart) < Math.min(aEnd, bEnd);
}

/**
 * Recalculates currentHours for a given employee based on all assigned active shifts
 */
export async function recalculateEmployeeHours(employeeId: string): Promise<number> {
  const assignedShifts = await prisma.shift.findMany({
    where: {
      assignedEmployeeId: employeeId,
      status: 'ASSIGNED',
    },
  });

  let totalHours = 0;
  for (const shift of assignedShifts) {
    totalHours += calculateShiftDuration(shift.startTime, shift.endTime);
  }

  const rounded = Math.round(totalHours);
  await prisma.employee.update({
    where: { id: employeeId },
    data: { currentHours: rounded },
  });

  return rounded;
}

/**
 * Recalculates all employees' hours
 */
export async function recalculateAllEmployeeHours(): Promise<void> {
  const employees = await prisma.employee.findMany();
  for (const emp of employees) {
    await recalculateEmployeeHours(emp.id);
  }
}
