'use client';

import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';

export default function Home() {
  return (
    <div className="grid min-h-screen gap-16 p-8 pb-20 sm:p-20">
      <main className="flex flex-col items-center gap-8 sm:items-start">
        <h1 className="text-4xl font-bold">Hello World</h1>
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </main>
    </div>
  );
}
