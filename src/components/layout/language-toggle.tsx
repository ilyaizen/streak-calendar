"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocale } from "next-intl";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

const languages = {
  en: { name: "English", flagSrc: "/flag-us.png" },
  ru: { name: "Русский", flagSrc: "/flag-ru.png" },
  he: { name: "עברית", flagSrc: "/flag-il.png" },
} as const;

export function LanguageToggle() {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = useLocale();

  const handleLanguageChange = (newLocale: string) => {
    // Split the pathname into segments
    const segments = pathname.split("/");

    // Find the locale segment index (it might be at index 1 or not present)
    const localeIndex = segments.findIndex((segment) => ["en", "he", "ru"].includes(segment));

    if (localeIndex === -1) {
      // No locale in path, add it after the first segment (which is empty)
      segments.splice(1, 0, newLocale);
    } else {
      // Replace existing locale
      segments[localeIndex] = newLocale;
    }

    // Reconstruct the path
    const newPath = segments.join("/");

    router.push(newPath);
  };

  return (
    <Select value={currentLocale} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[140px]">
        <SelectValue>
          <span className="flex items-center gap-2">
            <Image
              src={languages[currentLocale as keyof typeof languages].flagSrc}
              alt=""
              width={20}
              height={15}
              className="object-cover"
            />
            <span>{languages[currentLocale as keyof typeof languages].name}</span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(languages).map(([code, { name, flagSrc }]) => (
          <SelectItem key={code} value={code}>
            <span className="flex items-center gap-2">
              <Image src={flagSrc} alt="" width={20} height={15} className="object-cover" />
              <span>{name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
