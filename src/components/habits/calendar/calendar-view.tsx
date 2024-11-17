'use client';

import { CalendarMonth } from './calendar-month';
import { subMonths } from 'date-fns';
import { Doc } from '../../../../convex/_generated/dataModel';

interface CalendarViewProps {
  completions: Doc<'completions'>[];
}

export function CalendarView({ completions }: CalendarViewProps) {
  const today = new Date();

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold">Your Streak Calendar</h2>
      <div className="grid min-h-[400px] gap-8 md:grid-cols-3">
        {[2, 1, 0].map((monthsAgo) => (
          <CalendarMonth key={monthsAgo} date={subMonths(today, monthsAgo)} completions={completions} />
        ))}
      </div>
    </div>
  );
}
