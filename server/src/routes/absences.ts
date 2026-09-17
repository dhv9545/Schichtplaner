import { Router, Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { recalculateEmployeeHours } from '../utils/hours.js';

export const absencesRouter = Router();

/**
 * POST /api/absences/report-sick
 * Accepts { employeeId, date }.
 * Creates an absence record and flips any of that employee's shifts on that date to CONFLICT.
 */
absencesRouter.post('/report-sick', async (req: Request, res: Response) => {
  try {
    const { employeeId, date, reason = 'SICK' } = req.body;

    if (!employeeId || !date) {
      return res.status(400).json({ error: 'employeeId and date are required' });
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Check if an absence already exists for this employee on this date
    let absence = await prisma.absence.findFirst({
      where: { employeeId, date },
    });

    if (!absence) {
      absence = await prisma.absence.create({
        data: {
          employeeId,
          date,
          reason,
        },
      });
    }

    // Flip any shifts assigned to this employee on that date to CONFLICT
    const conflictedShifts = await prisma.shift.findMany({
      where: {
        date,
        assignedEmployeeId: employeeId,
      },
    });

    if (conflictedShifts.length > 0) {
      await prisma.shift.updateMany({
        where: {
          date,
          assignedEmployeeId: employeeId,
        },
        data: {
          status: 'CONFLICT',
        },
      });
    }

    // Recalculate employee hours
    await recalculateEmployeeHours(employeeId);

    // Fetch updated shifts
    const updatedShifts = await prisma.shift.findMany({
      where: {
        date,
        assignedEmployeeId: employeeId,
      },
      include: {
        assignedEmployee: true,
      },
    });

    res.json({
      success: true,
      absence,
      conflictedShiftsCount: conflictedShifts.length,
      affectedShifts: updatedShifts,
      message: `Reported sick for ${employee.name} on ${date}. ${conflictedShifts.length} shift(s) flagged as CONFLICT.`,
    });
  } catch (error: any) {
    console.error('Error reporting sick leave:', error);
    res.status(500).json({ error: 'Failed to report sick leave', message: error.message });
  }
});
