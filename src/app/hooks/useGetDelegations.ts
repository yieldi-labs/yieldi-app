import { useInfiniteQuery } from "@tanstack/react-query";

import { getDelegations, PaginatedDelegations } from "@/app/api/getDelegations";

export const useGetDelegations = (
  address: string,
  publicKeyNoCoord: string,
) => {
  const {
    data: delegations,
    fetchNextPage: fetchNextDelegationsPage,
    hasNextPage: hasNextDelegationsPage,
    isFetchingNextPage: isFetchingNextDelegationsPage,
  } = useInfiniteQuery({
    queryKey: ["delegations", address, publicKeyNoCoord],
    queryFn: ({ pageParam = "" }) =>
      getDelegations(pageParam, publicKeyNoCoord),
    getNextPageParam: (lastPage: { pagination: { next_key: string } }) =>
      lastPage?.pagination?.next_key !== ""
        ? lastPage?.pagination?.next_key
        : null,
    initialPageParam: "",
    refetchInterval: 60000, // 1 minute
    enabled: true, //figure out where the btc address is coming from and how to ensure wallet is connected
    select: (data: { pages: any[] }) => {
      const flattenedData = data.pages.reduce<PaginatedDelegations>(
        (acc, page) => {
          acc.delegations.push(...page.delegations);
          acc.pagination = page.pagination;
          return acc;
        },
        { delegations: [], pagination: { next_key: "" } },
      );

      return flattenedData;
    },
    retry: (failureCount: number) => {
      return failureCount <= 3;
    },
  });

  return {
    delegations,
    fetchNextDelegationsPage,
    hasNextDelegationsPage,
    isFetchingNextDelegationsPage,
  };
};
