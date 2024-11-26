"use client";

import { useState } from "react";
import { Undo2, Settings } from "lucide-react";
import { Input } from "../ui/input";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "../ui/button";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { ConfettiButton } from "../ui/confetti";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Progress } from "../ui/progress";

type HabitCardProps = {
  habit: {
    _id: Id<"habits">;
    name: string;
    targetFrequency: number;
  };
};

export function HabitCard({ habit }: HabitCardProps) {
  const t = useTranslations("habits");
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [newName, setNewName] = useState(habit.name);
  const [newTarget, setNewTarget] = useState(habit.targetFrequency.toString());
  const [completionHistory, setCompletionHistory] = useState<Id<"completions">[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const markComplete = useMutation(api.habits.markComplete);
  const deleteHabit = useMutation(api.habits.deleteHabit);
  const renameHabit = useMutation(api.habits.renameHabit);
  const stats = useQuery(api.habits.getHabitStats, { habitId: habit._id });
  const { toast } = useToast();
  const updateTarget = useMutation(api.habits.updateTargetFrequency);
  const deleteCompletion = useMutation(api.habits.deleteCompletion);

  const handleDelete = async () => {
    deleteHabit({ habitId: habit._id });
    toast({
      title: t("deleteSuccess"),
      description: `${habit.name} ${t("hasBeenDeleted")}`,
    });
    setShowEditDialog(false);
    setShowDeleteDialog(false);
  };

  const handleSaveEdits = async () => {
    if (newName.trim() === "") return;
    const target = parseInt(newTarget);
    if (isNaN(target) || target < 1 || target > 7) return;

    await Promise.all([
      renameHabit({ habitId: habit._id, name: newName.trim() }),
      updateTarget({ habitId: habit._id, targetFrequency: target }),
    ]);
    setShowEditDialog(false);
  };

  const handleComplete = async () => {
    const completion = await markComplete({ habitId: habit._id });
    setCompletionHistory((prev) => [...prev, completion]);
  };

  const handleUndo = async () => {
    const lastCompletion = completionHistory[completionHistory.length - 1];
    if (!lastCompletion) return;

    await deleteCompletion({ completionId: lastCompletion });
    setCompletionHistory((prev) => prev.slice(0, -1));
    toast({
      title: t("undoCompletion"),
      description: t("completionUndone", { habitName: habit.name }),
    });
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="group relative flex items-center gap-2">
            <h3
              className="cursor-pointer font-semibold"
              onDoubleClick={() => {
                setNewName(habit.name);
                setNewTarget(habit.targetFrequency.toString());
                setShowEditDialog(true);
              }}
            >
              {habit.name}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => {
                setNewName(habit.name);
                setNewTarget(habit.targetFrequency.toString());
                setShowEditDialog(true);
              }}
            >
              <Settings className="h-3 w-3" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {t("weeklyProgress", { current: stats?.weeklyCompletions || 0, target: habit.targetFrequency })}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Progress bar */}
          {stats && <Progress value={stats.weeklyProgress * 100} />}

          {stats && (
            <div className="grid grid-cols-3 gap-2 border-t pt-4 text-center text-sm">
              <div>
                <div className="font-semibold">{stats.currentStreak}</div>
                <div className="text-xs text-muted-foreground">{t("streakInfo.current")}</div>
              </div>
              <div>
                <div className="font-semibold">{stats.longestStreak}</div>
                <div className="text-xs text-muted-foreground">{t("streakInfo.longest")}</div>
              </div>
              <div>
                <div className="font-semibold">{stats.totalCompletions}</div>
                <div className="text-xs text-muted-foreground">{t("total")}</div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="justify-end gap-2">
          {completionHistory.length > 0 && (
            <Button onClick={handleUndo} size="sm" variant="outline">
              <Undo2 className="mr-2 h-4 w-4" />
              {t("undo")}
            </Button>
          )}
          <ConfettiButton
            onClick={async (e) => {
              e.preventDefault();
              await handleComplete();
            }}
            options={{
              get angle() {
                return Math.random() * 360;
              },
              spread: 90,
              particleCount: 100,
            }}
            className="transition-all duration-200 active:scale-95"
          >
            {t("complete")}
          </ConfettiButton>
        </CardFooter>
      </Card>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editHabit")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t("habitName")}</label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t("namePlaceholder")}
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t("weeklyTarget")}</label>
              <Input
                type="number"
                min="1"
                max="30"
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                placeholder={t("targetPlaceholder")}
              />
              <p className="text-xs text-muted-foreground">{t("daysPerWeek")}</p>
            </div>
            <div className="flex items-center justify-between">
              <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                {t("delete")}
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  {t("cancel")}
                </Button>
                <Button onClick={handleSaveEdits} disabled={!newName || !newTarget}>
                  {t("save")}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteConfirm")}</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">{t("deleteHabitConfirmText", { habitName: habit.name })}</p>
          <DialogFooter>
            <div className="flex w-full items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                {t("cancel")}
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                {t("delete")}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
