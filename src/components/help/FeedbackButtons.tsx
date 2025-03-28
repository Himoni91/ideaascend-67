
import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useHelpCenter } from '@/hooks/use-help-center';
import { motion, AnimatePresence } from 'framer-motion';

interface FeedbackButtonsProps {
  articleId: string;
}

export function FeedbackButtons({ articleId }: FeedbackButtonsProps) {
  const { submitFeedback } = useHelpCenter();
  const [isHelpful, setIsHelpful] = useState<boolean | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [showTextarea, setShowTextarea] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleFeedback = (helpful: boolean) => {
    setIsHelpful(helpful);
    setShowTextarea(true);
  };

  const handleSubmit = () => {
    if (isHelpful === null) return;
    
    submitFeedback.mutate({
      article_id: articleId,
      is_helpful: isHelpful,
      feedback_text: feedbackText || undefined,
    }, {
      onSuccess: () => {
        setSubmitted(true);
        setShowTextarea(false);
      },
    });
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center p-4 bg-primary/5 rounded-md"
      >
        <p className="text-center text-sm">Thank you for your feedback!</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-center text-sm text-muted-foreground">
        Was this article helpful?
      </p>
      <div className="flex items-center justify-center gap-4">
        <Button
          variant={isHelpful === true ? "default" : "outline"}
          size="sm"
          className="flex items-center gap-2"
          onClick={() => handleFeedback(true)}
        >
          <ThumbsUp className="h-4 w-4" />
          Yes
        </Button>
        <Button
          variant={isHelpful === false ? "default" : "outline"}
          size="sm"
          className="flex items-center gap-2"
          onClick={() => handleFeedback(false)}
        >
          <ThumbsDown className="h-4 w-4" />
          No
        </Button>
      </div>
      
      <AnimatePresence>
        {showTextarea && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 overflow-hidden"
          >
            <Textarea
              placeholder={
                isHelpful
                  ? "What did you find most helpful? (optional)"
                  : "How can we improve this article? (optional)"
              }
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className="w-full text-sm resize-none"
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={submitFeedback.isPending}
              >
                {submitFeedback.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Feedback'
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
