import React, { useState, useEffect } from 'react';
import { Sparkles, X, CheckCircle, AlertTriangle, UserCheck, ShieldAlert, ArrowRight, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Shift, AutoResolveResponse, Employee } from '../types/index.js';
import { autoResolveShift, assignShift } from '../services/api.js';
import { RoleBadge } from './RoleBadge.js';
import { calculateDurationHours, formatDayName, formatShortDate } from '../utils/dateUtils.js';

interface AIResolveModalProps {
  shift: Shift | null;
  onClose: () => void;
  onSuccess: (assignedEmployee: Employee, shiftId: string) => void;
}

export const AIResolveModal: React.FC<AIResolveModalProps> = ({
  shift,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [result, setResult] = useState<AutoResolveResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAllCandidates, setShowAllCandidates] = useState(false);
  const [evalStep, setEvalStep] = useState(0);

  const evalSteps = [
    'Scanning staff roster for qualified roles...',
    'Checking absence records & overlapping shifts...',
    'Validating statutory maximum hour limits...',
    'Optimizing fair distribution against target quotas...',
  ];

  useEffect(() => {
    if (!shift) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setEvalStep(0);

    // Step cycle animation
    const stepInterval = setInterval(() => {
      setEvalStep((prev) => (prev < evalSteps.length - 1 ? prev + 1 : prev));
    }, 350);

    // Call API
    autoResolveShift(shift.id)
      .then((data) => {
        setTimeout(() => {
          setResult(data);
          setLoading(false);
          clearInterval(stepInterval);
        }, 800); // slight delay for smooth visual feedback
      })
      .catch((err) => {
        setError(err.message || 'Failed to auto-resolve shift');
        setLoading(false);
        clearInterval(stepInterval);
      });

    return () => clearInterval(stepInterval);
  }, [shift]);

  if (!shift) return null;

  const duration = calculateDurationHours(shift.startTime, shift.endTime);

  const handleConfirm = async () => {
    if (!result?.recommendedEmployee) return;

    try {
      setConfirming(true);
      await assignShift(shift.id, result.recommendedEmployee.id);
      onSuccess(result.recommendedEmployee, shift.id);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to reassign shift');
      setConfirming(false);
    }
  };

  const recommended = result?.recommendedEmployee;
  const recommendedEval = result?.candidates?.find(
    (c) => c.employee.id === recommended?.id
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-slate-900 border border-indigo-500/40 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Sparkles size={20} className="animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                AI Shift Auto-Resolution
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Agent Powered
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Evaluating role qualification, availability & workload quotas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Shift Details Context Bar */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
            <div className="flex items-center gap-2">
              <RoleBadge role={shift.requiredRole} size="md" />
              <span className="text-slate-300 font-semibold">
                {formatDayName(shift.date)}, {formatShortDate(shift.date)}
              </span>
              <span className="text-slate-400">
                • {shift.startTime} - {shift.endTime} ({duration}h)
              </span>
            </div>
            <div className="text-right">
              <span className="text-rose-400 font-medium">
                {shift.status === 'CONFLICT' ? '⚠️ Conflicted' : 'Unassigned'}
              </span>
            </div>
          </div>

          {/* Loading Animation State */}
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
                <Sparkles size={20} className="absolute inset-0 m-auto text-indigo-400" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-200">
                  Evaluating Staff Availability & Quotas...
                </p>
                <p className="text-xs text-indigo-300 animate-pulse">
                  {evalSteps[evalStep]}
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3">
              <AlertTriangle size={18} className="text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Unable to resolve shift</p>
                <p className="text-xs text-rose-300/80 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Recommendation Found */}
          {!loading && result && recommended && (
            <div className="space-y-4">
              {/* Primary Recommended Employee Card */}
              <div className="relative p-5 rounded-2xl bg-gradient-to-b from-indigo-950/40 via-slate-800/80 to-slate-800 border-2 border-indigo-500/60 shadow-xl overflow-hidden">
                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
                  <CheckCircle size={13} />
                  <span>Top Recommendation</span>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white font-bold text-lg flex items-center justify-center shadow-lg border border-indigo-300/30 shrink-0">
                    {recommended.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white truncate">
                        {recommended.name}
                      </h3>
                      <RoleBadge role={recommended.role} size="sm" />
                    </div>

                    <p className="text-xs text-slate-300 mt-1">
                      Role matched • 0 absences • 0 schedule overlaps
                    </p>

                    {/* Hours Progress Bar */}
                    <div className="mt-3.5 space-y-1.5">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-400">
                          Current: <strong className="text-slate-200">{recommended.currentHours}h</strong>
                        </span>
                        <span className="text-indigo-300 font-semibold">
                          + {duration}h shift = {recommendedEval?.projectedHours}h / {recommended.targetHours}h target
                        </span>
                        <span className="text-slate-400">
                          Max: <strong className="text-slate-300">{recommended.maxWeeklyHours}h</strong>
                        </span>
                      </div>

                      <div className="w-full h-2.5 bg-slate-700/80 rounded-full overflow-hidden flex">
                        {/* Current Hours bar */}
                        <div
                          className="bg-indigo-500 h-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, (recommended.currentHours / recommended.maxWeeklyHours) * 100)}%`,
                          }}
                        />
                        {/* Projected addition */}
                        <div
                          className="bg-purple-400 h-full animate-pulse transition-all duration-500"
                          style={{
                            width: `${Math.min(
                              100 - (recommended.currentHours / recommended.maxWeeklyHours) * 100,
                              (duration / recommended.maxWeeklyHours) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Reasoning Box */}
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                  <Sparkles size={14} />
                  <span>Agent Decision Reasoning</span>
                </div>
                <p className="text-xs leading-relaxed text-slate-200">
                  {result.reasoning}
                </p>

                {/* Constraint Checklist */}
                <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-slate-300">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle size={13} />
                    <span>Role Qualification: Verified</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle size={13} />
                    <span>Absence Check: Clear</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle size={13} />
                    <span>Time Overlap: Clear</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle size={13} />
                    <span>Weekly Target Deficit: Optimal</span>
                  </div>
                </div>
              </div>

              {/* Alternative Candidates Toggle */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAllCandidates(!showAllCandidates)}
                  className="w-full flex items-center justify-between py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <span>
                    Candidate evaluation breakdown ({result.candidates.length} staff evaluated, {result.eligibleCount} eligible)
                  </span>
                  {showAllCandidates ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {showAllCandidates && (
                  <div className="mt-2 space-y-2 max-h-48 overflow-y-auto pr-1">
                    {result.candidates.map((c) => (
                      <div
                        key={c.employee.id}
                        className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                          c.employee.id === recommended.id
                            ? 'bg-indigo-950/30 border-indigo-500/40 text-indigo-200'
                            : c.isEligible
                            ? 'bg-slate-800/50 border-slate-700 text-slate-300'
                            : 'bg-slate-900/50 border-slate-800 text-slate-500'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {c.isEligible ? (
                            <UserCheck size={14} className="text-emerald-400 shrink-0" />
                          ) : (
                            <ShieldAlert size={14} className="text-slate-500 shrink-0" />
                          )}
                          <div>
                            <span className="font-semibold text-slate-200">
                              {c.employee.name}
                            </span>
                            <span className="text-[11px] text-slate-400 ml-1.5">
                              ({c.employee.role} • {c.currentHours}h assigned)
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          {c.isEligible ? (
                            <span className="text-[11px] text-emerald-400 font-medium">
                              {c.hoursBelowTarget}h below target
                            </span>
                          ) : (
                            <span className="text-[11px] text-rose-400/80">
                              {c.exclusionReason}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* No Candidates Eligible */}
          {!loading && result && !recommended && (
            <div className="py-8 text-center space-y-3">
              <ShieldAlert size={36} className="mx-auto text-amber-400" />
              <h3 className="text-base font-bold text-white">No Eligible Candidates Found</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {result.reasoning}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={confirming}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            Cancel
          </button>

          {recommended && (
            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/30 transform hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50"
            >
              {confirming ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Reassigning...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} className="text-yellow-300" />
                  <span>Confirm & Reassign</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
