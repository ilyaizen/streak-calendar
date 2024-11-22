import Link from 'next/link';
import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('footer');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t dark:border-gray-800">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex gap-6 text-sm text-gray-600 dark:text-gray-400">
            <Link href="/about" className="hover:text-gray-900 dark:hover:text-gray-200">
              {t('about')}
            </Link>
            <Link href="/privacy" className="hover:text-gray-900 dark:hover:text-gray-200">
              {t('privacy')}
            </Link>
            <Link href="/terms" className="hover:text-gray-900 dark:hover:text-gray-200">
              {t('terms')}
            </Link>
            <a
              href="https://github.com/ilyaizen/streak-calendar"
              className="hover:text-gray-900 dark:hover:text-gray-200"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('github')}
            </a>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © {currentYear} {t('copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}
