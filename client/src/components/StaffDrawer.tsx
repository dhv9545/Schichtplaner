import React from 'react';
import { Users, X, Award } from 'lucide-react';
import { Employee } from '../types/index.js';
import { RoleBadge } from './RoleBadge.js';

interface StaffDrawerProps {
  employees: Employee[];
  isOpen: boolean;
  onClose: () => void;
}

export const StaffDrawer: React.FC<StaffDrawerProps> = ({
  employees,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl h-full flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Users size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Staff Capacity & Quotas</h2>
              <p className="text-xs text-slate-400">Weekly hours & statutory limits</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* List of employees */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {employees.map((emp) => {
            const percentTarget = Math.round((emp.currentHours / emp.targetHours) * 100);
            const remainingToTarget = emp.targetHours - emp.currentHours;

            return (
              <div
                key={emp.id}
                className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white font-bold text-xs flex items-center justify-center shadow">
                      {emp.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{emp.name}</h4>
                      <RoleBadge role={emp.role} size="sm" className="mt-0.5" />
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-100">
                      {emp.currentHours}h
                    </span>
                    <span className="text-xs text-slate-400"> / {emp.targetHours}h</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden flex">
                    <div
                      className={`h-full transition-all duration-500 ${
                        percentTarget > 100
                          ? 'bg-amber-400'
                          : percentTarget >= 75
                          ? 'bg-emerald-400'
                          : 'bg-indigo-400'
                      }`}
                      style={{ width: `${Math.min(100, (emp.currentHours / emp.maxWeeklyHours) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>
                      {remainingToTarget > 0 ? (
                        <span className="text-indigo-300 font-medium">
                          {remainingToTarget}h needed for target
                        </span>
                      ) : remainingToTarget === 0 ? (
                        <span className="text-emerald-400 font-medium">Target met!</span>
                      ) : (
                        <span className="text-amber-400 font-medium">
                          {Math.abs(remainingToTarget)}h over target
                        </span>
                      )}
                    </span>
                    <span>Max limit: {emp.maxWeeklyHours}h</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 text-xs text-slate-400 flex items-center gap-2">
          <Award size={16} className="text-indigo-400 shrink-0" />
          <span>AI Auto-Resolve prioritizes staff furthest below target weekly hours.</span>
        </div>
      </div>
    </div>
  );
};
