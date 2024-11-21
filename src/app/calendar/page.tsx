'use client';

import { SignedIn } from '@clerk/nextjs';
import { HabitList } from '@/components/habits/habit-list';
import { CalendarView } from '@/components/habits/calendar/calendar-view';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Loader2, Plus } from 'lucide-react';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function CalendarPage() {
  const calendars = useQuery(api.calendars.list);
  const createCalendar = useMutation(api.calendars.create);
  const createDefaultCalendar = useMutation(api.calendars.createDefaultCalendar);
  const { toast } = useToast();
  const today = new Date();
  const completions = useQuery(api.habits.getCompletions, {
    startDate: startOfMonth(subMonths(today, 2)).getTime(),
    endDate: endOfMonth(today).getTime(),
  });

  const [showNewCalendarDialog, setShowNewCalendarDialog] = useState(false);
  const [newCalendarName, setNewCalendarName] = useState('');
  const [newCalendarColor, setNewCalendarColor] = useState('emerald');

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
    setNewCalendarName('');
    setShowNewCalendarDialog(false);
    toast({
      title: 'Calendar created',
      description: `${newCalendarName} has been created`,
    });
  };

  if (!completions || !calendars) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <SignedIn>
      <div className="grid min-h-screen gap-8 p-8 pb-20 sm:p-20">
        <main className="space-y-8">
          <div className="flex items-center gap-2">
            <Dialog open={showNewCalendarDialog} onOpenChange={setShowNewCalendarDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Calendar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Calendar</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      value={newCalendarName}
                      onChange={(e) => setNewCalendarName(e.target.value)}
                      placeholder="Work, Personal, etc."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Color Theme</label>
                    <Select value={newCalendarColor} onValueChange={setNewCalendarColor}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="emerald">Emerald</SelectItem>
                        <SelectItem value="blue">Blue</SelectItem>
                        <SelectItem value="indigo">Indigo</SelectItem>
                        <SelectItem value="violet">Violet</SelectItem>
                        <SelectItem value="purple">Purple</SelectItem>
                        <SelectItem value="pink">Pink</SelectItem>
                        <SelectItem value="rose">Rose</SelectItem>
                        <SelectItem value="red">Red</SelectItem>
                        <SelectItem value="orange">Orange</SelectItem>
                        <SelectItem value="amber">Amber</SelectItem>
                        <SelectItem value="yellow">Yellow</SelectItem>
                        <SelectItem value="lime">Lime</SelectItem>
                        <SelectItem value="green">Green</SelectItem>
                        <SelectItem value="teal">Teal</SelectItem>
                        <SelectItem value="cyan">Cyan</SelectItem>
                        <SelectItem value="sky">Sky</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowNewCalendarDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateCalendar} disabled={!newCalendarName}>
                      Create
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-12">
            {calendars.map((calendar) => (
              <div key={calendar._id} className="space-y-4">
                <CalendarView completions={completions} calendar={calendar} />
                <HabitList calendarId={calendar._id} />
              </div>
            ))}
          </div>
        </main>
      </div>
    </SignedIn>
  );
}
