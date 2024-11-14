'use client';

import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { CalendarMonth } from './calendar-month';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';

export function CalendarView() {
  const today = new Date();
  const startDate = startOfMonth(subMonths(today, 2)).getTime();
  const endDate = endOfMonth(today).getTime();

  const completions = useQuery(api.habits.getCompletions, {
    startDate,
    endDate,
  });

  if (!completions) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold">Your Streak Calendar</h2>
      <div className="grid gap-8 md:grid-cols-3">
        {[2, 1, 0].map((monthsAgo) => (
          <CalendarMonth key={monthsAgo} date={subMonths(today, monthsAgo)} completions={completions} />
        ))}
      </div>
    </div>
  );
}
