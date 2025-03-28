
import { useState } from "react";
import { Calendar as CalendarIcon, Clock, Plus } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { MentorAvailabilitySlot } from "@/types/mentor";
import { formatISO, parseISO, format, addMinutes, isBefore, isAfter, isSameDay } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface MentorAvailabilityCalendarProps {
  slots: MentorAvailabilitySlot[];
  isOwnProfile: boolean;
  onAddSlot?: (newSlot: { start_time: string; end_time: string }) => Promise<void>;
  onSelectSlot?: (slot: MentorAvailabilitySlot) => void;
}

export default function MentorAvailabilityCalendar({ 
  slots, 
  isOwnProfile,
  onAddSlot,
  onSelectSlot
}: MentorAvailabilityCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Filter slots for the selected date
  const filteredSlots = slots.filter(slot => {
    if (!selectedDate) return false;
    const slotDate = parseISO(slot.start_time);
    return isSameDay(slotDate, selectedDate);
  });
  
  // Create a new availability slot
  const handleAddSlot = async () => {
    if (!selectedDate || !startTime || !endTime) {
      toast.error("Please select a date and time");
      return;
    }
    
    const selectedDateCopy = new Date(selectedDate);
    
    // Parse hours and minutes from startTime
    const [startHours, startMinutes] = startTime.split(":").map(Number);
    const start = new Date(selectedDateCopy.setHours(startHours, startMinutes));
    
    // Reset date object and parse hours and minutes from endTime
    selectedDateCopy.setTime(selectedDate.getTime());
    const [endHours, endMinutes] = endTime.split(":").map(Number);
    const end = new Date(selectedDateCopy.setHours(endHours, endMinutes));
    
    // Validate times
    if (isBefore(end, start) || end.getTime() === start.getTime()) {
      toast.error("End time must be after start time");
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (onAddSlot) {
        await onAddSlot({
          start_time: formatISO(start),
          end_time: formatISO(end)
        });
      }
      
      setShowAddDialog(false);
      toast.success("Availability slot added");
    } catch (error) {
      console.error("Failed to add slot:", error);
      toast.error("Failed to add availability slot");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Format time for display
  const formatTime = (isoString: string) => {
    return format(parseISO(isoString), "h:mm a");
  };
  
  // Get days with slots for calendar highlighting
  const getDaysWithSlots = () => {
    const days = new Set<string>();
    
    slots.forEach(slot => {
      const date = format(parseISO(slot.start_time), "yyyy-MM-dd");
      days.add(date);
    });
    
    return Array.from(days).map(day => new Date(day));
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Availability Calendar</h3>
        {isOwnProfile && onAddSlot && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Slot
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card>
          <CardContent className="p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              modifiers={{
                booked: getDaysWithSlots()
              }}
              modifiersStyles={{
                booked: { fontWeight: 'bold', backgroundColor: 'hsl(var(--primary) / 0.1)' }
              }}
            />
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardContent className="p-4">
            <h4 className="text-sm font-medium mb-3 flex items-center">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : "Select a date"}
            </h4>
            
            {filteredSlots.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {selectedDate ? "No availability slots for this date" : "Select a date to see availability"}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredSlots.map((slot) => (
                  <Button
                    key={slot.id}
                    variant="outline"
                    className={cn(
                      "justify-start h-auto py-3",
                      slot.is_booked ? "opacity-50 cursor-not-allowed" : "hover:border-primary"
                    )}
                    disabled={slot.is_booked}
                    onClick={() => !slot.is_booked && onSelectSlot && onSelectSlot(slot)}
                  >
                    <div className="flex items-start">
                      <Clock className="h-4 w-4 mr-2 mt-0.5" />
                      <div className="text-left">
                        <p className="font-medium">
                          {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {slot.is_booked ? "Booked" : "Available"}
                        </p>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Add slot dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Availability Slot</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="date" className="mb-2 block">Date</Label>
              <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : "Select a date"}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-time" className="mb-2 block">Start Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="end-time" className="mb-2 block">End Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddSlot} 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Slot"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
