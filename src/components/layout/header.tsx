import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';
import { CalendarCheck } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-primary p-1">
            <CalendarCheck className="h-6 w-6 text-primary-foreground" />
          </div>
          <Link href="/" className="text-xl font-bold">
            Streak Calendar
          </Link>
        </div>

        <SignedIn>
          <nav className="hidden items-center gap-4 sm:flex">
            <Link href="/calendar" className="text-sm text-muted-foreground hover:text-foreground">
              Calendar
            </Link>
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
              Dashboard
            </Link>
            <Link href="/stats" className="text-sm text-muted-foreground hover:text-foreground">
              Stats
            </Link>
          </nav>
        </SignedIn>

        <div className="flex items-center gap-4">
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
