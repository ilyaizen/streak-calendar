"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { eachDayOfInterval, eachMonthOfInterval, endOfMonth, format, getDay, startOfMonth, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { Doc } from "@server/convex/_generated/dataModel";

interface YearlyOverviewProps {
  completions: Doc<"completions">[];
}

export function YearlyOverview({ completions }: YearlyOverviewProps) {
  const t = useTranslations("habits");
  const [yearOffset, setYearOffset] = useState(0);
  const today = new Date();
  const endDate = endOfMonth(new Date(today.getFullYear() + yearOffset, today.getMonth(), 1));
  const startDate = startOfMonth(subMonths(endDate, 11));

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

  const isRTL = document.dir === "rtl";
  const displayMonths = isRTL ? [...monthsWithPadding].reverse() : monthsWithPadding;

  const completionsByDate = new Map<string, number>();
  completions.forEach((completion) => {
    const dateKey = new Date(completion.completedAt).toDateString();
    completionsByDate.set(dateKey, (completionsByDate.get(dateKey) || 0) + 1);
  });

  const getActivityLevel = (completions: number) => {
    if (completions === 0) return "bg-neutral-100 dark:bg-neutral-800";
    if (completions <= 2) return "bg-red-200 dark:bg-red-700/60";
    if (completions <= 4) return "bg-red-300 dark:bg-red-600/80";
    if (completions <= 6) return "bg-red-400 dark:bg-red-500/90";
    return "bg-red-500 dark:bg-red-400";
  };

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => {
      if (scrollRef.current) {
        const isRTL = document.dir === "rtl";
        scrollRef.current.scrollTo({
          left: isRTL ? 0 : scrollRef.current.scrollWidth,
          behavior: "instant",
        });
      }
    }, 0);
  }, []);

  return (
    <TooltipProvider>
      <Card className="mx-auto overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="font-medium sm:text-lg">
            {t("activityOverview")} - {format(endDate, "yyyy")}
          </h2>
          <div className="flex gap-1 h-fit">
            <Button variant="ghost" size="icon" onClick={() => setYearOffset((prev) => prev - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setYearOffset((prev) => prev + 1)}
              disabled={yearOffset >= 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div
            ref={scrollRef}
            className="overflow-x-auto pb-2 [direction:ltr] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:h-1.5"
          >
            <div className="min-w-[768px] sm:min-w-[900px]">
              <div className="flex flex-col gap-3">
                <div className="flex gap-3 text-sm text-muted-foreground">
                  {displayMonths.map(({ month }) => (
                    <div key={month.toISOString()} className="w-[100px] text-center">
                      {format(month, "MMM")}
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  {displayMonths.map(({ month, days, emptyDays }) => (
                    <div key={month.toISOString()} className="grid w-[100px] grid-cols-7 gap-[2px]">
                      {emptyDays.map((_, index) => (
                        <div key={`empty-${index}`} className="h-[7px] w-[7px]" />
                      ))}
                      {days.map((day) => {
                        const completionCount = completionsByDate.get(day.toDateString()) || 0;
                        return (
                          <Tooltip key={day.toISOString()}>
                            <TooltipTrigger asChild>
                              <div
                                className={`h-[7px] w-[7px] rounded-sm ${getActivityLevel(completionCount)}`}
                                data-date={format(day, "yyyy-MM-dd")}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-sm">
                                {format(day, "MMM d, yyyy")}: {completionCount} activities
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
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
