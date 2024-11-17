'use client';

import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Card } from '@/components/ui/card';
import { SignedIn } from '@clerk/nextjs';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2 } from 'lucide-react';

export default function StatsPage() {
  const habits = useQuery(api.habits.list);
  const stats = useQuery(api.habits.getDetailedStats);

  if (!habits || !stats) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Calculate completion distribution by day of week
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayDistribution = stats.dayDistribution.map((count, index) => ({
    name: dayNames[index],
    completions: count,
  }));

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
            <p className="mt-2 text-3xl font-bold">{dayNames[stats.mostProductiveDay]}</p>
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

        {/* Day of Week Distribution */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Completions by Day of Week</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dayDistribution}>
                <XAxis dataKey="name" tickFormatter={(value) => value.slice(0, 3)} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completions" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Habit Performance Table */}
        <Card>
          <div className="p-6">
            <h2 className="mb-4 text-lg font-semibold">Individual Habit Stats</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-sm text-muted-foreground">
                    <th className="pb-3 text-left font-medium">Habit</th>
                    <th className="pb-3 text-right font-medium">Success Rate</th>
                    <th className="pb-3 text-right font-medium">Best Day</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.habitStats.map((habit) => (
                    <tr key={habit.id} className="border-b last:border-0">
                      <td className="py-3">{habit.name}</td>
                      <td className="py-3 text-right">{Math.round(habit.successRate * 100)}%</td>
                      <td className="py-3 text-right">{dayNames[habit.bestDay].slice(0, 3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </div>
    </SignedIn>
  );
}
