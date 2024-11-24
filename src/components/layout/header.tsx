import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';
import { LanguageToggle } from '@/components/layout/language-toggle';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

export function Header() {
  const t = useTranslations('app');

  return (
    <header className="border-b">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="rounded-full bg-purple-500 p-1">
            <Image src="/logo.svg" alt="Logo" width={24} height={24} className="h-6 w-6 text-primary-foreground" />
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
