import { Router, Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { recalculateAllEmployeeHours } from '../utils/hours.js';

export const employeesRouter = Router();

/**
 * GET /api/employees
 * Fetches all employees and their current assigned weekly hours.
 */
employeesRouter.get('/', async (_req: Request, res: Response) => {
  try {
    // Ensure hours are synchronized
    await recalculateAllEmployeeHours();

    const employees = await prisma.employee.findMany({
      orderBy: [{ role: 'asc' }, { name: 'asc' }],
      include: {
        absences: true,
      },
    });

    res.json(employees);
  } catch (error: any) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Failed to fetch employees', message: error.message });
  }
});
