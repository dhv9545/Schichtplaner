import { ScheduleResponse, Employee, AutoResolveResponse, Shift } from '../types/index.js';

const API_BASE = '/api';

export async function fetchSchedule(startDate?: string): Promise<ScheduleResponse> {
  const url = startDate ? `${API_BASE}/schedule?startDate=${startDate}` : `${API_BASE}/schedule`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to load schedule: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchEmployees(): Promise<Employee[]> {
  const res = await fetch(`${API_BASE}/employees`);
  if (!res.ok) {
    throw new Error(`Failed to load employees: ${res.statusText}`);
  }
  return res.json();
}

export async function assignShift(shiftId: string, employeeId: string): Promise<{ success: boolean; shift: Shift; message: string }> {
  const res = await fetch(`${API_BASE}/shifts/${shiftId}/assign`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employeeId }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to assign shift: ${res.statusText}`);
  }
  return res.json();
}

export async function reportSick(employeeId: string, date: string): Promise<any> {
  const res = await fetch(`${API_BASE}/absences/report-sick`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employeeId, date, reason: 'SICK' }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to report sick leave: ${res.statusText}`);
  }
  return res.json();
}

export async function autoResolveShift(shiftId: string): Promise<AutoResolveResponse> {
  const res = await fetch(`${API_BASE}/ai/auto-resolve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shiftId }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to run AI auto-resolve: ${res.statusText}`);
  }
  return res.json();
}

export async function resetDemoDatabase(): Promise<any> {
  const res = await fetch(`${API_BASE}/demo/reset`, {
    method: 'POST',
  });
  if (!res.ok) {
    throw new Error(`Failed to reset demo database: ${res.statusText}`);
  }
  return res.json();
}
