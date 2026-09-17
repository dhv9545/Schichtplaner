import { Router, Request, Response } from 'express';
import { prisma } from '../prisma.js';

export const scheduleRouter = Router();

// Helper to compute end date (startDate + 6 days)
function getSevenDaysWindow(startDateStr: string): { start: string; end: string; dates: string[] } {
  const [y, m, d] = startDateStr.split('-').map(Number);
  const start = new Date(y, m - 1, d);
  const dates: string[] = [];

  for (let i = 0; i < 7; i++) {
    const current = new Date(start);
    current.setDate(start.getDate() + i);
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const day = String(current.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);
  }

  return {
    start: dates[0],
    end: dates[6],
    dates,
  };
}

/**
 * GET /api/schedule?startDate=YYYY-MM-DD
 * Fetches all shifts for a 7-day window, including assigned employee details.
 */
scheduleRouter.get('/', async (req: Request, res: Response) => {
  try {
    let startDate = req.query.startDate as string;

    if (!startDate) {
      // Default to current Monday
      const now = new Date();
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(now.setDate(diff));
      const y = monday.getFullYear();
      const m = String(monday.getMonth() + 1).padStart(2, '0');
      const d = String(monday.getDate()).padStart(2, '0');
      startDate = `${y}-${m}-${d}`;
    }

    const { start, end, dates } = getSevenDaysWindow(startDate);

    const shifts = await prisma.shift.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        assignedEmployee: true,
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    const absences = await prisma.absence.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        employee: true,
      },
    });

    res.json({
      startDate: start,
      endDate: end,
      dates,
      shifts,
      absences,
    });
  } catch (error: any) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ error: 'Failed to fetch schedule', message: error.message });
  }
});
