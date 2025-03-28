
import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  CreditCard, 
  CheckCircle2,
  Info
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MentorAvailabilitySlot, MentorSessionTypeInfo } from "@/types/mentor";
import { ProfileType } from "@/types/profile";

interface MentorBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  slot: MentorAvailabilitySlot | null;
  mentor: ProfileType | undefined;
  sessionTypes: MentorSessionTypeInfo[] | undefined;
  onConfirmBooking: (data: {
    mentorId: string;
    slotId: string;
    sessionData: {
      title: string;
      description?: string;
      session_type: string;
    };
  }) => Promise<void>;
  isProcessing?: boolean;
}

const bookingSchema = z.object({
  session_type: z.string({
    required_error: "Please select a session type",
  }),
  title: z.string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be 100 characters or less"),
  description: z.string()
    .max(500, "Description must be 500 characters or less")
    .optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

export default function MentorBookingModal({
  isOpen,
  onClose,
  slot,
  mentor,
  sessionTypes,
  onConfirmBooking,
  isProcessing = false,
}: MentorBookingModalProps) {
  const [selectedSessionType, setSelectedSessionType] = useState<MentorSessionTypeInfo | null>(null);
  
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      session_type: "",
      title: "",
      description: "",
    },
  });
  
  // When session type changes, update the selected session type
  useEffect(() => {
    const sessionType = form.watch("session_type");
    const selectedType = sessionTypes?.find(type => type.id === sessionType) || null;
    setSelectedSessionType(selectedType);
  }, [form.watch("session_type"), sessionTypes]);
  
  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && sessionTypes?.length) {
      // Find a free session type if available, otherwise use the first one
      const freeType = sessionTypes.find(type => type.is_free);
      const defaultType = freeType || sessionTypes[0];
      
      form.reset({
        session_type: defaultType?.id || "",
        title: "",
        description: "",
      });
      
      setSelectedSessionType(defaultType || null);
    }
  }, [isOpen, sessionTypes, form]);
  
  if (!slot || !mentor) return null;
  
  const startTime = parseISO(slot.start_time);
  const endTime = parseISO(slot.end_time);
  
  const handleBooking = async (values: BookingFormValues) => {
    try {
      await onConfirmBooking({
        mentorId: mentor.id,
        slotId: slot.id,
        sessionData: {
          title: values.title,
          description: values.description,
          session_type: values.session_type,
        },
      });
    } catch (error) {
      console.error("Booking error:", error);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Book a Session</DialogTitle>
          <DialogDescription>
            Schedule a mentoring session with {mentor.full_name || mentor.username}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center gap-3 my-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={mentor.avatar_url || undefined} />
            <AvatarFallback>
              {mentor.full_name?.charAt(0) || mentor.username?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{mentor.full_name || mentor.username}</h3>
            <p className="text-sm text-muted-foreground">{mentor.position || "Mentor"}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 py-2">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm">{format(startTime, "MMMM d, yyyy")}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm">
              {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
            </span>
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleBooking)} className="space-y-4">
            <FormField
              control={form.control}
              name="session_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Session Type</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      const selected = sessionTypes?.find(type => type.id === value);
                      setSelectedSessionType(selected || null);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a session type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sessionTypes?.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{type.name}</span>
                            <span>
                              {type.is_free ? (
                                <Badge variant="outline" className="ml-2">Free</Badge>
                              ) : (
                                <span className="text-sm font-medium">${type.price}</span>
                              )}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {selectedSessionType && (
              <div className="rounded-lg border p-3 text-sm">
                <div className="font-medium mb-1 flex items-center">
                  <span>{selectedSessionType.name}</span>
                  <Badge variant={selectedSessionType.is_free ? "outline" : "secondary"} className="ml-2">
                    {selectedSessionType.is_free ? "Free" : `$${selectedSessionType.price}`}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm">
                  {selectedSessionType.description}
                </p>
                <div className="mt-2 flex items-center text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{selectedSessionType.duration} minutes</span>
                </div>
              </div>
            )}
            
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Session Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Product Feedback Session" {...field} />
                  </FormControl>
                  <FormDescription>
                    A brief title for your session.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share what you'd like to discuss or get help with..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide context to help your mentor prepare for the session.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="rounded-lg border p-3 bg-blue-50 dark:bg-blue-950">
              <div className="flex items-start">
                <Info className="h-4 w-4 mr-2 mt-0.5 text-blue-600" />
                <div>
                  <h4 className="font-medium text-sm text-blue-700 dark:text-blue-400">Payment Information</h4>
                  <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
                    {selectedSessionType?.is_free
                      ? "This is a free session. No payment is required."
                      : "You'll be asked to complete payment after booking the session."}
                  </p>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isProcessing}>
                Cancel
              </Button>
              <Button type="submit" disabled={isProcessing}>
                {isProcessing ? (
                  <div className="flex items-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full"></div>
                    <span>Processing...</span>
                  </div>
                ) : selectedSessionType?.is_free ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Confirm Booking
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Continue to Payment
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
