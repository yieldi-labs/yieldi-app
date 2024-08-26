"use client";

import * as ScrollArea from "@radix-ui/react-scroll-area";
import { Table } from "@radix-ui/themes";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";

import { getDelegations, PaginatedDelegations } from "@/app/api/getDelegations";
import { getDelegations_testData } from "@/app/api/testData/getDelegations_testData";
import { Delegations } from "@/app/components/Delegations/Delegations";
import { useError } from "@/app/context/Error/ErrorContext";
import { useFinalityProviders } from "@/app/context/FinalityProvidersContext";
import { useStake } from "@/app/context/StakeContext";
import { Delegation, DelegationState } from "@/app/types/delegations";
import { FinalityProvider } from "@/app/types/finalityProviders";
import { GlobalParamsVersion } from "@/app/types/globalParams";
import { calculateDelegationsDiff } from "@/utils/local_storage/calculateDelegationsDiff";
import { getDelegationsLocalStorageKey } from "@/utils/local_storage/getDelegationsLocalStorageKey";
import { maxDecimals } from "@/utils/maxDecimals";
import { signPsbtTransaction } from "@/utils/psbt";
import { truncateMiddle } from "@/utils/strings";
import { Fees, WalletProvider } from "@/utils/wallet/wallet_provider";

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
  const { finalityProviders } = useFinalityProviders();

  let { data: delegations } = useInfiniteQuery({
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
      return !isErrorOpen && failureCount <= 3;
    },
  });

  const inTestMode = useSearchParams().get("mockData") === "true";
  if (inTestMode) {
    delegations = getDelegations_testData;
  }

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
  const finalityProvidersKV = finalityProviders?.reduce(
    (acc, fp) => ({ ...acc, [fp?.btcPk]: fp?.description?.moniker }),
    {},
  );

  let totalStakedSat = 0;

  if (delegations) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    totalStakedSat = delegations.delegations
      .filter((delegation) => delegation?.state === DelegationState.ACTIVE)
      .reduce(
        (accumulator: number, item) => accumulator + item?.stakingValueSat,
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
      <div className="lg:w-1/2 mx-auto px-4 md:px-16 lg:px-0">
        <h1 className="text-xl font-bold mb-8 text-gray-700">
          Select Finality Provider
        </h1>
        <div>
          <ScrollArea.Root className="max-h-[80vh] rounded-3xl border overflow-auto bg-white">
            <ScrollArea.Viewport className="size-full rounded">
              <Table.Root size="2" className="relative">
                <Table.Header className="bg-slate-800">
                  <Table.Row>
                    <Table.ColumnHeaderCell className="whitespace-nowrap align-middle p-6 text-white">
                      Name
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell className="whitespace-nowrap p-6 align-middle hidden lg:table-cell text-white">
                      BTC PK
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell className="whitespace-nowrap p-6 align-middle text-white">
                      Total Delegation
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell className="whitespace-nowrap p-6 align-middle text-white">
                      Commission
                    </Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {finalityProviders ? finalityProviders.map((item) => (
                        <Table.Row
                          key={item.btcPk}
                          className="cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleRowClick(item)}
                        >
                          <Table.Cell className="p-6 align-middle">
                            {item.description.moniker}
                          </Table.Cell>
                          <Table.Cell className="p-6 align-middle hidden lg:table-cell">
                            {truncateMiddle(item.btcPk, 10)}
                          </Table.Cell>
                          <Table.Cell className="p-6 align-middle">
                            {item.totalDelegations} BTC
                          </Table.Cell>
                          <Table.Cell className="p-6 align-middle">
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
          {delegations && finalityProvidersKV ? (
            <Delegations
              finalityProvidersKV={finalityProvidersKV}
              delegationsAPI={delegations?.delegations}
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

const StakeBTCPageWrapper = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StakeBTCPage />
    </Suspense>
  );
};

export default StakeBTCPageWrapper;
