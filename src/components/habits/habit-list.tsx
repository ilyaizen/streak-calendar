"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "convex/react";
import { Loader2, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { api } from "@server/convex/_generated/api";
import { Id } from "@server/convex/_generated/dataModel";

import { HabitCard } from "./habit-card";

export function HabitList({ calendarId }: { calendarId: Id<"calendars"> }) {
  const t = useTranslations("habits");
  const habits = useQuery(api.habits.list, { calendarId });
  const createHabit = useMutation(api.habits.create);
  const { toast } = useToast();

  const [showNewHabitDialog, setShowNewHabitDialog] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [targetFrequency, setTargetFrequency] = useState("3");

  const handleCreateHabit = async () => {
    await createHabit({
      name: newHabitName,
      targetFrequency: parseInt(targetFrequency),
      calendarId,
    });
    setNewHabitName("");
    setTargetFrequency("");
    setShowNewHabitDialog(false);
    toast({
      title: t("createSuccess"),
      description: `${newHabitName} ${t("hasBeenCreated")}`,
    });
  };

  if (!habits) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-4 md:space-y-8">
      {habits.length > 0 ? (
        <div className="grid gap-2 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
          {habits.map((habit) => (
            <HabitCard key={habit._id} habit={habit} />
          ))}
        </div>
      ) : (
        <p className="text-center text-sm text-muted-foreground sm:text-base">{t("noHabits")}</p>
      )}

      <Dialog open={showNewHabitDialog} onOpenChange={setShowNewHabitDialog}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4" />
            {t("addHabit")}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("createHabit")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t("habitName")}</label>
              <Input
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder={t("namePlaceholder")}
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t("weeklyTarget")}</label>
              <Input
                type="number"
                min="1"
                max="30"
                value={targetFrequency}
                onChange={(e) => setTargetFrequency(e.target.value)}
                placeholder={t("targetPlaceholder")}
              />
              <p className="text-xs text-muted-foreground">{t("daysPerWeek")}</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewHabitDialog(false)}>
                {t("cancel")}
              </Button>
              <Button onClick={handleCreateHabit} disabled={!newHabitName || !targetFrequency}>
                {t("create")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
