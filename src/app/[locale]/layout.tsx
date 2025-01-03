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
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6572203520543320"
          crossOrigin="anonymous"
        ></Script>
      </head>
      <body className="flex min-h-full flex-col overflow-x-hidden">
        <Providers locale={locale} messages={messages}>
          <Header />
          <div className="w-full bg-red-600 p-4 text-center">
            <h1 className="text-3xl font-black text-white">⚠️ IMPORTANT NOTICE ⚠️</h1>
            <p className="text-xl font-bold text-white">
              This version will be deprecated soon. Please backup your data using the export/import feature before the
              upgrade.
            </p>
          </div>
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
