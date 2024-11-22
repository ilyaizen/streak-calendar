'use client';

import { SignedIn, SignedOut } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations('home');

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="py-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">{t('title')}</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">{t('subtitle')}</p>
        <div className="mt-10">
          <SignedOut>
            <Button size="lg" asChild>
              <Link href="/sign-up">{t('getStarted')}</Link>
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
