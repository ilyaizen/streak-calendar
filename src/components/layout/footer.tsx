import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { LanguageToggle } from "./language-toggle";

export function Footer() {
  const t = useTranslations("footer");
  const currentYear = new Date().getFullYear();
  const locale = useLocale();

  return (
    <footer className="border-t dark:border-neutral-800">
      <div className="h-50 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full flex-wrap gap-4 text-xs text-neutral-600 dark:text-neutral-400 sm:text-sm">
            <Link href={`/${locale}/about`} className="hover:text-neutral-900 dark:hover:text-neutral-200">
              {t("about")}
            </Link>
            <Link href={`/${locale}/privacy`} className="hover:text-neutral-900 dark:hover:text-neutral-200">
              {t("privacy")}
            </Link>
            <Link href={`/${locale}/terms`} className="hover:text-neutral-900 dark:hover:text-neutral-200">
              {t("terms")}
            </Link>
          </div>
          <div className="flex w-full items-center justify-between gap-4">
            <p className="text-xs text-neutral-600 dark:text-neutral-400 sm:text-sm">
              © {currentYear} {t("copyright")}
            </p>
            <LanguageToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
