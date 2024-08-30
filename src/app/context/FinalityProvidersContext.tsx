// context/FinalityProvidersContext.tsx
import React, { createContext, useContext, useState } from "react";

import {
  FinalityProvidersContextType,
  FinalityProvider,
} from "../types/finalityProviders";

const FinalityProvidersContext = createContext<
  FinalityProvidersContextType | undefined
>(undefined);

export const useFinalityProviders = (): FinalityProvidersContextType => {
  const context = useContext(FinalityProvidersContext);
  if (!context) {
    throw new Error(
      "useFinalityProviders must be used within a FinalityProvidersProvider",
    );
  }
  return context;
};

export const FinalityProvidersProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [finalityProviders, setFinalityProviders] = useState<
    FinalityProvider[]
  >([]);

  return (
    <FinalityProvidersContext.Provider
      value={{ finalityProviders, setFinalityProviders }}
    >
      {children}
    </FinalityProvidersContext.Provider>
  );
};
