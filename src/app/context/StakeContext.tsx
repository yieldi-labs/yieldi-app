/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { createContext, useContext, useState, ReactNode } from "react";

import { ErrorProvider } from "@/app/context/Error/ErrorContext";
import { FinalityProvider } from "@/app/types/finalityProviders";

interface StakeContextType {
  selectedDelegation: FinalityProvider;
  setSelectedDelegation: (delegation: any) => void;
}

const StakeContext = createContext<StakeContextType | undefined>(undefined);

export const StakeProvider = ({ children }: { children: ReactNode }) => {
  const [selectedDelegation, setSelectedDelegation] = useState<any>(null);

  return (
    <StakeContext.Provider
      value={{ selectedDelegation, setSelectedDelegation }}
    >
      <ErrorProvider>{children}</ErrorProvider>
    </StakeContext.Provider>
  );
};

export const useStake = () => {
  const context = useContext(StakeContext);
  if (!context) {
    throw new Error("useStake must be used within a StakeProvider");
  }
  return context;
};
