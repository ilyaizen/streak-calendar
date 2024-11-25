'use client';

import { SignedIn, SignedOut } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { Calendar, Clock, LineChart, Trophy } from 'lucide-react';

export default function Home() {
  const t = useTranslations('home');

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="py-20 text-center">
        <h1 className="whitespace-pre-line text-4xl font-bold tracking-tight sm:text-6xl">{t('title')}</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">{t('subtitle')}</p>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col items-center">
            <div className="rounded-lg bg-primary/10 p-3 ring-1 ring-primary/20">
              <Calendar className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-semibold">{t('hero.features.0')}</h3>
          </div>

          <div className="flex flex-col items-center">
            <div className="rounded-lg bg-primary/10 p-3 ring-1 ring-primary/20">
              <Clock className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-semibold">{t('hero.features.1')}</h3>
          </div>

          <div className="flex flex-col items-center">
            <div className="rounded-lg bg-primary/10 p-3 ring-1 ring-primary/20">
              <LineChart className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-semibold">{t('hero.features.2')}</h3>
          </div>

          <div className="flex flex-col items-center">
            <div className="rounded-lg bg-primary/10 p-3 ring-1 ring-primary/20">
              <Trophy className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-semibold">{t('hero.features.3')}</h3>
          </div>
        </div>

        <div className="mt-10">
          <SignedOut>
            <Button size="lg" asChild>
              <Link href="https://accounts.streakcalendar.com/sign-up">{t('getStarted')}</Link>
            </Button>
          </SignedOut>
          <SignedIn>
            <Button size="lg" asChild>
              <Link href="/calendar">{t('goToCalendar')}</Link>
            </Button>
          </SignedIn>
        </div>
      </div>
    </div>
  );
}
