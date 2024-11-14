'use client';

import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, isToday } from 'date-fns';
import { Doc } from '../../../../convex/_generated/dataModel';

type CalendarMonthProps = {
  date: Date;
  completions: Doc<'completions'>[];
};

export function CalendarMonth({ date, completions }: CalendarMonthProps) {
  const days = eachDayOfInterval({
    start: startOfMonth(date),
    end: endOfMonth(date),
  });

  return (
    <div className="space-y-2">
      <h3 className="font-medium">{format(date, 'MMMM yyyy')}</h3>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const hasCompletion = completions.some((completion) => isSameDay(completion.completedAt, day));

          return (
            <div
              key={day.toISOString()}
              className={`aspect-square rounded p-1 text-center text-sm ${
                hasCompletion ? 'bg-primary text-primary-foreground' : 'bg-muted'
              } ${isToday(day) ? 'ring-2 ring-ring' : ''}`}
            >
              {format(day, 'd')}
            </div>
          );
        })}
      </div>
    </div>
  );
}
