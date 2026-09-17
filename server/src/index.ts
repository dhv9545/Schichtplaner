import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { scheduleRouter } from './routes/schedule.js';
import { employeesRouter } from './routes/employees.js';
import { shiftsRouter } from './routes/shifts.js';
import { absencesRouter } from './routes/absences.js';
import { aiRouter } from './routes/ai.js';
import { demoRouter } from './routes/demo.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*', // Allow all origins for dev prototype
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
}));

app.use(express.json());

// Request logging middleware
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// API routes
app.use('/api/schedule', scheduleRouter);
app.use('/api/employees', employeesRouter);
app.use('/api/shifts', shiftsRouter);
app.use('/api/absences', absencesRouter);
app.use('/api/ai', aiRouter);
app.use('/api/demo', demoRouter);

app.listen(PORT, () => {
  console.log(`🚀 Shift Planner API server running at http://localhost:${PORT}`);
});
