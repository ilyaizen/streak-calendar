'use client';

import { HabitCard } from './habit-card';
import { NewHabitForm } from './new-habit-form';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Plus } from 'lucide-react';
import { Doc } from '../../../convex/_generated/dataModel';

interface HabitListProps {
  habits: Doc<'habits'>[];
}

export function HabitList({ habits }: HabitListProps) {
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
          <NewHabitForm />
        </DialogContent>
      </Dialog>
    </div>
  );
}
