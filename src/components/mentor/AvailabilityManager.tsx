
import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Trash, 
  Loader2, 
  Repeat,
  Check,
  Filter
} from "lucide-react";
import { format, addDays, startOfDay, addMinutes, areIntervalsOverlapping } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useMentorSpace } from "@/hooks/use-mentor-space";
import { MentorAvailabilitySlot } from "@/types/mentor";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIME_SLOTS = Array.from({ length: 24 * 4 }, (_, i) => {
  const hours = Math.floor(i / 4);
  const minutes = (i % 4) * 15;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
});

interface AvailabilityManagerProps {
  availabilitySlots?: MentorAvailabilitySlot[];
  isLoading?: boolean;
}

const AvailabilityManager: React.FC<AvailabilityManagerProps> = ({ 
  availabilitySlots = [],
  isLoading = false
}) => {
  const { addAvailabilitySlot } = useMentorSpace();
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringDays, setRecurringDays] = useState<number[]>([]);
  const [recurringEndDate, setRecurringEndDate] = useState<Date | undefined>(addDays(new Date(), 30));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  
  // Filter states
  const [showOnlyFuture, setShowOnlyFuture] = useState(true);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  
  // Convert time slot string to Date
  const timeSlotToDate = (date: Date, timeSlot: string): Date => {
    const [hours, minutes] = timeSlot.split(':').map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);
    return newDate;
  };
  
  // Check if slot overlaps with existing slots
  const checkOverlap = (startDate: Date, endDate: Date): boolean => {
    return availabilitySlots.some(slot => {
      const slotStart = new Date(slot.start_time);
      const slotEnd = new Date(slot.end_time);
      
      return areIntervalsOverlapping(
        { start: startDate, end: endDate },
        { start: slotStart, end: slotEnd }
      );
    });
  };
  
  // Handle adding availability
  const handleAddAvailability = async () => {
    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }
    
    // Validate end time is after start time
    if (startTime >= endTime) {
      toast.error("End time must be after start time");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const baseDate = startOfDay(selectedDate);
      const startDateTime = timeSlotToDate(baseDate, startTime);
      const endDateTime = timeSlotToDate(baseDate, endTime);
      
      // Check for overlap
      if (checkOverlap(startDateTime, endDateTime)) {
        toast.error("This time slot overlaps with an existing availability");
        return;
      }
      
      if (!isRecurring) {
        // Add single availability slot
        await addAvailabilitySlot.mutateAsync({
          startTime: startDateTime,
          endTime: endDateTime
        });
        
        toast.success("Availability slot added successfully");
      } else {
        // Add recurring availability slots
        if (recurringDays.length === 0) {
          toast.error("Please select at least one day for recurring availability");
          return;
        }
        
        if (!recurringEndDate) {
          toast.error("Please select an end date for recurring availability");
          return;
        }
        
        // Get day of week for the selected date (0 = Sunday, 6 = Saturday)
        const selectedDayOfWeek = selectedDate.getDay();
        // Convert to 1 = Monday, 7 = Sunday format
        const selectedDay = selectedDayOfWeek === 0 ? 7 : selectedDayOfWeek;
        
        // Create recurring rule in iCalendar RRULE format
        const rruleFreq = "WEEKLY";
        const rruleDays = recurringDays
          .map(day => {
            // Convert from 0-indexed (Monday = 0) to RRULE format (MO, TU, etc.)
            const dayNames = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
            return dayNames[day];
          })
          .join(",");
        
        const rrule = `FREQ=${rruleFreq};BYDAY=${rruleDays};UNTIL=${format(recurringEndDate, "yyyyMMdd")}T235959Z`;
        
        // Add first occurrence
        await addAvailabilitySlot.mutateAsync({
          startTime: startDateTime,
          endTime: endDateTime,
          recurring: true,
          recurringRule: rrule
        });
        
        toast.success("Recurring availability added successfully");
      }
      
      // Close dialog and reset form
      setShowAddDialog(false);
      resetForm();
    } catch (error) {
      console.error("Error adding availability:", error);
      toast.error("Failed to add availability");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Reset form values
  const resetForm = () => {
    setSelectedDate(new Date());
    setStartTime("09:00");
    setEndTime("10:00");
    setIsRecurring(false);
    setRecurringDays([]);
    setRecurringEndDate(addDays(new Date(), 30));
  };
  
  // Toggle a day in the recurring days array
  const toggleRecurringDay = (day: number) => {
    setRecurringDays(current => 
      current.includes(day)
        ? current.filter(d => d !== day)
        : [...current, day]
    );
  };
  
  // Filter slots based on user preferences
  const filteredSlots = availabilitySlots.filter(slot => {
    const slotDate = new Date(slot.start_time);
    const now = new Date();
    
    if (showOnlyFuture && slotDate < now) {
      return false;
    }
    
    if (showOnlyAvailable && slot.is_booked) {
      return false;
    }
    
    return true;
  });
  
  // Group slots by date for calendar view
  const slotsByDate = React.useMemo(() => {
    const grouped = new Map<string, MentorAvailabilitySlot[]>();
    
    filteredSlots.forEach(slot => {
      const dateKey = format(new Date(slot.start_time), 'yyyy-MM-dd');
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(slot);
    });
    
    return grouped;
  }, [filteredSlots]);

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Availability</h2>
          <p className="text-muted-foreground">
            Manage when you're available for mentorship sessions
          </p>
        </div>
        
        <div className="flex gap-2">
          <div className="flex items-center gap-2 rounded-md border px-3 py-2">
            <Label htmlFor="view-toggle" className="text-sm">View:</Label>
            <div className="flex bg-muted rounded-lg p-1">
              <Button 
                variant={viewMode === "calendar" ? "default" : "ghost"} 
                size="sm"
                onClick={() => setViewMode("calendar")}
              >
                <CalendarIcon className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === "list" ? "default" : "ghost"} 
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Availability
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Availability</DialogTitle>
                <DialogDescription>
                  Set times when you're available for mentorship sessions
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label>Select Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Select value={startTime} onValueChange={setStartTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select start time" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {TIME_SLOTS.map((time) => (
                          <SelectItem key={`start-${time}`} value={time}>
                            {format(timeSlotToDate(new Date(), time), 'h:mm a')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Select value={endTime} onValueChange={setEndTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select end time" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {TIME_SLOTS.map((time) => (
                          <SelectItem key={`end-${time}`} value={time}>
                            {format(timeSlotToDate(new Date(), time), 'h:mm a')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="recurring"
                      checked={isRecurring}
                      onCheckedChange={setIsRecurring}
                    />
                    <Label htmlFor="recurring">Recurring availability</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Create a recurring schedule for this time slot
                  </p>
                </div>
                
                {isRecurring && (
                  <>
                    <div className="space-y-2">
                      <Label>Repeats On</Label>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {DAYS_OF_WEEK.map((day, index) => (
                          <div key={day} className="flex items-center gap-2">
                            <Checkbox
                              id={`day-${index}`}
                              checked={recurringDays.includes(index)}
                              onCheckedChange={() => toggleRecurringDay(index)}
                            />
                            <Label htmlFor={`day-${index}`} className="text-sm">
                              {day.substring(0, 3)}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Repeat Until</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !recurringEndDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {recurringEndDate ? format(recurringEndDate, "PPP") : "Select end date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={recurringEndDate}
                            onSelect={setRecurringEndDate}
                            disabled={(date) => date < (selectedDate || new Date())}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </>
                )}
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowAddDialog(false);
                    resetForm();
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddAvailability}
                  disabled={!selectedDate || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Add Availability
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-4 pb-2">
        <div className="flex items-center gap-2">
          <Switch
            id="future-only"
            checked={showOnlyFuture}
            onCheckedChange={setShowOnlyFuture}
          />
          <Label htmlFor="future-only">Show only future slots</Label>
        </div>
        
        <div className="flex items-center gap-2">
          <Switch
            id="available-only"
            checked={showOnlyAvailable}
            onCheckedChange={setShowOnlyAvailable}
          />
          <Label htmlFor="available-only">Show only available slots</Label>
        </div>
      </div>
      
      {/* Calendar or List View */}
      {isLoading ? (
        <div className="flex justify-center items-center h-60">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : filteredSlots.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-6 px-6 text-center">
            <div className="mb-3">
              <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-lg font-medium mb-1">No availability slots found</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Add your availability to start accepting mentorship sessions
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Availability
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === "calendar" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {Array.from(slotsByDate.entries()).map(([dateKey, slots]) => (
            <motion.div 
              key={dateKey}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    {format(new Date(dateKey), "EEEE, MMMM d")}
                  </CardTitle>
                  <CardDescription>
                    {slots.length} slot{slots.length !== 1 ? "s" : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {slots
                      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                      .map((slot) => (
                        <div 
                          key={slot.id}
                          className={`flex justify-between items-center p-2 rounded-md border ${
                            slot.is_booked 
                              ? "bg-muted" 
                              : "hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>
                              {format(new Date(slot.start_time), "h:mm a")} - {format(new Date(slot.end_time), "h:mm a")}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {slot.recurring_rule && (
                              <Repeat className="h-4 w-4 text-muted-foreground" />
                            )}
                            {slot.is_booked ? (
                              <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                                Booked
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                                Available
                              </Badge>
                            )}
                          </div>
                        </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Availability Slots</CardTitle>
            <CardDescription>
              {filteredSlots.length} slot{filteredSlots.length !== 1 ? "s" : ""} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredSlots
                .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                .map((slot) => (
                  <div 
                    key={slot.id}
                    className={`flex justify-between items-center p-3 rounded-md border ${
                      slot.is_booked 
                        ? "bg-muted" 
                        : "hover:border-primary/50"
                    }`}
                  >
                    <div>
                      <div className="font-medium">
                        {format(new Date(slot.start_time), "EEEE, MMMM d, yyyy")}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center mt-1">
                        <Clock className="h-4 w-4 mr-1.5" />
                        {format(new Date(slot.start_time), "h:mm a")} - {format(new Date(slot.end_time), "h:mm a")}
                        
                        {slot.recurring_rule && (
                          <span className="flex items-center ml-3">
                            <Repeat className="h-4 w-4 mr-1.5" /> 
                            Recurring
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {slot.is_booked ? (
                        <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                          Booked
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                          Available
                        </Badge>
                      )}
                      
                      <Button 
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        disabled={slot.is_booked}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AvailabilityManager;
