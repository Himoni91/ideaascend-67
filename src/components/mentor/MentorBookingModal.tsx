
import { useState } from "react";
import { format, parseISO, differenceInMinutes } from "date-fns";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, Calendar as CalendarIcon, MessageSquare, CreditCard, Loader2 } from "lucide-react";
import { MentorAvailabilitySlot, MentorSessionTypeInfo } from "@/types/mentor";
import { ProfileType } from "@/types/profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePayment } from "@/hooks/use-payment";
import { toast } from "sonner";

interface MentorBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentor: ProfileType;
  selectedSlot: MentorAvailabilitySlot | null;
  onConfirmBooking: (bookingData: {
    mentorId: string;
    slotId: string;
    sessionData: {
      title: string;
      description?: string;
      session_type: string;
      payment_provider?: string;
      payment_id?: string;
      payment_amount?: number;
    }
  }) => Promise<void>;
  isProcessing: boolean;
}

export default function MentorBookingModal({
  isOpen,
  onClose,
  mentor,
  selectedSlot,
  onConfirmBooking,
  isProcessing
}: MentorBookingModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSessionType, setSelectedSessionType] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "paypal" | "free">("free");
  
  const { payWithRazorpay, payWithPaypal, createFreePayment, isLoading: isPaymentProcessing } = usePayment();
  
  const sessionTypes: MentorSessionTypeInfo[] = (mentor.mentor_session_types as any || [
    {
      id: "quick",
      name: "Quick Chat",
      description: "30-minute session for specific questions",
      duration: 30,
      price: 0,
      is_free: true
    },
    {
      id: "standard",
      name: "Standard Session",
      description: "60-minute in-depth consultation",
      duration: 60,
      price: 25
    }
  ]);
  
  const getSelectedSessionTypeDetails = () => {
    return sessionTypes.find(type => type.id === selectedSessionType);
  };
  
  const getSessionDuration = () => {
    if (!selectedSlot) return 0;
    
    const startTime = parseISO(selectedSlot.start_time);
    const endTime = parseISO(selectedSlot.end_time);
    
    return differenceInMinutes(endTime, startTime);
  };
  
  const isBookingFree = () => {
    const sessionType = getSelectedSessionTypeDetails();
    return sessionType?.is_free || sessionType?.price === 0;
  };
  
  const handleConfirmBooking = async () => {
    if (!selectedSlot || !selectedSessionType) {
      toast.error("Please select a time slot and session type");
      return;
    }
    
    const sessionType = getSelectedSessionTypeDetails();
    
    if (!sessionType) {
      toast.error("Invalid session type selected");
      return;
    }
    
    try {
      let paymentId: string | undefined;
      
      if (isBookingFree()) {
        paymentId = await createFreePayment({
          description: `${sessionType.name} with ${mentor.full_name || mentor.username}`,
          metadata: {
            mentor_id: mentor.id,
            slot_id: selectedSlot.id,
            session_type: selectedSessionType
          }
        });
      } else if (paymentMethod === "razorpay") {
        await payWithRazorpay({
          amount: sessionType.price,
          currency: sessionType.currency || "INR",
          description: `${sessionType.name} with ${mentor.full_name || mentor.username}`,
          metadata: {
            mentor_id: mentor.id,
            slot_id: selectedSlot.id,
            session_type: selectedSessionType
          },
          onSuccess: async (paymentResult) => {
            await onConfirmBooking({
              mentorId: mentor.id,
              slotId: selectedSlot.id,
              sessionData: {
                title: title || `${sessionType.name} Session`,
                description,
                session_type: selectedSessionType,
                payment_provider: "razorpay",
                payment_id: paymentResult,
                payment_amount: sessionType.price
              }
            });
          },
          onError: (error) => {
            console.error("Payment failed:", error);
            toast.error("Payment failed. Please try again.");
          }
        });
        return;
      } else if (paymentMethod === "paypal") {
        await payWithPaypal({
          amount: sessionType.price,
          currency: sessionType.currency || "USD",
          description: `${sessionType.name} with ${mentor.full_name || mentor.username}`,
          metadata: {
            mentor_id: mentor.id,
            slot_id: selectedSlot.id,
            session_type: selectedSessionType
          },
          onSuccess: async (paymentResult) => {
            await onConfirmBooking({
              mentorId: mentor.id,
              slotId: selectedSlot.id,
              sessionData: {
                title: title || `${sessionType.name} Session`,
                description,
                session_type: selectedSessionType,
                payment_provider: "paypal",
                payment_id: paymentResult,
                payment_amount: sessionType.price
              }
            });
          },
          onError: (error) => {
            console.error("Payment failed:", error);
            toast.error("Payment failed. Please try again.");
          }
        });
        return;
      }
      
      if (isBookingFree()) {
        await onConfirmBooking({
          mentorId: mentor.id,
          slotId: selectedSlot.id,
          sessionData: {
            title: title || `${sessionType.name} Session`,
            description,
            session_type: selectedSessionType,
            payment_provider: "free",
            payment_id: paymentId,
            payment_amount: 0
          }
        });
      }
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Failed to complete booking. Please try again.");
    }
  };
  
  const handleClose = () => {
    setTitle("");
    setDescription("");
    setSelectedSessionType("");
    setPaymentMethod("free");
    onClose();
  };

  if (!selectedSlot) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Book Session with {mentor.full_name || mentor.username}</DialogTitle>
          <DialogDescription>
            Complete the details below to book your mentorship session
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={mentor.avatar_url || undefined} />
              <AvatarFallback>{mentor.full_name?.charAt(0) || mentor.username?.charAt(0) || "M"}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{mentor.full_name || mentor.username}</h3>
              <p className="text-sm text-muted-foreground">
                {mentor.position} {mentor.company && `at ${mentor.company}`}
              </p>
            </div>
          </div>
          
          <div className="p-3 bg-muted/40 rounded-md">
            <div className="flex items-start">
              <CalendarIcon className="h-5 w-5 text-primary mr-2 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Selected Time Slot</h4>
                <p className="text-sm text-muted-foreground">
                  {format(parseISO(selectedSlot.start_time), 'EEEE, MMMM d, yyyy')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(parseISO(selectedSlot.start_time), 'h:mm a')} - {format(parseISO(selectedSlot.end_time), 'h:mm a')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {getSessionDuration()} minutes
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <label htmlFor="session-type" className="text-sm font-medium block mb-1.5">
              Session Type
            </label>
            <Select
              value={selectedSessionType}
              onValueChange={setSelectedSessionType}
            >
              <SelectTrigger id="session-type">
                <SelectValue placeholder="Select session type" />
              </SelectTrigger>
              <SelectContent>
                {sessionTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}{" "}
                    {type.is_free || type.price === 0
                      ? "(Free)"
                      : `(${type.currency || "$"}${type.price})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label htmlFor="session-title" className="text-sm font-medium block mb-1.5">
              Session Title
            </label>
            <Input
              id="session-title"
              placeholder="e.g., Career Transition Strategy"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="session-description" className="text-sm font-medium block mb-1.5">
              What would you like to discuss? (Optional)
            </label>
            <Textarea
              id="session-description"
              placeholder="Briefly describe what you'd like to focus on during this session..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          
          {selectedSessionType && !isBookingFree() && (
            <div>
              <label className="text-sm font-medium block mb-1.5">
                Payment Method
              </label>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={paymentMethod === "razorpay" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPaymentMethod("razorpay")}
                  className="flex-1"
                >
                  <img 
                    src="https://razorpay.com/images/logo.svg" 
                    alt="Razorpay" 
                    className="h-4 mr-2" 
                  />
                  Razorpay
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === "paypal" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPaymentMethod("paypal")}
                  className="flex-1"
                >
                  <img 
                    src="https://www.paypalobjects.com/digitalassets/c/website/logo/full-text/pp_fc_hl.svg" 
                    alt="PayPal" 
                    className="h-4 mr-2" 
                  />
                  PayPal
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="mt-4 flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmBooking}
            disabled={isProcessing || isPaymentProcessing || !selectedSessionType}
            className="w-full sm:w-auto"
          >
            {isProcessing || isPaymentProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing
              </>
            ) : isBookingFree() ? (
              <>
                <Calendar className="mr-2 h-4 w-4" />
                Book Free Session
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Proceed to Payment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
