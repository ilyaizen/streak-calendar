'use client';

import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, isToday, getDay } from 'date-fns';
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

  // Calculate empty cells needed at start
  const firstDayOfMonth = getDay(startOfMonth(date));
  const emptyDays = Array(firstDayOfMonth).fill(null);

  const dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div className="space-y-2">
      <h3 className="font-medium">{format(date, 'MMMM yyyy')}</h3>
      <div className="grid grid-cols-7 gap-1">
        {dayLabels.map((label) => (
          <div key={label} className="text-center text-sm text-muted-foreground">
            {label}
          </div>
        ))}
        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}
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
