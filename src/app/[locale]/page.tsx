"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CustomCalendarIcon } from "@/components/ui/custom-calendar-icon";
import { CustomTodoIcon } from "@/components/ui/custom-todo-icon";
import { XLogo } from "@/components/ui/x-logo";
import { Link } from "@/i18n/routing";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Activity, Timer } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

export default function Home() {
  const t = useTranslations("home");

  return (
    <div className="flex flex-col items-center justify-center space-y-16 px-4 py-16 text-center">
      <div className="max-w-lg">
        <h1 className="mb-4 text-2xl font-bold md:text-4xl">{t("hero.title")}</h1>
        <p className="mx-auto max-w-[600px] text-muted-foreground md:text-lg">{t("hero.subtitle")}</p>
      </div>

      <div className="mx-auto grid max-w-xs grid-cols-1 gap-8 px-4 md:max-w-3xl md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2 text-center">
          <CustomCalendarIcon className="mx-auto mb-2 h-8 w-8 text-primary" />
          <h3 className="font-semibold">{t("hero.features.visualTracking.title")}</h3>
          <p className="text-sm text-muted-foreground">
            {t("hero.features.visualTracking.description.part1")} <XLogo className="inline h-4 w-4 fill-red-500" />{" "}
            {t("hero.features.visualTracking.description.part2")}
          </p>
        </div>
        <div className="space-y-2 text-center">
          <CustomTodoIcon className="mx-auto mb-2 h-8 w-8 text-primary" />
          <h3 className="font-semibold">{t("hero.features.multiHabit.title")}</h3>
          <p className="text-sm text-muted-foreground">{t("hero.features.multiHabit.description")}</p>
        </div>
        <div className="space-y-2 text-center">
          <Activity className="mx-auto mb-2 h-8 w-8 text-primary" />
          <h3 className="font-semibold">{t("hero.features.yearlyGrid.title")}</h3>
          <p className="text-sm text-muted-foreground">{t("hero.features.yearlyGrid.description")}</p>
        </div>
        <div className="space-y-2 text-center">
          <Timer className="mx-auto mb-2 h-8 w-8 text-primary" />
          <h3 className="font-semibold">{t("hero.features.timedTasks.title")}</h3>
          <p className="text-sm text-muted-foreground">{t("hero.features.timedTasks.description")}</p>
        </div>
      </div>

      <div className="space-y-4">
        <p className="hidden text-xs text-muted-foreground md:block md:text-sm">{t("hero.motivation")}</p>

        <SignedIn>
          <div className="flex justify-center">
            <Button asChild size="lg">
              <Link href="/calendar">{t("goToCalendar")}</Link>
            </Button>
          </div>
        </SignedIn>
        <SignedOut>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/pricing">{t("getStarted")}</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/about">{t("learnMore")}</Link>
            </Button>
          </div>
        </SignedOut>
      </div>

      <div className="grid w-full max-w-5xl grid-cols-1 gap-4 px-4 md:grid-cols-3">
        {/* Desktop Preview */}
        <Card className="relative md:col-span-2 md:h-[400px]">
          <div className="h-0 pb-[56.25%] md:h-full md:pb-0">
            {" "}
            {/* 16:9 aspect ratio on mobile */}
            <Image src="/screen.png" alt="Desktop preview" fill className="object-contain dark:hidden" priority />
            <Image
              src="/screen-dark.png"
              alt="Desktop preview (dark)"
              fill
              className="hidden object-contain dark:block"
              priority
            />
          </div>
        </Card>

        {/* Mobile Preview */}
        <Card className="relative md:h-[400px]">
          <div className="h-0 pb-[177.78%] md:h-full md:pb-0">
            {" "}
            {/* 9:16 aspect ratio on mobile */}
            <Image src="/screen-mobile.png" alt="Mobile preview" fill className="object-contain dark:hidden" priority />
            <Image
              src="/screen-mobile-dark.png"
              alt="Mobile preview (dark)"
              fill
              className="hidden object-contain dark:block"
              priority
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
