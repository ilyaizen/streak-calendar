'use client';

import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { HabitList } from '@/components/habits/habit-list';
import { CalendarView } from '@/components/habits/calendar/calendar-view';

export default function Home() {
  return (
    <div className="grid min-h-screen gap-16 p-8 pb-20 sm:p-20">
      <header className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Streak Calendar</h1>
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </header>

      <main className="space-y-16">
        <SignedIn>
          <HabitList />
          <CalendarView />
        </SignedIn>
        <SignedOut>
          <div className="text-center">
            <p className="mb-4 text-lg">Sign in to start tracking your habits</p>
            <SignInButton />
          </div>
        </SignedOut>
      </main>
    </div>
  );
}
