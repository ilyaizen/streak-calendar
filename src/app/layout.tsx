import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'Streak Calendar',
  description: 'Track your habits and improve your life',
  keywords: ['habit tracking', 'streak calendar', 'productivity'],
  openGraph: {
    title: 'Streak Calendar',
    description: 'Track your habits and improve your life',
    images: ['/og-image.png'],
    type: 'website',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="flex min-h-full flex-col">
        <Providers>
          <Header />
          <main className="mx-auto max-w-7xl">{children}</main>
          <Toaster />
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
