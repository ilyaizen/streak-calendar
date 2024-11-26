export const locales = ["en", "he", "ru"] as const;
export const defaultLocale = "en" as const;

export type Locale = (typeof locales)[number];
