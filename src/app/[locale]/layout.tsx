import { setRequestLocale } from 'next-intl/server';
import { locales, Locale } from '@/i18n/settings';
import { Providers } from './providers';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';
import { notFound } from 'next/navigation';
import '../globals.css';

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
