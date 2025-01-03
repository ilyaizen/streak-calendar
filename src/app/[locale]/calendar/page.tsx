"use client";

import { CalendarView } from "@/components/habits/calendar/calendar-view";
import { HabitList } from "@/components/habits/habit-list";
import { YearlyOverview } from "@/components/habits/yearly-overview";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { SignedIn } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { useConvexAuth } from "convex/react";
import { endOfMonth, format, startOfMonth, subMonths } from "date-fns";
import { ArrowUpDown, Download, Loader2, Plus, Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useState } from "react";

import { api } from "@server/convex/_generated/api";

const colorThemes = [
  "emerald",
  "blue",
  "indigo",
  "violet",
  "purple",
  "pink",
  "rose",
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "teal",
  "cyan",
  "sky",
] as const;

export default function CalendarPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const t = useTranslations("calendar");
  const calendars = useQuery(api.calendars.list);
  const createCalendar = useMutation(api.calendars.create);
  const createDefaultCalendar = useMutation(api.calendars.createDefaultCalendar);
  const { toast } = useToast();
  const today = new Date();
  const completions = useQuery(api.habits.getCompletions, {
    startDate: startOfMonth(subMonths(today, 11)).getTime(),
    endDate: endOfMonth(today).getTime(),
  });
  const exportData = useQuery(api.calendars.exportData);
  const importData = useMutation(api.calendars.importData);

  const [showNewCalendarDialog, setShowNewCalendarDialog] = useState(false);
  const [newCalendarName, setNewCalendarName] = useState("");
  const [newCalendarColor, setNewCalendarColor] = useState("emerald");
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showImportExportDialog, setShowImportExportDialog] = useState(false);

  // Create default calendar if none exists
  useEffect(() => {
    async function initializeCalendars() {
      if (calendars && calendars.length === 0) {
        await createDefaultCalendar();
      }
    }

    if (calendars) {
      initializeCalendars();
    }
  }, [calendars, createDefaultCalendar]);

  const handleCreateCalendar = async () => {
    await createCalendar({
      name: newCalendarName,
      colorTheme: newCalendarColor,
    });
    setNewCalendarName("");
    setShowNewCalendarDialog(false);
    toast({
      title: t("createSuccess"),
      description: `${newCalendarName} ${t("hasBeenCreated")}`,
    });
  };

  const handleExportConfirm = () => {
    setShowExportDialog(false);
    if (!exportData) return;

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `streak-calendar-export-${format(new Date(), "yyyy-MM-dd")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      setShowImportDialog(true);
    }
    e.target.value = "";
  };

  const handleImportConfirm = async () => {
    if (!importFile) return;

    try {
      const text = await importFile.text();
      const data = JSON.parse(text);
      await importData({ data });
      toast({
        title: t("importSuccess"),
        description: t("dataImported"),
      });
    } catch {
      toast({
        title: t("importError"),
        description: t("invalidFile"),
        variant: "destructive",
      });
    }
    setImportFile(null);
    setShowImportDialog(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // or redirect to login
  }

  if (!completions || !calendars) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <SignedIn>
      <div className="space-y-4 sm:space-y-8">
        <main role="main" className="space-y-4 sm:space-y-8">
          {completions && <YearlyOverview completions={completions} />}
          <div className="mx-auto space-y-4 sm:space-y-8">
            {calendars.map((calendar) => (
              <div key={calendar._id} className="space-y-4 sm:space-y-8">
                <CalendarView completions={completions} calendar={calendar} />
                <HabitList calendarId={calendar._id} />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Dialog open={showNewCalendarDialog} onOpenChange={setShowNewCalendarDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4" />
                  {t("addCalendar")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("createCalendar")}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">{t("calendarName")}</label>
                    <Input
                      value={newCalendarName}
                      onChange={(e) => setNewCalendarName(e.target.value)}
                      placeholder={t("calendarNamePlaceholder")}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t("colorTheme")}</label>
                    <Select value={newCalendarColor} onValueChange={setNewCalendarColor}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {colorThemes.map((color) => (
                          <SelectItem key={color} value={color}>
                            {color.charAt(0).toUpperCase() + color.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowNewCalendarDialog(false)}>
                      {t("cancel")}
                    </Button>
                    <Button onClick={handleCreateCalendar} disabled={!newCalendarName}>
                      {t("create")}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={showImportExportDialog} onOpenChange={setShowImportExportDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <ArrowUpDown className="h-4 w-4" />
                  {t("importExport")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("importExport")}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex flex-col gap-4">
                    <Button onClick={() => setShowExportDialog(true)}>
                      <Download className="h-4 w-4" />
                      {t("export")}
                    </Button>
                    <Button asChild>
                      <label className="cursor-pointer flex items-center justify-center">
                        <Upload className="h-4 w-4" />
                        {t("import")}
                        <input type="file" accept=".json" className="hidden" onChange={handleImportSelect} />
                      </label>
                    </Button>
                  </div>
                  <div className="flex justify-end">
                    <Button variant="outline" onClick={() => setShowImportExportDialog(false)}>
                      {t("cancel")}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <AlertDialog open={showExportDialog} onOpenChange={setShowExportDialog}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("export")}</AlertDialogTitle>
                  <AlertDialogDescription>{t("exportConfirmation")}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleExportConfirm}>{t("continue")}</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={showImportDialog} onOpenChange={setShowImportDialog}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("import")}</AlertDialogTitle>
                  <AlertDialogDescription>{t("importConfirmation")}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setImportFile(null)}>{t("cancel")}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleImportConfirm}>{t("continue")}</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </main>
      </div>
    </SignedIn>
  );
}
