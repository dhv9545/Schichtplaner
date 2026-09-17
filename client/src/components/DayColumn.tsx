import React from 'react';
import { Shift, Absence } from '../types/index.js';
import { ShiftCard } from './ShiftCard.js';
import { formatDayName, formatShortDate, isToday, calculateDurationHours } from '../utils/dateUtils.js';
import { Calendar, AlertCircle } from 'lucide-react';

interface DayColumnProps {
  dateStr: string;
  shifts: Shift[];
  absences: Absence[];
  onAutoResolve: (shift: Shift) => void;
}

export const DayColumn: React.FC<DayColumnProps> = ({
  dateStr,
  shifts,
  absences,
  onAutoResolve,
}) => {
  const isCurrentDay = isToday(dateStr);

  // Calculate total scheduled hours for this day
  const totalHours = shifts.reduce((acc, s) => {
    return acc + calculateDurationHours(s.startTime, s.endTime);
  }, 0);

  const dayAbsences = absences.filter((a) => a.date === dateStr);
  const hasConflict = shifts.some((s) => s.status === 'CONFLICT');

  return (
    <div
      className={`flex flex-col rounded-2xl transition-all duration-200 border ${
        isCurrentDay
          ? 'bg-slate-800/90 border-indigo-500/60 ring-1 ring-indigo-500/40 shadow-xl'
          : hasConflict
          ? 'bg-slate-800/60 border-rose-500/40'
          : 'bg-slate-800/40 border-slate-700/60'
      }`}
    >
      {/* Day Header */}
      <div className="p-3.5 border-b border-slate-700/60 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-100 text-base">
              {formatDayName(dateStr)}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {formatShortDate(dateStr)}
            </span>
          </div>
          {isCurrentDay && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 uppercase tracking-wider">
              Today
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1 text-[11px]">
            <Calendar size={12} className="text-slate-500" />
            <span>{shifts.length} {shifts.length === 1 ? 'shift' : 'shifts'}</span>
          </span>
          <span className="font-semibold text-slate-300 bg-slate-700/40 px-2 py-0.5 rounded text-[11px]">
            {totalHours}h total
          </span>
        </div>

        {/* Absences banner for this day if any */}
        {dayAbsences.length > 0 && (
          <div className="mt-1 flex flex-col gap-1">
            {dayAbsences.map((ab) => (
              <div
                key={ab.id}
                className="flex items-center gap-1.5 px-2 py-1 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px]"
              >
                <AlertCircle size={12} className="text-rose-400 shrink-0" />
                <span className="truncate">
                  {ab.employee?.name || 'Staff'}: {ab.reason}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Shifts container */}
      <div className="p-3 flex-1 flex flex-col gap-3 min-h-[360px] overflow-y-auto">
        {shifts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500 border border-dashed border-slate-700/50 rounded-xl">
            <p className="text-xs font-medium">No shifts scheduled</p>
          </div>
        ) : (
          shifts.map((shift) => (
            <ShiftCard
              key={shift.id}
              shift={shift}
              onAutoResolve={onAutoResolve}
            />
          ))
        )}
      </div>
    </div>
  );
};
