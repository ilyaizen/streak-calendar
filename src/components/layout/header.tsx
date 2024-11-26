import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

export function Header() {
  const t = useTranslations("app");
  const locale = useLocale();

  return (
    <header className="border-b">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <div className="rounded-full bg-purple-500 p-1">
            <Image src="/logo.svg" alt={t("name")} width={24} height={24} className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">{t("name")}</span>
        </Link>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
