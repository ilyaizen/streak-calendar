import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { LanguageToggle } from "./language-toggle";

export function Footer() {
  const t = useTranslations("footer");
  const locale = useLocale();

  return (
    <footer className="border-t dark:border-neutral-800">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-4 text-xs text-neutral-600 dark:text-neutral-400 sm:text-sm">
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
          <LanguageToggle />
        </div>
      </div>
    </footer>
  );
}
