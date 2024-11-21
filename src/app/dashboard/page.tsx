'use client';

import { SignedIn } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Doc } from '../../../convex/_generated/dataModel';

// Create a separate component for calendar stats
function CalendarStats({ calendar }: { calendar: Doc<'calendars'> }) {
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

  return (
    <Card className="p-6">
      <h3 className="mb-4 text-lg font-semibold">{calendar.name}</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total Habits</span>
          <span className="font-medium">{calendarHabits.length}</span>
        </div>
        {/* Add more calendar-specific stats here */}
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const calendars = useQuery(api.calendars.list);
  const stats = useQuery(api.habits.getDashboardStats);

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
        <h1 className="text-3xl font-bold">Dashboard</h1>

        {/* Overview Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Total Calendars</h3>
            <p className="mt-2 text-3xl font-bold">{calendars.length}</p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Weekly Completions</h3>
            <p className="mt-2 text-3xl font-bold">{stats.weeklyCompletions}</p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Completion Rate</h3>
            <p className="mt-2 text-3xl font-bold">{Math.round(stats.completionRate * 100)}%</p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Best Streak</h3>
            <p className="mt-2 text-3xl font-bold">{stats.bestStreak} days</p>
          </Card>
        </div>

        {/* Per Calendar Stats */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {calendars.map((calendar) => (
            <CalendarStats key={calendar._id} calendar={calendar} />
          ))}
        </div>
      </div>
    </SignedIn>
  );
}
