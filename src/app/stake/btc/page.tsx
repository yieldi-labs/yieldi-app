"use client";

import * as ScrollArea from "@radix-ui/react-scroll-area";
import { Table } from "@radix-ui/themes";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";

import { getDelegations, PaginatedDelegations } from "@/app/api/getDelegations";
import {
  getFinalityProviders,
  PaginatedFinalityProviders,
} from "@/app/api/getFinalityProviders";
import { Delegations } from "@/app/components/Delegations/Delegations";
import { useError } from "@/app/context/Error/ErrorContext";
import { Delegation, DelegationState } from "@/app/types/delegations";
import { FinalityProvider } from "@/app/types/finalityProviders";
import { GlobalParamsVersion } from "@/app/types/globalParams";
import { signPsbtTransaction } from "@/app/utils/psbt";
import { Fees, WalletProvider } from "@/app/utils/wallet/wallet_provider";
import { useStake } from "@/context/StakeContext";
import { calculateDelegationsDiff } from "@/utils/local_storage/calculateDelegationsDiff";
import { getDelegationsLocalStorageKey } from "@/utils/local_storage/getDelegationsLocalStorageKey";
import { maxDecimals } from "@/utils/maxDecimals";

const StakeBTCPage = () => {
  const [btcWallet] = useState<WalletProvider>();
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
      return !isErrorOpen && failureCount <= 3;
    },
  });

  const { data: delegations, error: delegationError } = useInfiniteQuery({
    queryKey: ["delegations", address, publicKeyNoCoord],
    queryFn: ({ pageParam = "" }) =>
      getDelegations(pageParam, "publicKeyNoCoord"),
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
        { delegations: [], pagination: { next_key: "" }, error: false },
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
          delegationsLocalStorage,
        );
      if (areDelegationsDifferent) {
        setDelegationsLocalStorage(newDelegations);
      }
    };

    updateDelegationsLocalStorage();
  }, [delegations, setDelegationsLocalStorage, delegationsLocalStorage]);

  // Finality providers key-value map { pk: moniker }
  const finalityProvidersKV = finalityProviders?.finalityProviders.reduce(
    (acc, fp) => ({ ...acc, [fp?.btcPk]: fp?.description?.moniker }),
    {},
  );

  let totalStakedSat = 0;

  if (delegations) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    totalStakedSat = delegations.delegations
      .filter(
        (delegation: { state: string }) =>
          delegation?.state === DelegationState.ACTIVE,
      )
      .reduce(
        (accumulator: number, item: { stakingValueSat: number }) =>
          accumulator + item?.stakingValueSat,
        0,
      );
  }

  // currently adding some dummy data to test the Delegations component

  const globalParams: GlobalParamsVersion = {
    version: 1,
    activationHeight: 680000,
    stakingCapSat: 5000000000,
    stakingCapHeight: 680500,
    tag: "v1.0",
    covenantPks: ["pk1", "pk2", "pk3"],
    covenantQuorum: 3,
    unbondingTime: 7200,
    unbondingFeeSat: 10000,
    maxStakingAmountSat: 1000000000,
    minStakingAmountSat: 100000,
    maxStakingTimeBlocks: 10000,
    minStakingTimeBlocks: 100,
    confirmationDepth: 6,
  };

  const btcNetwork = {
    messagePrefix: "\u0018Bitcoin Signed Message:\n",
    bech32: "bc",
    bip32: {
      public: 76067358,
      private: 76066276,
    },
    pubKeyHash: 0,
    scriptHash: 5,
    wif: 128,
  };

  const queryMeta = {
    next: () => {
      // logic to fetch next page
    },
    hasMore: true,
    isFetchingMore: false,
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-8">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Select Finality Provider
        </h1>
        <div>
          <ScrollArea.Root className="max-h-[60vh] rounded overflow-auto shadow-[0_2px_10px] shadow-blackA4 bg-white">
            <ScrollArea.Viewport className="size-full rounded">
              <Table.Root size="2">
                <Table.Header>
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
                <Table.Body>
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
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar
              className="flex select-none touch-none p-0.5 bg-blackA3 transition-colors duration-[160ms] ease-out hover:bg-blackA5 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5"
              orientation="vertical"
            >
              <ScrollArea.Thumb className="flex-1 bg-mauve10 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:size-full before:min-w-[44px] before:min-h-[44px]" />
            </ScrollArea.Scrollbar>
            <ScrollArea.Scrollbar
              className="flex select-none touch-none p-0.5 bg-blackA3 transition-colors duration-[160ms] ease-out hover:bg-blackA5 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5"
              orientation="horizontal"
            >
              <ScrollArea.Thumb className="flex-1 bg-mauve10 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:size-full before:min-w-[44px] before:min-h-[44px]" />
            </ScrollArea.Scrollbar>
            <ScrollArea.Corner className="bg-blackA5" />
          </ScrollArea.Root>
        </div>
        <div>
          {!delegationError && delegations && finalityProvidersKV ? (
            <div>
              <br />
              <h1>This is Mock Data for now</h1>
            </div>
          ) : null}
          {delegations && finalityProvidersKV ? (
            <Delegations
              finalityProvidersKV={finalityProvidersKV}
              delegationsAPI={delegations.delegations}
              delegationsLocalStorage={delegationsLocalStorage}
              publicKeyNoCoord={publicKeyNoCoord}
              address={address}
              globalParamsVersion={globalParams}
              btcWalletNetwork={btcNetwork}
              signPsbtTx={signPsbtTransaction(btcWallet)}
              pushTx={function (): Promise<string> {
                throw new Error("Function not implemented.");
              }}
              queryMeta={queryMeta}
              getNetworkFees={function (): Promise<Fees> {
                throw new Error("Function not implemented.");
              }}
            />
          ) : null}
        </div>
      </div>
    </>
  );
};

export default StakeBTCPage;
