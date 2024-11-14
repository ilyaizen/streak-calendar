'use client';

import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Card } from '@/components/ui/card';
import { SignedIn } from '@clerk/nextjs';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const habits = useQuery(api.habits.list);
  const stats = useQuery(api.habits.getDashboardStats);

  if (!habits || !stats) {
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
            <h3 className="text-sm font-medium text-muted-foreground">Total Habits</h3>
            <p className="mt-2 text-3xl font-bold">{habits.length}</p>
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

        {/* Completion Trend Chart */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Weekly Completion Trend</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.weeklyTrend}>
                <XAxis dataKey="week" tickFormatter={(value) => format(new Date(value), 'MMM d')} />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return `Week of ${format(date, 'MMM d')} - ${format(endOfWeek(date), 'MMM d')}`;
                  }}
                />
                <Line type="monotone" dataKey="completions" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Habit Performance Table */}
        <Card>
          <div className="p-6">
            <h2 className="mb-4 text-lg font-semibold">Habit Performance</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-sm text-muted-foreground">
                    <th className="pb-3 text-left font-medium">Habit</th>
                    <th className="pb-3 text-right font-medium">Target</th>
                    <th className="pb-3 text-right font-medium">Current Streak</th>
                    <th className="pb-3 text-right font-medium">Completion Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.habitStats.map((habit) => (
                    <tr key={habit.id} className="border-b last:border-0">
                      <td className="py-3">{habit.name}</td>
                      <td className="py-3 text-right">{habit.targetFrequency}x / week</td>
                      <td className="py-3 text-right">{habit.currentStreak} days</td>
                      <td className="py-3 text-right">{Math.round(habit.completionRate * 100)}%</td>
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
