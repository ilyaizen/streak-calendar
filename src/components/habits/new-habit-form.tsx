'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useToast } from '@/hooks/use-toast';
import { DialogClose } from '../ui/dialog';

export function NewHabitForm() {
  const [name, setName] = useState('');
  const [targetFrequency, setTargetFrequency] = useState('3');
  const createHabit = useMutation(api.habits.create);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createHabit({
      name,
      targetFrequency: parseInt(targetFrequency),
    });
    setName('');
    setTargetFrequency('3');
    toast({
      title: 'Habit created',
      description: `${name} has been added to your habits`,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Habit Name
          </label>
          <Input
            id="name"
            placeholder="e.g., Exercise, Read, Meditate..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="frequency" className="text-sm font-medium">
            Weekly Target
          </label>
          <Input
            id="frequency"
            type="number"
            min="1"
            max="7"
            value={targetFrequency}
            onChange={(e) => setTargetFrequency(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">How many times per week?</p>
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <DialogClose asChild>
          <Button type="submit" disabled={!name}>
            Add Habit
          </Button>
        </DialogClose>
      </div>
    </form>
  );
}
