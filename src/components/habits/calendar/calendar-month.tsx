'use client';

import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, isToday, getDay } from 'date-fns';
import { Doc } from '../../../../convex/_generated/dataModel';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

type CalendarMonthProps = {
  date: Date;
  completions: Doc<'completions'>[];
};

export function CalendarMonth({ date, completions }: CalendarMonthProps) {
  const habits = useQuery(api.habits.list);
  const markComplete = useMutation(api.habits.markComplete);
  const deleteCompletion = useMutation(api.habits.deleteCompletion);

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
          const dayCompletions = completions.filter((completion) => isSameDay(completion.completedAt, day));
          const hasCompletion = dayCompletions.length > 0;

          // Get appropriate background color based on completion percentage
          const getBgColor = () => {
            if (!hasCompletion) return 'bg-habit-0 dark:bg-gray-800';

            const percentage = (dayCompletions.length / (habits?.length || 1)) * 100;

            if (percentage <= 20) return 'bg-habit-20 dark:bg-green-900/30';
            if (percentage <= 40) return 'bg-habit-40 dark:bg-green-900/50';
            if (percentage <= 60) return 'bg-habit-60 dark:bg-green-900/70';
            if (percentage <= 80) return 'bg-habit-80 dark:bg-green-900/85';
            return 'bg-habit-100 dark:bg-green-900';
          };

          return (
            <Popover key={day.toISOString()}>
              <PopoverTrigger asChild>
                <button
                  className={`aspect-square rounded p-1 text-center text-sm ${getBgColor()} ${isToday(day) ? 'ring-2 ring-ring' : ''} transition-all duration-200 hover:brightness-110 ${hasCompletion ? 'text-white dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}
                >
                  {format(day, 'd')}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="space-y-2">
                  <h4 className="font-medium">{format(day, 'MMMM d, yyyy')}</h4>
                  <div className="space-y-1">
                    {habits?.map((habit) => {
                      const completion = dayCompletions.find((c) => c.habitId === habit._id);
                      return (
                        <div key={habit._id} className="flex items-center justify-between gap-2">
                          <span>{habit.name}</span>
                          {completion ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteCompletion({ completionId: completion._id })}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                markComplete({
                                  habitId: habit._id,
                                  completedAt: day.getTime(),
                                })
                              }
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          );
        })}
      </div>
    </div>
  );
}
