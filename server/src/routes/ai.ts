import { Router, Request, Response } from 'express';
import { autoResolveShift } from '../services/aiResolver.js';

export const aiRouter = Router();

/**
 * POST /api/ai/auto-resolve
 * Accepts { shiftId }.
 * Finds eligible employees matching shift's requiredRole.
 * Excludes anyone with an absence on that date or already assigned to an overlapping shift.
 * Ranks eligible candidates by who is furthest below their targetHours.
 * Returns structured JSON: { recommendedEmployee: Employee, reasoning: string, eligibleCount: number, candidates: [...] }
 */
aiRouter.post('/auto-resolve', async (req: Request, res: Response) => {
  try {
    const { shiftId } = req.body;

    if (!shiftId) {
      return res.status(400).json({ error: 'shiftId is required' });
    }

    const result = await autoResolveShift(shiftId);

    res.json(result);
  } catch (error: any) {
    console.error('Error in AI auto-resolve:', error);
    res.status(500).json({ error: 'Failed to auto-resolve shift', message: error.message });
  }
});
