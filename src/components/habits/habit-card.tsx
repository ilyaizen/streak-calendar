'use client';

import { useState } from 'react';
import { Trash2, Undo2, Pencil } from 'lucide-react';
import { Input } from '../ui/input';
import { Id } from '../../../convex/_generated/dataModel';
import { Button } from '../ui/button';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { ConfettiButton } from '../ui/confetti';

type HabitCardProps = {
  habit: {
    _id: Id<'habits'>;
    name: string;
    targetFrequency: number;
  };
};

export function HabitCard({ habit }: HabitCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [newName, setNewName] = useState(habit.name);
  const [newTarget, setNewTarget] = useState(habit.targetFrequency.toString());
  const [completionHistory, setCompletionHistory] = useState<Id<'completions'>[]>([]);

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
      title: 'Habit deleted',
      description: `${habit.name} has been removed from your habits`,
    });
    setShowDeleteDialog(false);
  };

  const handleSaveEdits = async () => {
    if (newName.trim() === '') return;
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
      title: 'Completion undone',
      description: `Removed completion mark from ${habit.name}`,
    });
  };

  return (
    <>
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
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
                <Pencil className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {stats?.weeklyCompletions || 0}/{habit.targetFrequency}x this week
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        {stats && (
          <div className="mb-4">
            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${stats.weeklyProgress * 100}%` }}
              />
            </div>
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-3 gap-2 border-t pt-4 text-center text-sm">
            <div>
              <div className="font-semibold">{stats.currentStreak}</div>
              <div className="text-xs text-muted-foreground">Current Streak</div>
            </div>
            <div>
              <div className="font-semibold">{stats.longestStreak}</div>
              <div className="text-xs text-muted-foreground">Longest Streak</div>
            </div>
            <div>
              <div className="font-semibold">{stats.totalCompletions}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-end gap-2">
          {completionHistory.length > 0 && (
            <Button onClick={handleUndo} size="sm" variant="outline">
              <Undo2 className="mr-2 h-4 w-4" />
              Undo
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
            className="transition-all duration-200 hover:scale-105 active:scale-95"
          >
            Complete
          </ConfettiButton>
        </div>
      </div>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit &quot;{habit.name}&quot; Habit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Habit Name
              </label>
              <Input id="name" value={newName} onChange={(e) => setNewName(e.target.value)} autoFocus />
            </div>
            <div className="space-y-2">
              <label htmlFor="target" className="text-sm font-medium">
                Weekly Target
              </label>
              <Input
                id="target"
                type="number"
                min="1"
                max="7"
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">How many times per week?</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdits}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Habit</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{habit.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
