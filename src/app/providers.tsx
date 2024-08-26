/// providers consolidating all providers
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

import { ErrorProvider } from "./context/Error/ErrorContext";
import { StakeProvider } from "./context/StakeContext";
import { WalletProvider } from "./context/WalletContext";

function Providers({ children }: React.PropsWithChildren) {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <StakeProvider>
        <WalletProvider>
          <ErrorProvider>{children}</ErrorProvider>
        </WalletProvider>
      </StakeProvider>
    </QueryClientProvider>
  );
}

export default Providers;
