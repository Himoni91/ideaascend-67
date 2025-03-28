
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Info } from "lucide-react";
import { populateMentorTestData } from "@/utils/mentor-test-data";
import { toast } from "sonner";

export default function MentorDemoSetup() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateTestData = async () => {
    if (!user?.id) {
      toast.error("You need to be logged in to create test data.");
      return;
    }

    setIsLoading(true);
    try {
      await populateMentorTestData(user.id);
      // Reload the page after creating test data
      window.location.reload();
    } catch (error) {
      console.error("Failed to create test data:", error);
      toast.error("An error occurred while creating test data.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Test Mentor Functionality</CardTitle>
        <CardDescription>
          No mentor data found. Create test data to try out the mentor space functionality.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-md flex gap-3">
          <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div className="text-sm text-amber-800 dark:text-amber-300">
            <p className="font-medium mb-1">Demo Setup</p>
            <p>
              This will set up your account as a mentor with session types, availability slots, 
              and other necessary data to test the full mentor space functionality.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleCreateTestData} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Setting up test data...
            </>
          ) : (
            "Create Test Data"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
