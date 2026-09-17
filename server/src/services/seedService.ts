import { prisma } from '../prisma.js';
import { calculateShiftDuration } from '../utils/hours.js';

// Get Monday of current week
export function getCurrentWeekMonday(referenceDate = new Date()): Date {
  const date = new Date(referenceDate);
  const day = date.getDay(); // 0 is Sunday, 1 is Monday...
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export async function seedDatabase() {
  console.log('🌱 Starting shift planner database seed...');

  // Clean existing tables
  await prisma.absence.deleteMany();
  await prisma.shift.deleteMany();
  await prisma.employee.deleteMany();

  // 1. Create 6 diverse employees across Service, Kitchen, and Bar
  const employeesData = [
    {
      name: 'Sarah Miller',
      role: 'Service',
      maxWeeklyHours: 40,
      targetHours: 32,
      currentHours: 0,
    },
    {
      name: 'Marcus Chen',
      role: 'Service',
      maxWeeklyHours: 40,
      targetHours: 35,
      currentHours: 0,
    },
    {
      name: 'Elena Rostova',
      role: 'Kitchen',
      maxWeeklyHours: 40,
      targetHours: 30,
      currentHours: 0,
    },
    {
      name: 'David Kim',
      role: 'Kitchen',
      maxWeeklyHours: 40,
      targetHours: 35,
      currentHours: 0,
    },
    {
      name: 'Lisa Becker',
      role: 'Bar',
      maxWeeklyHours: 35,
      targetHours: 25,
      currentHours: 0,
    },
    {
      name: 'Tom Wright',
      role: 'Bar',
      maxWeeklyHours: 40,
      targetHours: 30,
      currentHours: 0,
    },
  ];

  const employees: Record<string, any> = {};
  for (const emp of employeesData) {
    const created = await prisma.employee.create({ data: emp });
    employees[created.name] = created;
  }

  // 2. Compute date strings for the 7 days of the current week (Mon-Sun)
  const monday = getCurrentWeekMonday();
  const weekDates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    weekDates.push(formatDate(d));
  }

  const [mon, tue, wed, thu, fri, sat, sun] = weekDates;

  // 3. Create 10 shifts across the current week
  // Shift on Thursday has Marcus Chen scheduled, but marked as CONFLICT because Marcus is sick!
  const shiftsToCreate = [
    // Monday
    {
      date: mon,
      startTime: '08:00',
      endTime: '16:00', // 8h
      requiredRole: 'Service',
      status: 'ASSIGNED',
      assignedEmployeeId: employees['Sarah Miller'].id,
    },
    {
      date: mon,
      startTime: '10:00',
      endTime: '18:00', // 8h
      requiredRole: 'Kitchen',
      status: 'ASSIGNED',
      assignedEmployeeId: employees['Elena Rostova'].id,
    },
    // Tuesday
    {
      date: tue,
      startTime: '09:00',
      endTime: '17:00', // 8h
      requiredRole: 'Kitchen',
      status: 'ASSIGNED',
      assignedEmployeeId: employees['David Kim'].id,
    },
    {
      date: tue,
      startTime: '16:00',
      endTime: '23:00', // 7h
      requiredRole: 'Bar',
      status: 'ASSIGNED',
      assignedEmployeeId: employees['Lisa Becker'].id,
    },
    // Wednesday
    {
      date: wed,
      startTime: '08:00',
      endTime: '16:00', // 8h
      requiredRole: 'Service',
      status: 'ASSIGNED',
      assignedEmployeeId: employees['Marcus Chen'].id,
    },
    // Thursday: CONFLICT SHIFT! Marcus Chen is scheduled, but reported sick!
    {
      date: thu,
      startTime: '11:00',
      endTime: '19:00', // 8h
      requiredRole: 'Service',
      status: 'CONFLICT', // Trigger for AI auto-resolve
      assignedEmployeeId: employees['Marcus Chen'].id,
    },
    {
      date: thu,
      startTime: '14:00',
      endTime: '22:00', // 8h
      requiredRole: 'Kitchen',
      status: 'ASSIGNED',
      assignedEmployeeId: employees['Elena Rostova'].id,
    },
    // Friday
    {
      date: fri,
      startTime: '16:00',
      endTime: '00:00', // 8h
      requiredRole: 'Bar',
      status: 'ASSIGNED',
      assignedEmployeeId: employees['Tom Wright'].id,
    },
    {
      date: fri,
      startTime: '09:00',
      endTime: '17:00', // 8h
      requiredRole: 'Service',
      status: 'OPEN',
      assignedEmployeeId: null,
    },
    // Saturday
    {
      date: sat,
      startTime: '17:00',
      endTime: '01:00', // 8h
      requiredRole: 'Bar',
      status: 'ASSIGNED',
      assignedEmployeeId: employees['Tom Wright'].id,
    },
  ];

  for (const s of shiftsToCreate) {
    await prisma.shift.create({ data: s });
  }

  // 4. Create Sick Absence record for Marcus Chen on Thursday
  await prisma.absence.create({
    data: {
      date: thu,
      reason: 'SICK',
      employeeId: employees['Marcus Chen'].id,
    },
  });

  // 5. Update each employee's currentHours based on currently assigned valid shifts
  const allEmployees = await prisma.employee.findMany();
  for (const emp of allEmployees) {
    const assignedShifts = await prisma.shift.findMany({
      where: {
        assignedEmployeeId: emp.id,
        status: 'ASSIGNED',
      },
    });

    let totalHours = 0;
    for (const shift of assignedShifts) {
      totalHours += calculateShiftDuration(shift.startTime, shift.endTime);
    }

    await prisma.employee.update({
      where: { id: emp.id },
      data: { currentHours: Math.round(totalHours) },
    });
  }

  console.log('✅ Seed completed successfully! Database ready for demo.');
}
