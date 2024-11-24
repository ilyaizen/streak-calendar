import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { LanguageToggle } from './language-toggle';

export function Footer() {
  const t = useTranslations('footer');
  const currentYear = new Date().getFullYear();
  const locale = useLocale();

  return (
    <footer className="border-t dark:border-gray-800">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex gap-6 text-sm text-gray-600 dark:text-gray-400">
            <Link href={`/${locale}/about`} className="hover:text-gray-900 dark:hover:text-gray-200">
              {t('about')}
            </Link>
            <Link href={`/${locale}/privacy`} className="hover:text-gray-900 dark:hover:text-gray-200">
              {t('privacy')}
            </Link>
            <Link href={`/${locale}/terms`} className="hover:text-gray-900 dark:hover:text-gray-200">
              {t('terms')}
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {currentYear} {t('copyright')}
            </p>
            <LanguageToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
