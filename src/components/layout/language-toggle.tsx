'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useLocale } from 'next-intl';
import { locales } from '@/i18n/settings';

export function LanguageToggle() {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = useLocale();

  const handleLanguageChange = () => {
    // Get the new locale (toggle between 'en' and 'he')
    const newLocale = currentLocale === 'en' ? 'he' : 'en';

    // Remove the current locale from pathname if it exists
    let newPath = pathname;
    locales.forEach((locale) => {
      if (newPath.startsWith(`/${locale}`)) {
        newPath = newPath.substring(locale.length + 1) || '/';
      }
    });

    // Add the new locale to the path
    newPath = newPath === '/' ? `/${newLocale}` : `/${newLocale}${newPath}`;

    router.push(newPath);
  };

  return (
    <Button variant="ghost" onClick={handleLanguageChange} className="h-9 px-3">
      {currentLocale === 'en' ? 'עברית' : 'English'}
    </Button>
  );
}
