'use client';

import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { HabitCard } from './habit-card';
import { NewHabitForm } from './new-habit-form';

export function HabitList() {
  const habits = useQuery(api.habits.list);

  if (!habits) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      <NewHabitForm />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {habits.map((habit) => (
          <HabitCard key={habit._id} habit={habit} />
        ))}
      </div>
    </div>
  );
}
