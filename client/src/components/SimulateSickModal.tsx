import React, { useState } from 'react';
import { AlertTriangle, X, UserX, Loader2 } from 'lucide-react';
import { Employee } from '../types/index.js';
import { reportSick } from '../services/api.js';
import { formatDayName, formatShortDate } from '../utils/dateUtils.js';

interface SimulateSickModalProps {
  employees: Employee[];
  dates: string[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const SimulateSickModal: React.FC<SimulateSickModalProps> = ({
  employees,
  dates,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(employees[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState(dates[3] || dates[0] || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId || !selectedDate) return;

    try {
      setLoading(true);
      setError(null);
      const res = await reportSick(selectedEmployeeId, selectedDate);
      onSuccess(res.message);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to simulate sick call');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-rose-500/40 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-rose-950/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Simulate Staff Sick Call</h2>
              <p className="text-xs text-rose-300/80">Trigger conflict detection for live demo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Select Calling Employee
            </label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-rose-500 transition-colors"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.role}) - {emp.currentHours}h currently
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Absence Date
            </label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-rose-500 transition-colors"
            >
              {dates.map((d) => (
                <option key={d} value={d}>
                  {formatDayName(d)}, {formatShortDate(d)} ({d})
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-400 space-y-1">
            <p className="font-medium text-slate-300">What will happen?</p>
            <p>
              1. A sick leave absence is recorded for this employee.
            </p>
            <p>
              2. Any shifts assigned to this employee on that date will instantly flag as <strong className="text-rose-400">CONFLICT</strong>.
            </p>
            <p>
              3. The AI Auto-Resolve button will activate on the conflicted shift cards.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 shadow-lg shadow-rose-500/25 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Reporting...</span>
                </>
              ) : (
                <>
                  <UserX size={14} />
                  <span>Submit Sick Report</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
