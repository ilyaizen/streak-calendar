"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "convex/react";
import { subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, Loader2, Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { api } from "@server/convex/_generated/api";
import { Doc } from "@server/convex/_generated/dataModel";

import { CalendarMonth } from "./calendar-month";

interface CalendarViewProps {
  completions: Doc<"completions">[];
  calendar: Doc<"calendars">;
}

export function CalendarView({ completions, calendar }: CalendarViewProps) {
  const t = useTranslations("calendar");
  const habits = useQuery(api.habits.list, { calendarId: calendar._id });
  const updateCalendar = useMutation(api.calendars.update);
  const removeCalendar = useMutation(api.calendars.remove);
  const setDefaultCalendar = useMutation(api.calendars.setDefault);
  const { toast } = useToast();
  const today = new Date();

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [newName, setNewName] = useState(calendar.name);
  const [newColorTheme, setNewColorTheme] = useState(calendar.colorTheme);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [monthOffset, setMonthOffset] = useState(0);

  if (!habits) {
    return (
      <div className="flex h-20 items-center justify-center">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleUpdateCalendar = async () => {
    await updateCalendar({
      id: calendar._id,
      name: newName,
      colorTheme: newColorTheme,
    });
    setShowEditDialog(false);
    toast({
      title: t("updateSuccess"),
      description: `${calendar.name} ${t("hasBeenUpdated")}`,
    });
  };

  const handleDeleteCalendar = async () => {
    if (calendar.isDefault) return;
    await removeCalendar({ id: calendar._id });
    toast({
      title: t("deleteSuccess"),
      description: `${calendar.name} ${t("hasBeenDeleted")}`,
    });
    setShowEditDialog(false);
    setShowDeleteDialog(false);
  };

  const handleSetDefault = async () => {
    await setDefaultCalendar({ id: calendar._id });
    setShowEditDialog(false);
    toast({
      title: t("updateSuccess"),
      description: `${calendar.name} ${t("isNowDefault")}`,
    });
  };

  // Filter completions for this calendar's habits
  const calendarHabitIds = new Set(habits.map((h) => h._id));
  const calendarCompletions = completions.filter((c) => calendarHabitIds.has(c.habitId));

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowEditDialog(true);
  };

  return (
    <div className="space-y-2 sm:space-y-4 md:space-y-8">
      <div className="group relative flex items-center gap-2">
        <h2
          className="cursor-pointer select-none break-words text-lg font-semibold sm:text-xl md:text-2xl"
          onDoubleClick={handleDoubleClick}
        >
          {calendar.name}
        </h2>
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="opacity-0 transition-opacity group-hover:opacity-100">
              <Settings className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("editCalendar")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">{t("calendarName")}</label>
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={calendar.name} />
              </div>
              <div>
                <label className="text-sm font-medium">{t("colorTheme")}</label>
                <Select value={newColorTheme} onValueChange={setNewColorTheme}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emerald">Emerald</SelectItem>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="indigo">Indigo</SelectItem>
                    <SelectItem value="violet">Violet</SelectItem>
                    <SelectItem value="purple">Purple</SelectItem>
                    <SelectItem value="pink">Pink</SelectItem>
                    <SelectItem value="rose">Rose</SelectItem>
                    <SelectItem value="red">Red</SelectItem>
                    <SelectItem value="orange">Orange</SelectItem>
                    <SelectItem value="amber">Amber</SelectItem>
                    <SelectItem value="yellow">Yellow</SelectItem>
                    <SelectItem value="lime">Lime</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="teal">Teal</SelectItem>
                    <SelectItem value="cyan">Cyan</SelectItem>
                    <SelectItem value="sky">Sky</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-between">
                <div className="space-x-2">
                  {!calendar.isDefault ? (
                    <>
                      <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                        {t("delete")}
                      </Button>
                      <Button variant="outline" onClick={handleSetDefault}>
                        {t("makeDefault")}
                      </Button>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">{t("defaultCalendar")}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                    {t("cancel")}
                  </Button>
                  <Button onClick={handleUpdateCalendar}>{t("save")}</Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="relative mx-auto flex max-w-full items-center group">
        <Button
          variant="ghost"
          size="icon"
          className="absolute -left-12 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setMonthOffset((prev) => prev + 3)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="grid w-full gap-2 sm:gap-4 lg:grid-cols-3">
          {[2, 1, 0].map((monthsAgo) => (
            <CalendarMonth
              key={monthsAgo + monthOffset}
              date={subMonths(today, monthsAgo + monthOffset)}
              completions={calendarCompletions}
              colorTheme={calendar.colorTheme}
              habits={habits}
            />
          ))}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-12 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setMonthOffset((prev) => prev - 3)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteConfirm")}</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">{t("deleteCalendarConfirmText", { calendarName: calendar.name })}</p>
          <DialogFooter>
            <div className="flex w-full items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                {t("cancel")}
              </Button>
              <Button variant="destructive" onClick={handleDeleteCalendar}>
                {t("delete")}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
