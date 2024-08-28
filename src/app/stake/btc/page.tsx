"use client";

import * as ScrollArea from "@radix-ui/react-scroll-area";
import { Table } from "@radix-ui/themes";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { useLocalStorage } from "usehooks-ts";

import { getDelegations, PaginatedDelegations } from "@/app/api/getDelegations";
import { getGlobalParams } from "@/app/api/getGlobalParams";
import { getDelegations_testData } from "@/app/api/testData/getDelegations_testData";
import { Delegations } from "@/app/components/Delegations/Delegations";
import { useError } from "@/app/context/Error/ErrorContext";
import { useFinalityProviders } from "@/app/context/FinalityProvidersContext";
import { useStake } from "@/app/context/StakeContext";
import { useWallet } from "@/app/context/WalletContext";
import { Delegation, DelegationState } from "@/app/types/delegations";
import { FinalityProvider } from "@/app/types/finalityProviders";
import { satoshiToBtc } from "@/utils/btcConversions";
import { getCurrentGlobalParamsVersion } from "@/utils/globalParams";
import { calculateDelegationsDiff } from "@/utils/local_storage/calculateDelegationsDiff";
import { getDelegationsLocalStorageKey } from "@/utils/local_storage/getDelegationsLocalStorageKey";
import { maxDecimals } from "@/utils/maxDecimals";
import { signPsbtTransaction } from "@/utils/psbt";
import { truncateMiddle } from "@/utils/strings";

const StakeBTCPage = () => {
  const { isErrorOpen } = useError();
  const router = useRouter();
  const { setSelectedDelegation } = useStake();

  const handleRowClick = (delegation: FinalityProvider) => {
    setSelectedDelegation(delegation);
    router.push(`/stake/btc/${delegation.btcPk}`);
  };

  const {
    btcWallet,
    address,
    publicKeyNoCoord,
    btcWalletNetwork,
    btcWalletBalanceSat,
  } = useWallet();

  const { data: paramWithContext } = useQuery({
    queryKey: ["global params"],
    queryFn: async () => {
      const [height, versions] = await Promise.all([
        btcWallet!.getBTCTipHeight(),
        getGlobalParams(),
      ]);
      return {
        // The staking parameters are retrieved based on the current height + 1
        // so this verification should take this into account.
        currentHeight: height,
        nextBlockParams: getCurrentGlobalParamsVersion(height + 1, versions),
      };
    },
    refetchInterval: 60000, // 1 minute
    // Should be enabled only when the wallet is connected
    enabled: !!btcWallet,
    retry: (failureCount: number) => {
      return !isErrorOpen && failureCount <= 3;
    },
  });

  const { finalityProviders } = useFinalityProviders();

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
      return !isErrorOpen && failureCount <= 3;
    },
  });

  const inTestMode = useSearchParams().get("mockData") === "true";
  let testDelegations: Delegation[] = [];
  if (inTestMode) {
    testDelegations = getDelegations_testData.delegations;
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
    totalStakedSat = delegations.delegations
      .filter((delegation) => delegation?.state === DelegationState.ACTIVE)
      .reduce(
        (accumulator: number, item) => accumulator + item?.stakingValueSat,
        0,
      );
  }

  return (
    <>
      <div className="lg:w-1/2 mx-auto px-4 md:px-16 lg:px-0">
        {btcWallet ? (
          <div className="flex space-x-4 mb-4">
            <div className="flex-1 p-4 bg-gray-200">
              <div className="text-sm font-medium text-gray-600">TOTAL BTC</div>
              <div className="text-2xl ">
                {satoshiToBtc(btcWalletBalanceSat)}
              </div>
            </div>
            <div className="flex-1 p-4 bg-gray-200">
              <div className="text-sm font-medium text-gray-600">
                STAKED BTC
              </div>
              <div className="text-2xl ">{satoshiToBtc(totalStakedSat)} </div>
            </div>
          </div>
        ) : null}
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
                  {finalityProviders
                    ? finalityProviders.map((item) => (
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
          {(delegations?.delegations || testDelegations) &&
          finalityProvidersKV &&
          btcWallet &&
          paramWithContext?.nextBlockParams?.currentVersion &&
          btcWalletNetwork ? (
            <Delegations
              finalityProvidersKV={finalityProvidersKV}
              delegationsAPI={
                inTestMode ? testDelegations : (delegations?.delegations ?? [])
              }
              delegationsLocalStorage={delegationsLocalStorage}
              publicKeyNoCoord={publicKeyNoCoord}
              address={address}
              globalParamsVersion={
                paramWithContext.nextBlockParams.currentVersion
              }
              btcWalletNetwork={btcWalletNetwork}
              signPsbtTx={signPsbtTransaction(btcWallet)}
              pushTx={function (): Promise<string> {
                throw new Error("Function not implemented.");
              }}
              queryMeta={{
                next: fetchNextDelegationsPage,
                hasMore: hasNextDelegationsPage,
                isFetchingMore: isFetchingNextDelegationsPage,
              }}
              getNetworkFees={btcWallet.getNetworkFees}
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