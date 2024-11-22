import { clerkMiddleware } from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/settings';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
});

export default clerkMiddleware((auth, req) => {
  return intlMiddleware(req);
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!.+\\.[\\w]+$|_next).*)',
    // But include all api routes
    '/(api|trpc)(.*)',
  ],
};
