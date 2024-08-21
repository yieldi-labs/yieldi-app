"use client";

import { Table, Theme } from "@radix-ui/themes";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";

import { getDelegations, PaginatedDelegations } from "@/app/api/getDelegations";
import {
  getFinalityProviders,
  PaginatedFinalityProviders,
} from "@/app/api/getFinalityProviders";
import { useError } from "@/app/context/Error/ErrorContext";
import { Delegation, DelegationState } from "@/app/types/delegations";
import { FinalityProvider } from "@/app/types/finalityProviders";
import { useStake } from "@/context/StakeContext";
import { calculateDelegationsDiff } from "@/utils/local_storage/calculateDelegationsDiff";
import { getDelegationsLocalStorageKey } from "@/utils/local_storage/getDelegationsLocalStorageKey";
import { maxDecimals } from "@/utils/maxDecimals";

const StakeBTCPage = () => {
  const [publicKeyNoCoord] = useState("");
  const [address] = useState("");
  const { isErrorOpen } = useError();
  const router = useRouter();
  const { setSelectedDelegation } = useStake();

  const handleRowClick = (delegation: FinalityProvider) => {
    setSelectedDelegation(delegation);
    router.push(`/stake/btc/${delegation.btcPk}`);
  };

  const { data: finalityProviders } = useInfiniteQuery({
    queryKey: ["finality providers"],
    queryFn: ({ pageParam = "" }) => getFinalityProviders(pageParam),
    getNextPageParam: (lastPage: { pagination: { next_key: string } }) =>
      lastPage?.pagination?.next_key !== ""
        ? lastPage?.pagination?.next_key
        : null,
    initialPageParam: "",
    refetchInterval: 120000, // 2 minutes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    select: (data: { pages: any[] }) => {
      const flattenedData = data.pages.reduce<PaginatedFinalityProviders>(
        (acc, page) => {
          acc.finalityProviders.push(...page.finalityProviders);
          acc.pagination = page.pagination;
          return acc;
        },
        { finalityProviders: [], pagination: { next_key: "" } }
      );
      return flattenedData;
    },
    retry: (failureCount: number) => {
      return !isErrorOpen && failureCount <= 3;
    },
  });

  const { data: delegations } = useInfiniteQuery({
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    select: (data: { pages: any[] }) => {
      const flattenedData = data.pages.reduce<PaginatedDelegations>(
        (acc, page) => {
          acc.delegations.push(...page.delegations);
          acc.pagination = page.pagination;
          return acc;
        },
        { delegations: [], pagination: { next_key: "" } }
      );

      return flattenedData;
    },
    retry: (failureCount: number) => {
      return !isErrorOpen && failureCount <= 3;
    },
  });

  const delegationsLocalStorageKey =
    getDelegationsLocalStorageKey(publicKeyNoCoord);

  const [delegationsLocalStorage, setDelegationsLocalStorage] = useLocalStorage<
    Delegation[]
  >(delegationsLocalStorageKey, []);

  useEffect(() => {
    if (!delegations?.delegations) {
      return;
    }

    const updateDelegationsLocalStorage = async () => {
      const { areDelegationsDifferent, delegations: newDelegations } =
        await calculateDelegationsDiff(
          delegations.delegations,
          delegationsLocalStorage
        );
      if (areDelegationsDifferent) {
        setDelegationsLocalStorage(newDelegations);
      }
    };

    updateDelegationsLocalStorage();
  }, [delegations, setDelegationsLocalStorage, delegationsLocalStorage]);

  let totalStakedSat = 0;

  if (delegations) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    totalStakedSat = delegations.delegations
      .filter((delegation) => delegation?.state === DelegationState.ACTIVE)
      .reduce(
        (accumulator: number, item) => accumulator + item?.stakingValueSat,
        0
      );
  }

  return (
    <Theme
      accentColor="yellow"
      grayColor="gray"
      panelBackground="translucent"
      radius="full"
    >
      <div className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-8">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Select Finality Provider
        </h1>
        <div className="w-full max-w-5xl">
          <div className="relative overflow-x-auto rounded-lg shadow-lg bg-white">
            <Table.Root variant="surface" size="1" layout="auto">
              <Table.Header className="sticky top-0 bg-gray-200 z-10">
                <Table.Row className="bg-gray-200">
                  <Table.ColumnHeaderCell className="px-4 py-2">
                    Name
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className="px-4 py-2 hidden lg:table-cell">
                    BTC PK
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className="px-4 py-2">
                    Total Delegation
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className="px-4 py-2">
                    Commission
                  </Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body className="max-h-96 overflow-y-auto">
                {finalityProviders?.finalityProviders
                  ? finalityProviders.finalityProviders.map((item) => (
                      <Table.Row
                        key={item.btcPk}
                        className="cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleRowClick(item)}
                      >
                        <Table.Cell className="px-4 py-2">
                          {item.description.moniker}
                        </Table.Cell>
                        <Table.Cell className="px-4 py-2 hidden lg:table-cell">
                          {item.btcPk}
                        </Table.Cell>
                        <Table.Cell className="px-4 py-2">
                          {item.totalDelegations} BTC
                        </Table.Cell>
                        <Table.Cell className="px-4 py-2">
                          {item.commission
                            ? `${maxDecimals(Number(item.commission) * 100, 2)}%`
                            : "-"}
                        </Table.Cell>
                      </Table.Row>
                    ))
                  : null}
              </Table.Body>
            </Table.Root>
          </div>
        </div>
      </div>
    </Theme>
  );
  
};

export default StakeBTCPage;
