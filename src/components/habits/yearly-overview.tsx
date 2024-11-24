'use client';

import { eachDayOfInterval, format, getDay, subMonths, eachMonthOfInterval, startOfMonth, endOfMonth } from 'date-fns';
import { Doc } from '../../../convex/_generated/dataModel';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

interface YearlyOverviewProps {
  completions: Doc<'completions'>[];
}

export function YearlyOverview({ completions }: YearlyOverviewProps) {
  const today = new Date();
  const endDate = endOfMonth(today);
  const startDate = startOfMonth(subMonths(today, 11));

  const months = eachMonthOfInterval({ start: startDate, end: endDate });
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const daysByMonth = months.map((month) => ({
    month,
    days: days.filter((day) => day.getMonth() === month.getMonth() && day.getFullYear() === month.getFullYear()),
  }));

  const monthsWithPadding = daysByMonth.map(({ month, days }) => ({
    month,
    days,
    emptyDays: Array(getDay(days[0])).fill(null),
  }));

  const completionsByDate = new Map<string, number>();
  completions.forEach((completion) => {
    const dateKey = new Date(completion.completedAt).toDateString();
    completionsByDate.set(dateKey, (completionsByDate.get(dateKey) || 0) + 1);
  });

  const getActivityLevel = (completions: number) => {
    if (completions === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (completions <= 2) return 'bg-emerald-200 dark:bg-emerald-900/30';
    if (completions <= 4) return 'bg-emerald-300 dark:bg-emerald-900/50';
    if (completions <= 6) return 'bg-emerald-400 dark:bg-emerald-900/70';
    return 'bg-emerald-500 dark:bg-emerald-900';
  };

  return (
    <TooltipProvider>
      <div className="space-y-2 rounded-lg border p-4">
        <h3 className="font-medium">Activity Overview</h3>
        <div className="flex flex-col gap-2">
          {/* Month labels */}
          <div className="grid grid-cols-12 gap-2 text-xs text-muted-foreground">
            {monthsWithPadding.map(({ month }) => (
              <div key={month.toISOString()} className="text-center">
                {format(month, 'MMM')}
              </div>
            ))}
          </div>
          {/* Calendar grid */}
          <div className="flex gap-2">
            {monthsWithPadding.map(({ month, days, emptyDays }) => (
              <div key={month.toISOString()} className="grid grid-cols-7 gap-[2px]">
                {emptyDays.map((_, index) => (
                  <div key={`empty-${index}`} className="h-3 w-3" />
                ))}
                {days.map((day) => {
                  const completionCount = completionsByDate.get(day.toDateString()) || 0;

                  return (
                    <Tooltip key={day.toISOString()}>
                      <TooltipTrigger asChild>
                        <div
                          className={`h-3 w-3 rounded-sm ${getActivityLevel(completionCount)}`}
                          data-date={format(day, 'yyyy-MM-dd')}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm">
                          {format(day, 'MMM d, yyyy')}: {completionCount} activities
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
