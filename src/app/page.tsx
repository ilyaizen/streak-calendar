'use client';

import { SignedIn, SignedOut } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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
    </div>
  );
}
