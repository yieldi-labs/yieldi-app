/// providers consolidating all providers
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

import { assets as initialAssets } from "@/app/config/StakedAssets";

import { AssetsProvider } from "./context/AssetContext";
import { DataProvider } from "./context/DataContext";
import { DialogProvider } from "./context/DialogContext";
import { FinalityProvidersProvider } from "./context/FinalityProvidersContext";
import { StakeProvider } from "./context/StakeContext";
import { WalletProvider } from "./context/WalletContext";
import { GlobalParamsProvider } from "./context/api/GlobalParamsProvider";

function Providers({ children }: React.PropsWithChildren) {
  const queryClient = new QueryClient();

  const assetPriceSymbols = initialAssets.map((a) => a.assetPriceSymbol);

  return (
    <DialogProvider>
      <QueryClientProvider client={queryClient}>
        <GlobalParamsProvider>
          <DataProvider assets={assetPriceSymbols}>
            <AssetsProvider>
              <StakeProvider>
                <WalletProvider>
                  <FinalityProvidersProvider>
                    {children}
                  </FinalityProvidersProvider>
                </WalletProvider>
              </StakeProvider>
            </AssetsProvider>
          </DataProvider>
        </GlobalParamsProvider>
      </QueryClientProvider>
    </DialogProvider>
  );
}

export default Providers;
