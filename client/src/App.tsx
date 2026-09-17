import React, { useState, useEffect, useCallback } from 'react';
import { Shift, Employee, ScheduleResponse } from './types/index.js';
import { fetchSchedule, fetchEmployees, resetDemoDatabase } from './services/api.js';
import { getCurrentWeekMonday, getPreviousWeekMonday, getNextWeekMonday } from './utils/dateUtils.js';
import { Header } from './components/Header.js';
import { ShiftBoard } from './components/ShiftBoard.js';
import { AIResolveModal } from './components/AIResolveModal.js';
import { SimulateSickModal } from './components/SimulateSickModal.js';
import { StaffDrawer } from './components/StaffDrawer.js';
import { Toast, ToastMessage } from './components/Toast.js';
import { Sparkles, Filter, RefreshCw, AlertTriangle } from 'lucide-react';

export const App: React.FC = () => {
  const [currentMonday, setCurrentMonday] = useState<string>(getCurrentWeekMonday());
  const [schedule, setSchedule] = useState<ScheduleResponse | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Modals & Drawers
  const [resolvingShift, setResolvingShift] = useState<Shift | null>(null);
  const [isSimulateSickOpen, setIsSimulateSickOpen] = useState(false);
  const [isStaffDrawerOpen, setIsStaffDrawerOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const loadData = useCallback(async (mondayStr: string) => {
    try {
      setLoading(true);
      const [scheduleData, employeesData] = await Promise.all([
        fetchSchedule(mondayStr),
        fetchEmployees(),
      ]);
      setSchedule(scheduleData);
      setEmployees(employeesData);
    } catch (err: any) {
      console.error('Error loading data:', err);
      addToast('error', err.message || 'Failed to load schedule data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(currentMonday);
  }, [currentMonday, loadData]);

  const handlePrevWeek = () => {
    setCurrentMonday((prev) => getPreviousWeekMonday(prev));
  };

  const handleNextWeek = () => {
    setCurrentMonday((prev) => getNextWeekMonday(prev));
  };

  const handleCurrentWeek = () => {
    setCurrentMonday(getCurrentWeekMonday());
  };

  const handleResetDemo = async () => {
    try {
      setIsResetting(true);
      await resetDemoDatabase();
      await loadData(currentMonday);
      addToast('info', 'Demo state reset: 1 conflict shift ready for AI auto-resolution.');
    } catch (err: any) {
      addToast('error', err.message || 'Failed to reset demo state');
    } finally {
      setIsResetting(false);
    }
  };

  const handleAutoResolveSuccess = async (assignedEmployee: Employee, _shiftId: string) => {
    addToast('success', `✨ AI Auto-Resolve applied! Shift assigned to ${assignedEmployee.name}.`);
    await loadData(currentMonday);
  };

  const handleSimulateSickSuccess = async (message: string) => {
    addToast('error', `🚨 ${message}`);
    await loadData(currentMonday);
  };

  const shifts = schedule?.shifts || [];
  const filteredShifts = roleFilter === 'ALL'
    ? shifts
    : shifts.filter((s) => s.requiredRole.toLowerCase() === roleFilter.toLowerCase());

  const conflictedCount = shifts.filter((s) => s.status === 'CONFLICT').length;
  const openCount = shifts.filter((s) => s.status === 'OPEN').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Sticky Header */}
      <Header
        startDate={schedule?.startDate || currentMonday}
        endDate={schedule?.endDate || ''}
        totalShifts={shifts.length}
        conflictedCount={conflictedCount}
        openCount={openCount}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
        onCurrentWeek={handleCurrentWeek}
        onOpenSimulateSick={() => setIsSimulateSickOpen(true)}
        onToggleStaffDrawer={() => setIsStaffDrawerOpen(true)}
        onResetDemo={handleResetDemo}
        isResetting={isResetting}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
        {/* Banner if conflicts exist */}
        {conflictedCount > 0 && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/70 via-rose-900/40 to-slate-900 border border-rose-500/50 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
                <AlertTriangle size={22} className="animate-bounce" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{conflictedCount} Schedule Conflict Detected</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    Action Required
                  </span>
                </h3>
                <p className="text-xs text-rose-200/90 mt-0.5">
                  An employee reported sick. Click &quot;✨ Auto-Resolve&quot; on the highlighted shift card to evaluate qualified replacements.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                const firstConflict = shifts.find((s) => s.status === 'CONFLICT');
                if (firstConflict) setResolvingShift(firstConflict);
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 shadow-md shadow-indigo-500/30 transition-all shrink-0"
            >
              <Sparkles size={14} className="text-yellow-300" />
              <span>Auto-Resolve Conflict Now</span>
            </button>
          </div>
        )}

        {/* Controls & Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Role Filter Chips */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-slate-400 mr-1">
              <Filter size={14} />
              <span>Filter Role:</span>
            </div>
            {['ALL', 'Service', 'Kitchen', 'Bar'].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                  roleFilter === role
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700/80 border border-slate-700/60'
                }`}
              >
                {role === 'ALL' ? 'All Roles' : role}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span>Showing {filteredShifts.length} of {shifts.length} shifts</span>
            <button
              onClick={() => loadData(currentMonday)}
              className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Weekly Board */}
        {loading && !schedule ? (
          <div className="h-96 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-10 h-10 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
            <p className="text-xs text-slate-400">Loading weekly schedule & staff records...</p>
          </div>
        ) : (
          <ShiftBoard
            dates={schedule?.dates || []}
            shifts={filteredShifts}
            absences={schedule?.absences || []}
            onAutoResolve={(shift) => setResolvingShift(shift)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 ShiftAI Planner • Intelligent SME Scheduling Prototype</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Backend API Online
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-400"></span> SQLite File Storage
            </span>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <AIResolveModal
        shift={resolvingShift}
        onClose={() => setResolvingShift(null)}
        onSuccess={handleAutoResolveSuccess}
      />

      <SimulateSickModal
        employees={employees}
        dates={schedule?.dates || []}
        isOpen={isSimulateSickOpen}
        onClose={() => setIsSimulateSickOpen(false)}
        onSuccess={handleSimulateSickSuccess}
      />

      <StaffDrawer
        employees={employees}
        isOpen={isStaffDrawerOpen}
        onClose={() => setIsStaffDrawerOpen(false)}
      />

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};
