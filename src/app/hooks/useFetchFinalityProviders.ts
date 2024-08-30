import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import {
  getFinalityProviders,
  PaginatedFinalityProviders,
} from "@/app/api/getFinalityProviders";

import { useFinalityProviders } from "../context/FinalityProvidersContext";

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
      setFinalityProviders(finalityProvidersData.finalityProviders);
    }
  }, [finalityProvidersData, setFinalityProviders]);
};
