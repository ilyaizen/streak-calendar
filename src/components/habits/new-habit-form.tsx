'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export function NewHabitForm() {
  const [name, setName] = useState('');
  const [targetFrequency, setTargetFrequency] = useState('3');
  const createHabit = useMutation(api.habits.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createHabit({
      name,
      targetFrequency: parseInt(targetFrequency),
    });
    setName('');
    setTargetFrequency('3');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row">
      <Input
        placeholder="New habit name..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="sm:max-w-[300px]"
      />
      <Input
        type="number"
        min="1"
        max="7"
        value={targetFrequency}
        onChange={(e) => setTargetFrequency(e.target.value)}
        className="sm:max-w-[100px]"
      />
      <Button type="submit" disabled={!name}>
        Add Habit
      </Button>
    </form>
  );
}
