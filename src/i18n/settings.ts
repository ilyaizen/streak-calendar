export const locales = ['en', 'he'] as const;
export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number];
