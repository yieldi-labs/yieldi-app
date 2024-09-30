/// providers consolidating all providers
"use client";

import { RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { cookieToInitialState, WagmiProvider } from "wagmi";

import { assets as initialAssets } from "@/app/config/StakedAssets";
import { config } from "@/lib/providers/ethereumConfig";

import { AssetsProvider } from "./context/AssetContext";
import { DataProvider } from "./context/DataContext";
import { DialogProvider } from "./context/DialogContext";
import { FinalityProvidersProvider } from "./context/FinalityProvidersContext";
import { StakeProvider } from "./context/StakeContext";
import { WalletProvider } from "./context/WalletContext";
import { GlobalParamsProvider } from "./context/api/GlobalParamsProvider";

type Props = {
  children: React.ReactNode;
  cookie: string | null;
};

function Providers({ children, cookie }: Props) {
  const queryClient = new QueryClient();

  const assetPriceSymbols = initialAssets.map((a) => a.assetPriceSymbol);
  const initialState = cookieToInitialState(config, cookie);
  return (
    <DialogProvider>
      <WagmiProvider config={config} initialState={initialState}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            modalSize="compact"
            theme={lightTheme({
              accentColor: "#0E76FD",
              accentColorForeground: "gray",
              borderRadius: "none",
              fontStack: "system",
              overlayBlur: "small",
            })}
          >
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
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </DialogProvider>
  );
}

export default Providers;
