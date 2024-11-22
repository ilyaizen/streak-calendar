'use client';

import { SignedIn } from '@clerk/nextjs';
import { HabitList } from '@/components/habits/habit-list';
import { CalendarView } from '@/components/habits/calendar/calendar-view';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Loader2, Plus } from 'lucide-react';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';
import { useConvexAuth } from 'convex/react';

const colorThemes = [
  'emerald',
  'blue',
  'indigo',
  'violet',
  'purple',
  'pink',
  'rose',
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'teal',
  'cyan',
  'sky',
] as const;

export default function CalendarPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const t = useTranslations('calendar');
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
      title: t('createSuccess'),
      description: `${newCalendarName} ${t('hasBeenCreated')}`,
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // or redirect to login
  }

  if (!completions || !calendars) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <SignedIn>
      <div className="grid min-h-screen gap-8 p-8">
        <main className="space-y-8">
          <div className="space-y-8">
            {calendars.map((calendar) => (
              <div key={calendar._id} className="space-y-8">
                <CalendarView completions={completions} calendar={calendar} />
                <HabitList calendarId={calendar._id} />
              </div>
            ))}
          </div>
          <Dialog open={showNewCalendarDialog} onOpenChange={setShowNewCalendarDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" />
                {t('addCalendar')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('createCalendar')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">{t('calendarName')}</label>
                  <Input
                    value={newCalendarName}
                    onChange={(e) => setNewCalendarName(e.target.value)}
                    placeholder={t('calendarNamePlaceholder')}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">{t('colorTheme')}</label>
                  <Select value={newCalendarColor} onValueChange={setNewCalendarColor}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorThemes.map((color) => (
                        <SelectItem key={color} value={color}>
                          {color.charAt(0).toUpperCase() + color.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowNewCalendarDialog(false)}>
                    {t('cancel')}
                  </Button>
                  <Button onClick={handleCreateCalendar} disabled={!newCalendarName}>
                    {t('create')}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </SignedIn>
  );
}
