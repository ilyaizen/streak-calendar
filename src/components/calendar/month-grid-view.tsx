import { Button } from "@/components/ui/button";
import { CompleteControls } from "@/components/ui/complete-controls";
import { useMobile } from "@/hooks/use-mobile";
import { getCompletionCount } from "@/utils/completion-utils";
import { format } from "date-fns";
import { PlusCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Id } from "@server/convex/_generated/dataModel";

import { DayCell } from "./day-cell";

/**
 * Grid view component for displaying habits in a traditional calendar layout.
 * Shows multiple months with day cells arranged in a 7-column grid.
 * Supports habit completion tracking and mobile-responsive layout.
 */

/**
 * Props interface for the MonthGridView component
 */
interface MonthGridViewProps {
  /** Primary habit for the calendar */
  habit: {
    _id: Id<"habits">;
    name: string;
    timerDuration?: number;
    position?: number;
  };
  /** Color theme for the calendar */
  color: string;
  /** Array of dates to display */
  days: string[];
  /** Array of habit completion records */
  completions: Array<{
    habitId: Id<"habits">;
    completedAt: number;
  }>;
  /** Callback for toggling habit completion */
  onToggle: (habitId: Id<"habits">, date: string, count: number) => Promise<void>;
  /** Callback for editing habit properties */
  onEditHabit: (habit: { _id: Id<"habits">; name: string; timerDuration?: number }) => void;
  /** Array of all habits in the calendar */
  habits: Array<{
    _id: Id<"habits">;
    name: string;
    timerDuration?: number;
    position?: number;
  }>;
  /** Callback for adding a new habit */
  onAddHabit: () => void;
}

export function MonthGridView({
  color,
  days,
  completions,
  onToggle,
  onEditHabit,
  habits,
  onAddHabit,
}: MonthGridViewProps) {
  const t = useTranslations("calendar");
  const [loadingState, setLoadingState] = useState<{ habitId: Id<"habits">; date: string } | null>(null);

  const handleToggle = async (habitId: Id<"habits">, date: string, count: number) => {
    setLoadingState({ habitId, date });
    try {
      await onToggle(habitId, date, count);
    } finally {
      setLoadingState(null);
    }
  };

  return (
    <div className="space-y-4">
      {[...habits]
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        .map((habit) => {
          // Calculate today's completion count for the habit
          const today = new Date().toISOString().split("T")[0];
          const todayCount = Array.isArray(completions)
            ? completions.filter(
                (c) => c.habitId === habit._id && new Date(c.completedAt).toISOString().split("T")[0] === today
              ).length
            : 0;

          return (
            // TODO: 2025-01-07 - empty classes are unacceptable
            <div key={habit._id} className="">
              {/* Habit header with name and timer duration */}
              <div className="flex justify-center pt-8">
                <div className="flex items-baseline pb-2">
                  <div className="cursor-pointer" onClick={() => onEditHabit(habit)}>
                    <h3
                      className={`select-none text-2xl font-medium underline decoration-wavy decoration-2 ${color.replace(
                        "bg-",
                        "decoration-"
                      )}/30 hover:text-muted-foreground hover:no-underline`}
                    >
                      {habit.name}
                    </h3>
                  </div>
                  {habit.timerDuration && (
                    <span className="ml-1 text-sm text-muted-foreground">({habit.timerDuration}m)</span>
                  )}
                </div>
              </div>
              {/* Today's completion controls */}
              <div className="flex justify-center pb-4">
                <CompleteControls
                  count={todayCount}
                  onIncrement={() => handleToggle(habit._id, today, todayCount + 1)}
                  onDecrement={() => handleToggle(habit._id, today, todayCount - 1)}
                  habitId={habit._id}
                  variant="default"
                  timerDuration={habit.timerDuration}
                  habitName={habit.name}
                  disabled={loadingState?.habitId === habit._id}
                />
              </div>
              {/* Monthly calendar grid */}
              <MonthGridCalendar
                habit={habit}
                color={color}
                days={days}
                completions={completions}
                onToggle={handleToggle}
                loadingState={loadingState}
              />
            </div>
          );
        })}
      {/* Add habit button */}
      <div className="flex justify-center pb-8">
        <Button variant="outline" size="sm" onClick={onAddHabit}>
          <PlusCircle className="h-4 w-4" />
          {t("controls.addHabit")}
        </Button>
      </div>
    </div>
  );
}

/**
 * Props interface for the MonthGridCalendar subcomponent
 */
interface MonthGridCalendarProps {
  /** Habit to display in the calendar */
  habit: {
    _id: Id<"habits">;
    name: string;
    timerDuration?: number;
  };
  /** Color theme for the calendar */
  color: string;
  /** Array of dates to display */
  days: string[];
  /** Array of habit completion records */
  completions: Array<{
    habitId: Id<"habits">;
    completedAt: number;
  }>;
  /** Callback for toggling habit completion */
  onToggle: (habitId: Id<"habits">, date: string, count: number) => Promise<void>;
  loadingState: { habitId: Id<"habits">; date: string } | null;
}

/**
 * Subcomponent that renders the actual calendar grid for a habit
 * Handles month calculation, day padding, and responsive layout
 */
function MonthGridCalendar({ habit, color, days, completions, onToggle, loadingState }: MonthGridCalendarProps) {
  const isMobile = useMobile();
  const t = useTranslations("calendar");

  // Calculate months to display based on the most recent date
  const mostRecentDate = new Date(Math.max(...days.map((d) => new Date(d).getTime())));
  const months: Record<string, string[]> = {};
  const monthsToShow = isMobile ? 1 : 3;

  // Generate month data for display
  for (let i = 0; i < monthsToShow; i++) {
    const currentDate = new Date(mostRecentDate.getFullYear(), mostRecentDate.getMonth() - i, 1);
    const monthKey = format(currentDate, "yyyy-MM");
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

    // Create array of dates for the month
    months[monthKey] = Array.from({ length: daysInMonth }, (_, j) => {
      const day = new Date(currentDate.getFullYear(), currentDate.getMonth(), j + 1);
      return format(day, "yyyy-MM-dd");
    });
  }

  const sortedMonths = Object.entries(months).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div
      data-habit-id={habit._id}
      className="w-full space-y-8 md:grid md:grid-cols-2 md:gap-8 md:space-y-0 lg:grid-cols-3"
    >
      {sortedMonths.map(([monthKey, monthDays]) => {
        // Calculate padding days for proper grid alignment
        const firstDay = new Date(monthDays[0]);
        const lastDay = new Date(monthDays[monthDays.length - 1]);
        const startPadding = firstDay.getDay();
        const endPadding = 6 - lastDay.getDay();
        const emptyStartDays = Array(startPadding).fill(null);
        const emptyEndDays = Array(endPadding).fill(null);

        // Get localized day and month names
        const dayLabels = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"].map((d) => t(`weekDays.${d}`));
        const monthName = t(`monthNames.${format(firstDay, "MMMM").toLowerCase()}`);
        const year = format(firstDay, "yyyy");

        return (
          <div key={monthKey} className="mx-auto w-fit space-y-4">
            {/* Month and year header */}
            <h3 className="font-medium">{`${monthName} ${year}`}</h3>
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-[1px]">
              {/* Day name labels */}
              {dayLabels.map((label) => (
                <div key={label} className="text-center text-sm text-muted-foreground">
                  {label}
                </div>
              ))}
              {/* Empty cells for start padding */}
              {emptyStartDays.map((_, index) => (
                <div key={`empty-start-${index}`} className="h-[48px] w-[48px] p-0">
                  <div className="h-full w-full" />
                </div>
              ))}
              {/* Day cells with completion tracking */}
              {monthDays.map((dateStr) => {
                const isInRange = days.includes(dateStr);
                const count = isInRange ? getCompletionCount(dateStr, habit._id, completions) : 0;

                return (
                  <div key={dateStr} className="h-[48px] w-[48px] p-0">
                    <div className="h-full w-full">
                      <DayCell
                        habitId={habit._id}
                        date={dateStr}
                        count={count}
                        onCountChange={(newCount) => onToggle(habit._id, dateStr, newCount)}
                        colorClass={color}
                        size="large"
                        disabled={!isInRange}
                        isUpdating={loadingState?.habitId === habit._id && loadingState?.date === dateStr}
                      />
                    </div>
                  </div>
                );
              })}
              {/* Empty cells for end padding */}
              {emptyEndDays.map((_, index) => (
                <div key={`empty-end-${index}`} className="h-[48px] w-[48px] p-0">
                  <div className="h-full w-full" />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
