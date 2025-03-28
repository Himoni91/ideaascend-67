
import React, { createContext, useContext, ReactNode } from 'react';
import { useAscend } from '@/hooks/use-ascend';
import { AscendContextType } from '@/types/ascend';

const AscendContext = createContext<AscendContextType | undefined>(undefined);

export function AscendProvider({ children }: { children: ReactNode }) {
  const ascendData = useAscend();
  
  return (
    <AscendContext.Provider value={ascendData}>
      {children}
    </AscendContext.Provider>
  );
}

export function useAscendContext() {
  const context = useContext(AscendContext);
  if (context === undefined) {
    throw new Error('useAscendContext must be used within an AscendProvider');
  }
  return context;
}
