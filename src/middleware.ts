import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";
import { NextRequest } from "next/server";

import { defaultLocale, locales } from "./i18n/settings";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

// Define protected routes
const isProtectedRoute = createRouteMatcher(["/calendar(.*)", "/habits(.*)"]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { pathname } = req.nextUrl;

  // Skip middleware for static files and Next.js internals
  if (pathname.startsWith("/_next") || /\.(png|jpe?g|svg|ico|webp|woff2?|css|js|map)$/i.test(pathname)) {
    return;
  }

  // Protect specific routes
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
