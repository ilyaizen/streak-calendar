'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

export function LanguageToggle() {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = useLocale();

  const handleLanguageChange = () => {
    const newLocale = currentLocale === 'en' ? 'he' : 'en';

    // Split the pathname into segments
    const segments = pathname.split('/');

    // Find the locale segment index (it might be at index 1 or not present)
    const localeIndex = segments.findIndex((segment) => ['en', 'he'].includes(segment));

    if (localeIndex === -1) {
      // No locale in path, add it after the first segment (which is empty)
      segments.splice(1, 0, newLocale);
    } else {
      // Replace existing locale
      segments[localeIndex] = newLocale;
    }

    // Reconstruct the path
    const newPath = segments.join('/');

    router.push(newPath);
  };

  return (
    <div onClick={handleLanguageChange} className="flex h-9 cursor-pointer items-center justify-center">
      {currentLocale === 'en' ? 'עברית' : 'English'}
    </div>
  );
}
