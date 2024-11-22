'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useLocale } from 'next-intl';

export function LanguageToggle() {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = useLocale();

  const handleLanguageChange = () => {
    const newLocale = currentLocale === 'en' ? 'he' : 'en';

    // Split the pathname into segments
    const segments = pathname.split('/');

    // The first segment after splitting will be empty (because pathname starts with /)
    // The second segment should be the locale
    segments[1] = newLocale;

    // Reconstruct the path
    const newPath = segments.join('/');

    router.push(newPath);
  };

  return (
    <Button variant="ghost" onClick={handleLanguageChange} className="h-9 px-3">
      {currentLocale === 'en' ? 'עברית' : 'English'}
    </Button>
  );
}
