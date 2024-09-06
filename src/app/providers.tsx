/// providers consolidating all providers
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

import { DialogProvider } from "./context/DialogContext";
import { FinalityProvidersProvider } from "./context/FinalityProvidersContext";
import { StakeProvider } from "./context/StakeContext";
import { WalletProvider } from "./context/WalletContext";
import { GlobalParamsProvider } from "./context/api/GlobalParamsProvider";

function Providers({ children }: React.PropsWithChildren) {
  const queryClient = new QueryClient();

  return (
    <DialogProvider>
      <QueryClientProvider client={queryClient}>
        <GlobalParamsProvider>
          <StakeProvider>
            <WalletProvider>
              <FinalityProvidersProvider>{children}</FinalityProvidersProvider>
            </WalletProvider>
          </StakeProvider>
        </GlobalParamsProvider>
      </QueryClientProvider>
    </DialogProvider>
  );
}

export default Providers;
