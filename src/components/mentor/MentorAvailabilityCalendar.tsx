
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parse, isToday, addDays, addHours } from "date-fns";
import { CalendarDays, Clock, Plus, Loader2, CheckCircle, X } from "lucide-react";
import { MentorAvailabilitySlot } from "@/types/mentor";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function MentorAvailabilityCalendar({
  slots = [],
  isOwnProfile = false,
  onAddSlot,
  onSelectSlot
}: {
  slots?: MentorAvailabilitySlot[];
  isOwnProfile?: boolean;
  onAddSlot?: (slot: { start_time: string; end_time: string }) => Promise<void>;
  onSelectSlot?: (slot: MentorAvailabilitySlot) => void;
}) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [availableSlotsByDate, setAvailableSlotsByDate] = useState<Record<string, MentorAvailabilitySlot[]>>({});
  const [isAddSlotDialogOpen, setIsAddSlotDialogOpen] = useState(false);
  const [newSlotStartTime, setNewSlotStartTime] = useState("");
  const [newSlotEndTime, setNewSlotEndTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<MentorAvailabilitySlot | null>(null);
  
  const availabilityDates = Object.keys(availableSlotsByDate);
  
  // Group slots by date
  useEffect(() => {
    const groupedSlots: Record<string, MentorAvailabilitySlot[]> = {};
    
    slots.forEach((slot) => {
      const date = format(new Date(slot.start_time), 'yyyy-MM-dd');
      if (!groupedSlots[date]) {
        groupedSlots[date] = [];
      }
      groupedSlots[date].push(slot);
    });
    
    setAvailableSlotsByDate(groupedSlots);
  }, [slots]);
  
  const handleAddSlot = async () => {
    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }
    
    if (!newSlotStartTime || !newSlotEndTime) {
      toast.error("Please provide both start and end times");
      return;
    }
    
    // Parse times
    try {
      const startDate = parse(`${format(selectedDate, 'yyyy-MM-dd')} ${newSlotStartTime}`, 'yyyy-MM-dd HH:mm', new Date());
      const endDate = parse(`${format(selectedDate, 'yyyy-MM-dd')} ${newSlotEndTime}`, 'yyyy-MM-dd HH:mm', new Date());
      
      if (startDate >= endDate) {
        toast.error("End time must be after start time");
        return;
      }
      
      setIsSubmitting(true);
      
      if (onAddSlot) {
        await onAddSlot({
          start_time: startDate.toISOString(),
          end_time: endDate.toISOString()
        });
      }
      
      setIsAddSlotDialogOpen(false);
      setNewSlotStartTime("");
      setNewSlotEndTime("");
      toast.success("Availability slot added successfully");
    } catch (error) {
      console.error("Time parsing error:", error);
      toast.error("Invalid time format");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };
  
  const handleSlotSelect = (slot: MentorAvailabilitySlot) => {
    if (slot.is_booked) {
      toast.info("This slot is already booked");
      return;
    }
    
    setSelectedSlot(slot);
    
    if (onSelectSlot) {
      onSelectSlot(slot);
    }
  };
  
  // Generate some quick time slot options for the current date
  const generateQuickTimeSlots = () => {
    if (!selectedDate) return [];
    
    const today = new Date();
    const startHour = isToday(selectedDate) ? today.getHours() + 2 : 9; // Start 2 hours from now if today
    const quickSlots = [];
    
    for (let hour = startHour; hour < 20; hour += 2) {
      const start = new Date(selectedDate);
      start.setHours(hour, 0, 0, 0);
      
      const end = new Date(start);
      end.setHours(hour + 1, 0, 0, 0);
      
      quickSlots.push({
        startTime: format(start, 'HH:mm'),
        endTime: format(end, 'HH:mm'),
        label: `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`
      });
    }
    
    return quickSlots;
  };
  
  const selectedDateFormatted = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  const slotsForSelectedDate = selectedDateFormatted ? (availableSlotsByDate[selectedDateFormatted] || []) : [];
  
  // Sort slots by start time
  const sortedSlotsForSelectedDate = slotsForSelectedDate.sort((a, b) => 
    new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center">
            <CalendarDays className="mr-2 h-5 w-5 text-primary" />
            {isOwnProfile ? "Manage Your Availability" : "Book a Session"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
            <div className="md:col-span-3">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                className="rounded-md border"
                fromDate={new Date()}
                modifiers={{
                  available: (date) => {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    return availabilityDates.includes(dateStr);
                  }
                }}
                modifiersStyles={{
                  available: { 
                    fontWeight: "bold",
                    backgroundColor: "var(--primary-50)",
                    color: "var(--primary-900)" 
                  }
                }}
                styles={{
                  day_selected: { 
                    fontWeight: "bold",
                    border: "1px solid var(--primary)"
                  }
                }}
                components={{
                  DayContent: ({ date }) => {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    const hasSlots = availabilityDates.includes(dateStr);
                    return (
                      <div className="relative w-full h-full flex items-center justify-center">
                        {date.getDate()}
                        {hasSlots && (
                          <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                        )}
                      </div>
                    );
                  }
                }}
              />
            </div>
            
            <div className="md:col-span-4">
              <h3 className="text-lg font-medium mb-4">
                {selectedDate 
                  ? format(selectedDate, 'EEEE, MMMM d, yyyy')
                  : "Select a date"}
              </h3>
              
              {selectedDate && (
                <div className="space-y-3">
                  {sortedSlotsForSelectedDate.length > 0 ? (
                    sortedSlotsForSelectedDate.map((slot) => (
                      <motion.div
                        key={slot.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => !slot.is_booked && handleSlotSelect(slot)}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-md border",
                          slot.is_booked 
                            ? "bg-muted cursor-not-allowed" 
                            : selectedSlot?.id === slot.id
                              ? "border-primary bg-primary/5 cursor-pointer"
                              : "hover:border-primary cursor-pointer hover:bg-primary/5"
                        )}
                      >
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>
                            {format(new Date(slot.start_time), "h:mm a")} - {format(new Date(slot.end_time), "h:mm a")}
                          </span>
                        </div>
                        {slot.is_booked ? (
                          <span className="flex items-center text-xs text-muted-foreground">
                            <X className="h-4 w-4 mr-1 text-destructive" />
                            Booked
                          </span>
                        ) : selectedSlot?.id === slot.id ? (
                          <span className="flex items-center text-xs text-primary">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Selected
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Available</span>
                        )}
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground mb-4">No availability slots for this date.</p>
                      {isOwnProfile && (
                        <Button onClick={() => setIsAddSlotDialogOpen(true)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Availability
                        </Button>
                      )}
                    </div>
                  )}
                  
                  {isOwnProfile && sortedSlotsForSelectedDate.length > 0 && (
                    <div className="pt-3">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsAddSlotDialogOpen(true)}
                        className="w-full"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add More Times
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Add Slot Dialog */}
      <Dialog open={isAddSlotDialogOpen} onOpenChange={setIsAddSlotDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Availability Slot</DialogTitle>
            <DialogDescription>
              Set your availability for {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Input 
                  id="start-time" 
                  type="time" 
                  value={newSlotStartTime} 
                  onChange={(e) => setNewSlotStartTime(e.target.value)}
                  required 
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="end-time">End Time</Label>
                <Input 
                  id="end-time" 
                  type="time" 
                  value={newSlotEndTime} 
                  onChange={(e) => setNewSlotEndTime(e.target.value)}
                  required 
                />
              </div>
            </div>
            
            <div className="pt-2">
              <h4 className="text-sm font-medium mb-3">Quick Times</h4>
              <div className="grid grid-cols-2 gap-2">
                {generateQuickTimeSlots().map((quickSlot, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setNewSlotStartTime(quickSlot.startTime);
                      setNewSlotEndTime(quickSlot.endTime);
                    }}
                  >
                    {quickSlot.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddSlotDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddSlot} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Slot
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
