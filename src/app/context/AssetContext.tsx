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
  const { data: priceData, isLoading, error } = useData();

  const updatedAssets = useMemo(() => {
    if (!priceData) return initialAssets;

    return initialAssets.map((asset) => {
      const priceInfo = priceData[asset.assetPriceSymbol];
      const price = priceInfo?.usd ?? asset.price;

      return {
        ...asset,
        price,
      };
    });
  }, [priceData]);

  return (
    <AssetsContext.Provider value={{ assets: updatedAssets, isLoading, error }}>
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
