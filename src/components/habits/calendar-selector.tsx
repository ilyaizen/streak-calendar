'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { useState } from 'react';
import { Plus, Settings } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '@/hooks/use-toast';
import { Id } from '../../../convex/_generated/dataModel';

interface CalendarSelectorProps {
  selectedCalendarId: Id<'calendars'>;
  onCalendarChange: (calendarId: Id<'calendars'>) => void;
}

export function CalendarSelector({ selectedCalendarId, onCalendarChange }: CalendarSelectorProps) {
  const calendars = useQuery(api.calendars.list);
  const createCalendar = useMutation(api.calendars.create);
  const updateCalendar = useMutation(api.calendars.update);
  const removeCalendar = useMutation(api.calendars.remove);
  const { toast } = useToast();

  const [showNewCalendarDialog, setShowNewCalendarDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [newCalendarName, setNewCalendarName] = useState('');
  const [newCalendarColor, setNewCalendarColor] = useState('emerald');

  if (!calendars) return null;

  const selectedCalendar = calendars.find((cal) => cal._id === selectedCalendarId);

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

  const handleUpdateCalendar = async () => {
    if (!selectedCalendar) return;
    await updateCalendar({
      id: selectedCalendar._id,
      name: newCalendarName,
      colorTheme: newCalendarColor,
    });
    setShowEditDialog(false);
    toast({
      title: 'Calendar updated',
      description: `Calendar has been updated`,
    });
  };

  const handleDeleteCalendar = async () => {
    if (!selectedCalendar || selectedCalendar.isDefault) return;
    await removeCalendar({ id: selectedCalendar._id });
    const defaultCalendar = calendars.find((cal) => cal.isDefault);
    if (defaultCalendar) {
      onCalendarChange(defaultCalendar._id);
    }
    setShowEditDialog(false);
    toast({
      title: 'Calendar deleted',
      description: `${selectedCalendar.name} has been deleted`,
    });
  };

  const openEditDialog = (calendar: typeof selectedCalendar) => {
    if (!calendar) return;
    setNewCalendarName(calendar.name);
    setNewCalendarColor(calendar.colorTheme);
    setShowEditDialog(true);
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedCalendarId} onValueChange={onCalendarChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select a calendar" />
        </SelectTrigger>
        <SelectContent>
          {calendars.map((calendar) => (
            <SelectItem key={calendar._id} value={calendar._id}>
              {calendar.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={showNewCalendarDialog} onOpenChange={setShowNewCalendarDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Calendar</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={newCalendarName}
                onChange={(e) => setNewCalendarName(e.target.value)}
                placeholder="e.g., Work, Personal, Other..."
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
                  <SelectItem value="purple">Purple</SelectItem>
                  <SelectItem value="pink">Pink</SelectItem>
                  <SelectItem value="orange">Orange</SelectItem>
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

      {selectedCalendar && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" onClick={() => openEditDialog(selectedCalendar)}>
              <Settings className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Calendar</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={newCalendarName}
                  onChange={(e) => setNewCalendarName(e.target.value)}
                  placeholder={selectedCalendar.name}
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
                    <SelectItem value="purple">Purple</SelectItem>
                    <SelectItem value="pink">Pink</SelectItem>
                    <SelectItem value="orange">Orange</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-between">
                <div>
                  {!selectedCalendar.isDefault && (
                    <Button variant="destructive" onClick={handleDeleteCalendar}>
                      Delete Calendar
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateCalendar}>Save Changes</Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
