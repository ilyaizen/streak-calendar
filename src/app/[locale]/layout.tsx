import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Toaster } from "@/components/ui/toaster";
import { Locale, locales } from "@/i18n/settings";
import type { Metadata, Viewport } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Script from "next/script";

import "../globals.css";
import { Providers } from "./providers";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.streakcalendar.com"),
  title: "Streak Calendar",
  description: "Track your habits and improve your life",
  keywords: ["habit tracking", "streak calendar", "productivity"],
  openGraph: {
    title: "Streak Calendar",
    description: "Track your habits and improve your life",
    images: ["/og-image.png"],
    type: "website",
    siteName: "Streak Calendar",
    url: "https://www.streakcalendar.com",
  },
  manifest: "/manifest.json",
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
    <html lang={locale} dir={locale === "he" ? "rtl" : "ltr"} className="h-full" suppressHydrationWarning>
      <head>
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-M08NN7869T" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-M08NN7869T');
          `}
        </Script>
      </head>
      <body className="flex min-h-full flex-col overflow-x-hidden">
        <Providers locale={locale} messages={messages}>
          <Header />
          <main role="main" className="mx-auto w-full max-w-5xl px-4 py-8 pt-8 sm:px-6 lg:px-8">
            {children}
          </main>
          <Toaster />
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
