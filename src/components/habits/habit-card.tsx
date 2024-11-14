'use client';

import { useState } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Input } from '../ui/input';
import { Id } from '../../../convex/_generated/dataModel';
import { Button } from '../ui/button';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useToast } from '@/hooks/use-toast';

type HabitCardProps = {
  habit: {
    _id: Id<'habits'>;
    name: string;
    targetFrequency: number;
  };
};

export function HabitCard({ habit }: HabitCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(habit.name);

  const markComplete = useMutation(api.habits.markComplete);
  const deleteHabit = useMutation(api.habits.deleteHabit);
  const renameHabit = useMutation(api.habits.renameHabit);
  const stats = useQuery(api.habits.getHabitStats, { habitId: habit._id });
  const { toast } = useToast();

  const handleRename = async () => {
    if (newName.trim() === '') return;
    await renameHabit({ habitId: habit._id, name: newName.trim() });
    setIsEditing(false);
  };

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          {isEditing ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRename();
              }}
              className="flex gap-2"
            >
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="h-7"
                autoFocus
                onBlur={handleRename}
              />
            </form>
          ) : (
            <>
              <h3 className="font-semibold">{habit.name}</h3>
              <p className="text-sm text-muted-foreground">
                {stats?.weeklyCompletions || 0}/{habit.targetFrequency}x this week
              </p>
            </>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsEditing(!isEditing)}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={() => {
              if (confirm('Are you sure you want to delete this habit?')) {
                deleteHabit({ habitId: habit._id });
                toast({
                  title: 'Habit deleted',
                  description: `${habit.name} has been removed from your habits`,
                });
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button onClick={() => markComplete({ habitId: habit._id })} size="sm">
            Complete
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
    </div>
  );
}
