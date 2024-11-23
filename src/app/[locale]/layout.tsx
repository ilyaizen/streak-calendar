import { setRequestLocale } from 'next-intl/server';
import { locales, Locale } from '@/i18n/settings';
import { Providers } from './providers';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';
import { notFound } from 'next/navigation';
import '../globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.streakcalendar.com'),
  title: 'Streak Calendar',
  description: 'Track your habits and improve your life',
  keywords: ['habit tracking', 'streak calendar', 'productivity'],
  openGraph: {
    title: 'Streak Calendar',
    description: 'Track your habits and improve your life',
    images: ['/og-image.png'],
    type: 'website',
    siteName: 'Streak Calendar',
    url: 'https://www.streakcalendar.com',
  },
  manifest: '/manifest.json',
  viewport: 'width=device-width, initial-scale=0.8',
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale as Locale)) notFound();

  setRequestLocale(locale);

  let messages;
  try {
    messages = (await import(`@/messages/${locale}.json`)).default;
  } catch {
    notFound();
  }

  return (
    <html lang={locale} dir={locale === 'he' ? 'rtl' : 'ltr'} className="h-full" suppressHydrationWarning>
      <body className="flex min-h-full flex-col">
        <Providers locale={locale} messages={messages}>
          <Header />
          <main className="mx-auto max-w-7xl">{children}</main>
          <Toaster />
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
