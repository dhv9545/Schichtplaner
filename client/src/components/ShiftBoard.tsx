import React from 'react';
import { Shift, Absence } from '../types/index.js';
import { DayColumn } from './DayColumn.js';

interface ShiftBoardProps {
  dates: string[];
  shifts: Shift[];
  absences: Absence[];
  onAutoResolve: (shift: Shift) => void;
}

export const ShiftBoard: React.FC<ShiftBoardProps> = ({
  dates,
  shifts,
  absences,
  onAutoResolve,
}) => {
  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="min-w-[1050px] grid grid-cols-7 gap-3.5">
        {dates.map((dateStr) => {
          const dayShifts = shifts.filter((s) => s.date === dateStr);
          return (
            <DayColumn
              key={dateStr}
              dateStr={dateStr}
              shifts={dayShifts}
              absences={absences}
              onAutoResolve={onAutoResolve}
            />
          );
        })}
      </div>
    </div>
  );
};
