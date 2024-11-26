"use client";

import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, isToday, getDay } from "date-fns";
import { Doc } from "../../../../convex/_generated/dataModel";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface CalendarMonthProps {
  date: Date;
  completions: Doc<"completions">[];
  colorTheme: string;
  habits: Doc<"habits">[];
}

export function CalendarMonth({ date, completions, colorTheme, habits }: CalendarMonthProps) {
  const markComplete = useMutation(api.habits.markComplete);
  const deleteCompletion = useMutation(api.habits.deleteCompletion);

  const days = eachDayOfInterval({
    start: startOfMonth(date),
    end: endOfMonth(date),
  });

  // Calculate empty cells needed at start
  const firstDayOfMonth = getDay(startOfMonth(date));
  const emptyDays = Array(firstDayOfMonth).fill(null);

  const dayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const themes = {
    emerald: {
      20: "bg-emerald-100 dark:bg-emerald-900/30",
      40: "bg-emerald-200 dark:bg-emerald-900/50",
      60: "bg-emerald-300 dark:bg-emerald-900/70",
      80: "bg-emerald-400 dark:bg-emerald-900/85",
      100: "bg-emerald-500 dark:bg-emerald-900",
    },
    blue: {
      20: "bg-blue-100 dark:bg-blue-900/30",
      40: "bg-blue-200 dark:bg-blue-900/50",
      60: "bg-blue-300 dark:bg-blue-900/70",
      80: "bg-blue-400 dark:bg-blue-900/85",
      100: "bg-blue-500 dark:bg-blue-900",
    },
    indigo: {
      20: "bg-indigo-100 dark:bg-indigo-900/30",
      40: "bg-indigo-200 dark:bg-indigo-900/50",
      60: "bg-indigo-300 dark:bg-indigo-900/70",
      80: "bg-indigo-400 dark:bg-indigo-900/85",
      100: "bg-indigo-500 dark:bg-indigo-900",
    },
    violet: {
      20: "bg-violet-100 dark:bg-violet-900/30",
      40: "bg-violet-200 dark:bg-violet-900/50",
      60: "bg-violet-300 dark:bg-violet-900/70",
      80: "bg-violet-400 dark:bg-violet-900/85",
      100: "bg-violet-500 dark:bg-violet-900",
    },
    purple: {
      20: "bg-purple-100 dark:bg-purple-900/30",
      40: "bg-purple-200 dark:bg-purple-900/50",
      60: "bg-purple-300 dark:bg-purple-900/70",
      80: "bg-purple-400 dark:bg-purple-900/85",
      100: "bg-purple-500 dark:bg-purple-900",
    },
    pink: {
      20: "bg-pink-100 dark:bg-pink-900/30",
      40: "bg-pink-200 dark:bg-pink-900/50",
      60: "bg-pink-300 dark:bg-pink-900/70",
      80: "bg-pink-400 dark:bg-pink-900/85",
      100: "bg-pink-500 dark:bg-pink-900",
    },
    rose: {
      20: "bg-rose-100 dark:bg-rose-900/30",
      40: "bg-rose-200 dark:bg-rose-900/50",
      60: "bg-rose-300 dark:bg-rose-900/70",
      80: "bg-rose-400 dark:bg-rose-900/85",
      100: "bg-rose-500 dark:bg-rose-900",
    },
    red: {
      20: "bg-red-100 dark:bg-red-900/30",
      40: "bg-red-200 dark:bg-red-900/50",
      60: "bg-red-300 dark:bg-red-900/70",
      80: "bg-red-400 dark:bg-red-900/85",
      100: "bg-red-500 dark:bg-red-900",
    },
    orange: {
      20: "bg-orange-100 dark:bg-orange-900/30",
      40: "bg-orange-200 dark:bg-orange-900/50",
      60: "bg-orange-300 dark:bg-orange-900/70",
      80: "bg-orange-400 dark:bg-orange-900/85",
      100: "bg-orange-500 dark:bg-orange-900",
    },
    amber: {
      20: "bg-amber-100 dark:bg-amber-900/30",
      40: "bg-amber-200 dark:bg-amber-900/50",
      60: "bg-amber-300 dark:bg-amber-900/70",
      80: "bg-amber-400 dark:bg-amber-900/85",
      100: "bg-amber-500 dark:bg-amber-900",
    },
    yellow: {
      20: "bg-yellow-100 dark:bg-yellow-900/30",
      40: "bg-yellow-200 dark:bg-yellow-900/50",
      60: "bg-yellow-300 dark:bg-yellow-900/70",
      80: "bg-yellow-400 dark:bg-yellow-900/85",
      100: "bg-yellow-500 dark:bg-yellow-900",
    },
    lime: {
      20: "bg-lime-100 dark:bg-lime-900/30",
      40: "bg-lime-200 dark:bg-lime-900/50",
      60: "bg-lime-300 dark:bg-lime-900/70",
      80: "bg-lime-400 dark:bg-lime-900/85",
      100: "bg-lime-500 dark:bg-lime-900",
    },
    green: {
      20: "bg-green-100 dark:bg-green-900/30",
      40: "bg-green-200 dark:bg-green-900/50",
      60: "bg-green-300 dark:bg-green-900/70",
      80: "bg-green-400 dark:bg-green-900/85",
      100: "bg-green-500 dark:bg-green-900",
    },
    teal: {
      20: "bg-teal-100 dark:bg-teal-900/30",
      40: "bg-teal-200 dark:bg-teal-900/50",
      60: "bg-teal-300 dark:bg-teal-900/70",
      80: "bg-teal-400 dark:bg-teal-900/85",
      100: "bg-teal-500 dark:bg-teal-900",
    },
    cyan: {
      20: "bg-cyan-100 dark:bg-cyan-900/30",
      40: "bg-cyan-200 dark:bg-cyan-900/50",
      60: "bg-cyan-300 dark:bg-cyan-900/70",
      80: "bg-cyan-400 dark:bg-cyan-900/85",
      100: "bg-cyan-500 dark:bg-cyan-900",
    },
    sky: {
      20: "bg-sky-100 dark:bg-sky-900/30",
      40: "bg-sky-200 dark:bg-sky-900/50",
      60: "bg-sky-300 dark:bg-sky-900/70",
      80: "bg-sky-400 dark:bg-sky-900/85",
      100: "bg-sky-500 dark:bg-sky-900",
    },
  } as const;

  // Add type safety
  type ColorTheme = keyof typeof themes;

  return (
    <div className="mx-auto w-full max-w-[350px] space-y-1 sm:space-y-2">
      <h3 className="truncate text-xs font-medium sm:text-sm md:text-base">{format(date, "MMMM yyyy")}</h3>
      <div className="grid grid-cols-7 gap-[2px] sm:gap-1">
        {dayLabels.map((label) => (
          <div key={label} className="text-center text-[10px] text-muted-foreground sm:text-xs">
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
            if (!hasCompletion) return "bg-neutral-100 dark:bg-neutral-800";

            const percentage = (dayCompletions.length / (habits?.length || 1)) * 100;

            if (percentage <= 20) return themes[colorTheme as ColorTheme][20];
            if (percentage <= 40) return themes[colorTheme as ColorTheme][40];
            if (percentage <= 60) return themes[colorTheme as ColorTheme][60];
            if (percentage <= 80) return themes[colorTheme as ColorTheme][80];
            return themes[colorTheme as ColorTheme][100];
          };

          return (
            <Popover key={day.toISOString()}>
              <PopoverTrigger asChild>
                <button
                  className={`aspect-square w-full rounded p-0.5 text-center text-[10px] sm:p-1 sm:text-xs ${getBgColor()} ${
                    isToday(day) ? "ring-2 ring-ring" : ""
                  } transition-all duration-200 hover:brightness-110`}
                >
                  {format(day, "d")}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="space-y-2">
                  <h4 className="font-medium">{format(day, "MMMM d, yyyy")}</h4>
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
