import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';
import { CalendarCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { LanguageToggle } from '@/components/layout/language-toggle';

export function Header() {
  const t = useTranslations('app');

  return (
    <header className="border-b">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="rounded-full bg-primary p-1">
            <CalendarCheck className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">{t('name')}</span>
        </Link>

        <div className="flex items-center gap-4">
          <LanguageToggle />
          <ThemeToggle />
          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
