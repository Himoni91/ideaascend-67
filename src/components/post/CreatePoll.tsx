
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, BarChart2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface CreatePollProps {
  onCreatePoll: (data: {
    question: string;
    options: string[];
    isMultipleChoice: boolean;
    expiresIn: number | null;
  }) => void;
  onCancel: () => void;
}

export default function CreatePoll({ onCreatePoll, onCancel }: CreatePollProps) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [isMultipleChoice, setIsMultipleChoice] = useState(false);
  const [expiresIn, setExpiresIn] = useState<number | null>(24); // Default 24 hours
  
  const addOption = () => {
    if (options.length >= 10) {
      toast.error("You can add a maximum of 10 options");
      return;
    }
    setOptions([...options, ""]);
  };
  
  const removeOption = (index: number) => {
    if (options.length <= 2) {
      toast.error("A poll must have at least 2 options");
      return;
    }
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };
  
  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };
  
  const handleCreatePoll = () => {
    // Validate
    if (!question.trim()) {
      toast.error("Please enter a poll question");
      return;
    }
    
    // Remove empty options and check if at least 2 options are provided
    const validOptions = options.filter(option => option.trim().length > 0);
    
    if (validOptions.length < 2) {
      toast.error("Please provide at least 2 options");
      return;
    }
    
    onCreatePoll({
      question,
      options: validOptions,
      isMultipleChoice,
      expiresIn
    });
  };
  
  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <BarChart2 className="mr-2 h-5 w-5 text-primary" />
          Create a Poll
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="question">Poll Question</Label>
          <Textarea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question..."
            className="resize-none"
          />
        </div>
        
        <div className="space-y-3">
          <Label>Poll Options</Label>
          <AnimatePresence>
            {options.map((option, index) => (
              <motion.div
                key={index}
                className="flex gap-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Input
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeOption(index)}
                  disabled={options.length <= 2}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove</span>
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addOption}
            disabled={options.length >= 10}
            className="mt-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Option
          </Button>
        </div>
        
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-center space-x-2">
            <Switch
              id="multiple-choice"
              checked={isMultipleChoice}
              onCheckedChange={setIsMultipleChoice}
            />
            <Label htmlFor="multiple-choice">Allow multiple selections</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Label htmlFor="expires">Poll Duration:</Label>
            <Select
              value={expiresIn?.toString() || "none"}
              onValueChange={(value) => 
                setExpiresIn(value === "none" ? null : parseInt(value))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Never expires</SelectItem>
                <SelectItem value="1">1 hour</SelectItem>
                <SelectItem value="24">24 hours</SelectItem>
                <SelectItem value="72">3 days</SelectItem>
                <SelectItem value="168">1 week</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleCreatePoll}>
          Create Poll
        </Button>
      </CardFooter>
    </Card>
  );
}
