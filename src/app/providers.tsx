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
    <QueryClientProvider client={queryClient}>
      <GlobalParamsProvider>
        <StakeProvider>
          <WalletProvider>
            <FinalityProvidersProvider>
              <DialogProvider>{children}</DialogProvider>
            </FinalityProvidersProvider>
          </WalletProvider>
        </StakeProvider>
      </GlobalParamsProvider>
    </QueryClientProvider>
  );
}

export default Providers;
