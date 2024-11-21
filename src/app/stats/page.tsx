'use client';

import { SignedIn } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Doc } from '../../../convex/_generated/dataModel';

interface HabitStats {
  id: string;
  name: string;
  successRate: number;
  bestTimeOfDay: string;
}

interface DetailedStats {
  habitStats: HabitStats[];
  averageDailyCompletions: number;
  mostProductiveDay: number;
  perfectDays: number;
  currentStreak: number;
}

// Create a separate component for calendar stats
function CalendarStats({ calendar, stats }: { calendar: Doc<'calendars'>; stats: DetailedStats }) {
  const calendarHabits = useQuery(api.habits.list, { calendarId: calendar._id });

  if (!calendarHabits) {
    return (
      <Card className="p-6">
        <div className="flex h-20 items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  const habitStats = stats.habitStats.filter((stat: HabitStats) =>
    calendarHabits.some((habit) => habit._id === stat.id)
  );

  return (
    <Card className="p-6">
      <h3 className="mb-4 text-lg font-semibold">{calendar.name}</h3>
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total Habits</span>
          <span className="font-medium">{calendarHabits.length}</span>
        </div>
        {habitStats.map((stat: HabitStats) => (
          <div key={stat.id} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{stat.name}</span>
              <span className="text-muted-foreground">{Math.round(stat.successRate * 100)}% success</span>
            </div>
            <div className="text-xs text-muted-foreground">Best time: {stat.bestTimeOfDay}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function StatsPage() {
  const calendars = useQuery(api.calendars.list);
  const stats = useQuery(api.habits.getDetailedStats);

  if (!calendars || !stats) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <SignedIn>
      <div className="mx-auto max-w-7xl space-y-8 p-8">
        <h1 className="text-3xl font-bold">Statistics</h1>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Average Daily Completions</h3>
            <p className="mt-2 text-3xl font-bold">{stats.averageDailyCompletions.toFixed(1)}</p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Most Productive Day</h3>
            <p className="mt-2 text-3xl font-bold">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][stats.mostProductiveDay]}
            </p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Perfect Days</h3>
            <p className="mt-2 text-3xl font-bold">{stats.perfectDays}</p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Current Streak</h3>
            <p className="mt-2 text-3xl font-bold">{stats.currentStreak} days</p>
          </Card>
        </div>

        {/* Per Calendar Stats */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {calendars.map((calendar) => (
            <CalendarStats key={calendar._id} calendar={calendar} stats={stats} />
          ))}
        </div>
      </div>
    </SignedIn>
  );
}
