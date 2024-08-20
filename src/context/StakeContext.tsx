/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface StakeContextType {
  selectedDelegation: any;
  setSelectedDelegation: (delegation: any) => void;
}

const StakeContext = createContext<StakeContextType | undefined>(undefined);

export const StakeProvider = ({ children }: { children: ReactNode }) => {
  const [selectedDelegation, setSelectedDelegation] = useState<any>(null);

  return (
    <StakeContext.Provider value={{ selectedDelegation, setSelectedDelegation }}>
      {children}
    </StakeContext.Provider>
  );
};

export const useStake = () => {
  const context = useContext(StakeContext);
  if (!context) {
    throw new Error('useStake must be used within a StakeProvider');
  }
  return context;
};
