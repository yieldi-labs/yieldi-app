import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import {
  getFinalityProviders,
  PaginatedFinalityProviders,
} from "@/app/api/getFinalityProviders";

import { useFinalityProviders } from "../context/FinalityProvidersContext";
import { FinalityProvider } from "../types/finalityProviders";

const thorchainSavers: FinalityProvider = {
  description: {
    moniker: "Thorchain Savers",
    identity: "thorchain-savers",
    website: "https://thorchain.org",
    securityContact: "",
    details: "Stake BTC with Thorchain Savers",
  },
  commission: "0", // Thorchain uses a different fee structure
  btcPk: "thorchain-savers-pubkey", // This should be a valid public key for Thorchain
  activeTVLSat: 0, // You might want to fetch this from Thorchain API
  totalTVLSat: 0, // You might want to fetch this from Thorchain API
  activeDelegations: 0,
  totalDelegations: 0,
  providerType: "thorchain",
};

export const useFetchFinalityProviders = () => {
  const { setFinalityProviders } = useFinalityProviders();

  const { data: finalityProvidersData } = useInfiniteQuery({
    queryKey: ["finality providers"],
    queryFn: ({ pageParam = "" }) => getFinalityProviders(pageParam),
    getNextPageParam: (lastPage: { pagination: { next_key: string } }) =>
      lastPage?.pagination?.next_key !== ""
        ? lastPage?.pagination?.next_key
        : null,
    initialPageParam: "",
    refetchInterval: 120000, // 2 minutes
    select: (data: { pages: any[] }) => {
      const flattenedData = data.pages.reduce<PaginatedFinalityProviders>(
        (acc, page) => {
          acc.finalityProviders.push(...page.finalityProviders);
          acc.pagination = page.pagination;
          return acc;
        },
        { finalityProviders: [], pagination: { next_key: "" } },
      );
      return flattenedData;
    },
    retry: (failureCount: number) => {
      return failureCount <= 3;
    },
  });

  useEffect(() => {
    if (finalityProvidersData) {
      setFinalityProviders([
        thorchainSavers,
        ...finalityProvidersData.finalityProviders,
      ]);
    }
  }, [finalityProvidersData, setFinalityProviders]);
};
