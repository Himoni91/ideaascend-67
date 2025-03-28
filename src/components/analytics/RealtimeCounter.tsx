
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Wifi } from 'lucide-react';

interface RealtimeCounterProps {
  isRealtime: boolean;
  setIsRealtime: (value: boolean) => void;
  className?: string;
}

export function RealtimeCounter({
  isRealtime,
  setIsRealtime,
  className,
}: RealtimeCounterProps) {
  const [blinking, setBlinking] = useState(false);

  // Blink effect for realtime indicator
  useEffect(() => {
    if (!isRealtime) return;
    
    const interval = setInterval(() => {
      setBlinking(prev => !prev);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [isRealtime]);

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
        isRealtime 
          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
      } cursor-pointer ${className}`}
      onClick={() => setIsRealtime(!isRealtime)}
      whileTap={{ scale: 0.95 }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={`wifi-${blinking}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: isRealtime ? (blinking ? 0.5 : 1) : 0.5 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Wifi className="h-3.5 w-3.5" />
        </motion.span>
      </AnimatePresence>
      <span>{isRealtime ? 'Realtime' : 'Paused'}</span>
    </motion.button>
  );
}
