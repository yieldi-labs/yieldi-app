"use client";

import React, { createContext, useContext, useMemo } from "react";

import { assets as initialAssets } from "@/app/config/StakedAssets";
import { StakeAsset } from "@/app/types/stakeAsset";

import { useData } from "./DataContext";

type AssetsContextType = {
  assets: StakeAsset[];
  isLoading: boolean;
  error: any;
};

const AssetsContext = createContext<AssetsContextType | undefined>(undefined);

export const AssetsProvider = ({ children }: { children: React.ReactNode }) => {
  const { cryptoPrices, cryptoLoading, cryptoError } = useData();

  const updatedAssets = useMemo(() => {
    if (!cryptoPrices) return initialAssets;

    return initialAssets.map((asset) => {
      const priceInfo = cryptoPrices[asset.assetPriceSymbol];
      const price = priceInfo?.usd ?? asset.price;

      return {
        ...asset,
        price,
      };
    });
  }, [cryptoPrices]);

  return (
    <AssetsContext.Provider
      value={{
        assets: updatedAssets,
        isLoading: cryptoLoading,
        error: cryptoError,
      }}
    >
      {children}
    </AssetsContext.Provider>
  );
};

export const useAssets = () => {
  const context = useContext(AssetsContext);
  if (context === undefined) {
    throw new Error("useAssets must be used within an AssetsProvider");
  }
  return context;
};
