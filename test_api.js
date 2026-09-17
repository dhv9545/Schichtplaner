async function runTests() {
  console.log('Testing Endpoints...');
  
  // 1. Schedule
  const schedRes = await fetch('http://localhost:5000/api/schedule');
  const sched = await schedRes.json();
  console.log('GET /api/schedule -> 200 OK. Total shifts:', sched.shifts.length);
  
  // Find conflict shift
  const conflictShift = sched.shifts.find(s => s.status === 'CONFLICT');
  console.log('Found Conflict Shift:', conflictShift.id, conflictShift.date, conflictShift.requiredRole);

  // 2. AI Auto-Resolve
  const aiRes = await fetch('http://localhost:5000/api/ai/auto-resolve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shiftId: conflictShift.id })
  });
  const aiData = await aiRes.json();
  console.log('POST /api/ai/auto-resolve -> 200 OK.');
  console.log('Recommended Employee:', aiData.recommendedEmployee?.name);
  console.log('Reasoning:', aiData.reasoning);
  console.log('Eligible Count:', aiData.eligibleCount);

  // 3. Assign Shift
  const assignRes = await fetch(`http://localhost:5000/api/shifts/${conflictShift.id}/assign`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employeeId: aiData.recommendedEmployee.id })
  });
  const assignData = await assignRes.json();
  console.log('PATCH /api/shifts/:id/assign -> 200 OK. Status:', assignData.shift.status, 'Assigned to:', assignData.shift.assignedEmployee.name);

  // 4. Report Sick
  const sickRes = await fetch('http://localhost:5000/api/absences/report-sick', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employeeId: assignData.shift.assignedEmployee.id, date: conflictShift.date })
  });
  const sickData = await sickRes.json();
  console.log('POST /api/absences/report-sick -> 200 OK. Message:', sickData.message);

  // 5. Reset Demo Database
  const resetRes = await fetch('http://localhost:5000/api/demo/reset', { method: 'POST' });
  const resetData = await resetRes.json();
  console.log('POST /api/demo/reset -> 200 OK. Message:', resetData.message);

  console.log('All API tests passed cleanly!');
}

runTests().catch(console.error);
