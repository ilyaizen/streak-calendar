'use client';

import { SignedIn, SignedOut } from '@clerk/nextjs';
import { HabitList } from '@/components/habits/habit-list';
import { CalendarView } from '@/components/habits/calendar/calendar-view';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Loader2 } from 'lucide-react';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';

export default function Home() {
  return (
    <div className="grid min-h-screen gap-16 p-8 pb-20 sm:p-20">
      <main className="space-y-16">
        <SignedIn>
          <HomeContent />
        </SignedIn>
        <SignedOut>
          <div className="text-center">
            <p className="mb-4 text-lg">Sign in to start tracking your habits</p>
          </div>
        </SignedOut>
      </main>
    </div>
  );
}

function HomeContent() {
  const habits = useQuery(api.habits.list);
  const today = new Date();
  const completions = useQuery(api.habits.getCompletions, {
    startDate: startOfMonth(subMonths(today, 2)).getTime(),
    endDate: endOfMonth(today).getTime(),
  });

  if (!habits || !completions) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <CalendarView completions={completions} />
      <HabitList habits={habits} />
    </>
  );
}
