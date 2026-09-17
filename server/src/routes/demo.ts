import { Router, Request, Response } from 'express';
import { seedDatabase } from '../services/seedService.js';

export const demoRouter = Router();

/**
 * POST /api/demo/reset
 * Resets the SQLite database to initial seed state with 1 conflict shift ready for AI demo.
 */
demoRouter.post('/reset', async (_req: Request, res: Response) => {
  try {
    await seedDatabase();
    res.json({
      success: true,
      message: 'Demo database successfully reset and re-seeded!',
    });
  } catch (error: any) {
    console.error('Error resetting demo database:', error);
    res.status(500).json({ error: 'Failed to reset demo database', message: error.message });
  }
});
