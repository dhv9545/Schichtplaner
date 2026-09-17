import React from 'react';
import { Clock, AlertTriangle, Sparkles, User, UserX } from 'lucide-react';
import { Shift } from '../types/index.js';
import { RoleBadge } from './RoleBadge.js';
import { calculateDurationHours } from '../utils/dateUtils.js';

interface ShiftCardProps {
  shift: Shift;
  onAutoResolve: (shift: Shift) => void;
}

export const ShiftCard: React.FC<ShiftCardProps> = ({ shift, onAutoResolve }) => {
  const duration = calculateDurationHours(shift.startTime, shift.endTime);
  const isConflict = shift.status === 'CONFLICT';
  const isOpen = shift.status === 'OPEN';

  // Extract employee initials
  const initials = shift.assignedEmployee?.name
    ? shift.assignedEmployee.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : '?';

  return (
    <div
      className={`group relative rounded-xl transition-all duration-200 p-3.5 flex flex-col justify-between text-left ${
        isConflict
          ? 'bg-rose-950/40 border-2 border-rose-500/80 conflict-glow text-rose-100 shadow-lg'
          : isOpen
          ? 'bg-slate-800/40 border-2 border-dashed border-slate-700 hover:border-slate-500 text-slate-300'
          : 'bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 hover:bg-slate-800 text-slate-100 shadow-md'
      }`}
    >
      {/* Top row: Time, Duration badge, and Role Badge */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
          <Clock size={13} className="text-slate-400 shrink-0" />
          <span>
            {shift.startTime} - {shift.endTime}
          </span>
          <span className="text-[10px] text-slate-400 bg-slate-700/60 px-1.5 py-0.5 rounded font-medium">
            {duration}h
          </span>
        </div>
        <RoleBadge role={shift.requiredRole} size="sm" />
      </div>

      {/* Center: Conflict Alert Banner or Staff Info */}
      {isConflict ? (
        <div className="my-1.5 p-2 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-200">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-300 mb-1">
            <AlertTriangle size={14} className="text-rose-400 animate-pulse shrink-0" />
            <span>Schedule Conflict: Staff Absent</span>
          </div>
          {shift.assignedEmployee && (
            <p className="text-[11px] text-rose-200/90 line-through truncate">
              {shift.assignedEmployee.name} (Reported Sick)
            </p>
          )}
        </div>
      ) : isOpen ? (
        <div className="my-2 py-1.5 px-2 rounded-lg bg-slate-800/60 border border-slate-700/40 flex items-center gap-2 text-slate-400">
          <UserX size={14} className="text-slate-500" />
          <span className="text-xs font-medium italic">Unassigned Shift</span>
        </div>
      ) : (
        <div className="my-1.5 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white font-semibold text-xs flex items-center justify-center shrink-0 shadow-sm border border-indigo-300/30">
            {initials}
          </div>
          <div className="truncate">
            <p className="text-sm font-medium text-slate-100 truncate">
              {shift.assignedEmployee?.name}
            </p>
            <p className="text-[11px] text-slate-400">
              {shift.assignedEmployee?.currentHours}h / {shift.assignedEmployee?.targetHours}h this week
            </p>
          </div>
        </div>
      )}

      {/* Bottom row / Interactive action */}
      <div className="mt-2 pt-2 border-t border-slate-700/50 flex items-center justify-between">
        <span className="text-[10px] uppercase font-bold tracking-wider">
          {isConflict ? (
            <span className="text-rose-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
              Conflict
            </span>
          ) : isOpen ? (
            <span className="text-amber-400">Open</span>
          ) : (
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Assigned
            </span>
          )}
        </span>

        {isConflict ? (
          <button
            onClick={() => onAutoResolve(shift)}
            className="group/btn relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150"
            title="Auto-resolve with AI"
          >
            <Sparkles size={13} className="text-yellow-300 animate-spin" style={{ animationDuration: '4s' }} />
            <span>Auto-Resolve</span>
          </button>
        ) : isOpen ? (
          <button
            onClick={() => onAutoResolve(shift)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-700/50 hover:border-indigo-500 transition-colors"
          >
            <Sparkles size={12} className="text-indigo-400" />
            <span>AI Match</span>
          </button>
        ) : (
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <User size={11} /> {shift.assignedEmployee?.role}
          </span>
        )}
      </div>
    </div>
  );
};
