import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Users,
  CalendarDays,
  UserX,
} from 'lucide-react';
import { formatWeekRange } from '../utils/dateUtils.js';

interface HeaderProps {
  startDate: string;
  endDate: string;
  totalShifts: number;
  conflictedCount: number;
  openCount: number;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onCurrentWeek: () => void;
  onOpenSimulateSick: () => void;
  onToggleStaffDrawer: () => void;
  onResetDemo: () => void;
  isResetting: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  startDate,
  endDate,
  totalShifts,
  conflictedCount,
  openCount,
  onPrevWeek,
  onNextWeek,
  onCurrentWeek,
  onOpenSimulateSick,
  onToggleStaffDrawer,
  onResetDemo,
  isResetting,
}) => {
  const weekRangeLabel = startDate && endDate ? formatWeekRange(startDate, endDate) : 'Weekly Schedule';

  return (
    <header className="w-full bg-slate-900/90 border-b border-slate-800 backdrop-blur sticky top-0 z-30 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Branding & Week Navigation */}
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-indigo-400/30">
              <Sparkles size={18} />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                ShiftAI Planner
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  SME Pilot
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">Smart SME Shift Board & Conflict Resolver</p>
            </div>
          </div>

          {/* Week Selector */}
          <div className="flex items-center bg-slate-800/80 border border-slate-700/80 rounded-xl p-1 shadow-inner">
            <button
              onClick={onPrevWeek}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
              title="Previous Week"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={onCurrentWeek}
              className="px-3 py-1 text-xs font-semibold text-slate-200 hover:text-white transition-colors"
            >
              {weekRangeLabel}
            </button>
            <button
              onClick={onNextWeek}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
              title="Next Week"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Center: Live Status Chips */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300">
            <CalendarDays size={14} className="text-slate-400" />
            <span>Total:</span>
            <strong className="text-white font-bold">{totalShifts}</strong>
          </div>

          {/* Conflict Indicator */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              conflictedCount > 0
                ? 'bg-rose-500/20 border border-rose-500/50 text-rose-300 conflict-glow animate-pulse-subtle'
                : 'bg-slate-800/80 border border-slate-700/80 text-slate-400'
            }`}
          >
            <AlertTriangle
              size={14}
              className={conflictedCount > 0 ? 'text-rose-400 animate-bounce' : 'text-slate-500'}
            />
            <span>Conflicts:</span>
            <strong className={conflictedCount > 0 ? 'text-rose-200 font-bold' : 'text-slate-400'}>
              {conflictedCount}
            </strong>
          </div>

          {openCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs">
              <UserX size={14} />
              <span>Open:</span>
              <strong className="font-bold">{openCount}</strong>
            </div>
          )}
        </div>

        {/* Right: Action Buttons (Demo Controls) */}
        <div className="flex items-center gap-2">
          {/* Staff drawer toggle */}
          <button
            onClick={onToggleStaffDrawer}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors"
            title="View staff weekly capacity & quotas"
          >
            <Users size={14} className="text-indigo-400" />
            <span className="hidden sm:inline">Staff Quotas</span>
          </button>

          {/* Simulate Sick Call Button */}
          <button
            onClick={onOpenSimulateSick}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 shadow-md shadow-rose-500/20 hover:shadow-rose-500/35 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <AlertTriangle size={14} className="text-white" />
            <span>Simulate Sick Call</span>
          </button>

          {/* Reset Demo Button */}
          <button
            onClick={onResetDemo}
            disabled={isResetting}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors disabled:opacity-50"
            title="Reset database to initial demo state"
          >
            <RotateCcw size={15} className={isResetting ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>
    </header>
  );
};
