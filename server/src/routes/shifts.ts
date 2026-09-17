import { Router, Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { recalculateEmployeeHours } from '../utils/hours.js';

export const shiftsRouter = Router();

/**
 * PATCH /api/shifts/:id/assign
 * Assigns or replaces an employee on a shift and updates shift status to ASSIGNED.
 */
shiftsRouter.patch('/:id/assign', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({ error: 'employeeId is required' });
    }

    const currentShift = await prisma.shift.findUnique({
      where: { id },
    });

    if (!currentShift) {
      return res.status(404).json({ error: 'Shift not found' });
    }

    const previousEmployeeId = currentShift.assignedEmployeeId;

    // Verify employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Update shift
    const updatedShift = await prisma.shift.update({
      where: { id },
      data: {
        assignedEmployeeId: employeeId,
        status: 'ASSIGNED',
      },
      include: {
        assignedEmployee: true,
      },
    });

    // Recalculate hours for both employees
    await recalculateEmployeeHours(employeeId);
    if (previousEmployeeId && previousEmployeeId !== employeeId) {
      await recalculateEmployeeHours(previousEmployeeId);
    }

    res.json({
      success: true,
      shift: updatedShift,
      message: `Shift successfully assigned to ${employee.name}`,
    });
  } catch (error: any) {
    console.error('Error assigning shift:', error);
    res.status(500).json({ error: 'Failed to assign shift', message: error.message });
  }
});

/**
 * GET /api/shifts/:id
 * Fetches a single shift by ID
 */
shiftsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const shift = await prisma.shift.findUnique({
      where: { id },
      include: { assignedEmployee: true },
    });

    if (!shift) {
      return res.status(404).json({ error: 'Shift not found' });
    }

    res.json(shift);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch shift', message: error.message });
  }
});
