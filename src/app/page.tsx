'use client';

import { SignedIn, SignedOut } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CalendarCheck, LineChart, Target } from 'lucide-react';

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="py-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Track Your Habits,
          <br />
          Build Better Routines
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Simple, visual habit tracking that helps you build consistency and achieve your goals. Don&apos;t break the
          chain and watch your streaks grow.
        </p>
        <div className="mt-10">
          <SignedOut>
            <Button size="lg" asChild>
              <Link href="/sign-up">Get Started Free</Link>
            </Button>
          </SignedOut>
          <SignedIn>
            <Button size="lg" asChild>
              <Link href="/calendar">Go to Calendar</Link>
            </Button>
          </SignedIn>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <div className="grid gap-12 sm:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
              <CalendarCheck className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Visual Calendar</h3>
            <p className="text-muted-foreground">Track your progress with a simple, visual calendar interface</p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
              <Target className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Weekly Goals</h3>
            <p className="text-muted-foreground">Set and track weekly frequency targets for each habit</p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
              <LineChart className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Detailed Stats</h3>
            <p className="text-muted-foreground">Get insights into your habits with detailed statistics</p>
          </div>
        </div>
      </div>
    </div>
  );
}
