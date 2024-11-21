'use client';

import { HabitCard } from './habit-card';
import { NewHabitForm } from './new-habit-form';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Plus } from 'lucide-react';
import { Id } from '../../../convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Loader2 } from 'lucide-react';

interface HabitListProps {
  calendarId: Id<'calendars'>;
}

export function HabitList({ calendarId }: HabitListProps) {
  const habits = useQuery(api.habits.list, { calendarId });

  if (!habits) {
    return (
      <div className="flex h-20 items-center justify-center">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {habits.map((habit) => (
          <HabitCard key={habit._id} habit={habit} />
        ))}
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <Button>
            <Plus />
            Add Habit
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Habit</DialogTitle>
          </DialogHeader>
          <NewHabitForm calendarId={calendarId} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
