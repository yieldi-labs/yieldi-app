"use client";

import { Table } from "@radix-ui/themes";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { useLocalStorage } from "usehooks-ts";

import { getGlobalParams } from "@/app/api/getGlobalParams";
import { getDelegations_testData } from "@/app/api/testData/getDelegations_testData";
import { Delegations } from "@/app/components/Delegations/Delegations";
import { useError } from "@/app/context/Error/ErrorContext";
import { useFinalityProviders } from "@/app/context/FinalityProvidersContext";
import { useStake } from "@/app/context/StakeContext";
import { useWallet } from "@/app/context/WalletContext";
import { useGetDelegations } from "@/app/hooks/useGetDelegations";
import { Delegation, DelegationState } from "@/app/types/delegations";
import { FinalityProvider } from "@/app/types/finalityProviders";
import { satoshiToBtc } from "@/utils/btcConversions";
import { getCurrentGlobalParamsVersion } from "@/utils/globalParams";
import { calculateDelegationsDiff } from "@/utils/local_storage/calculateDelegationsDiff";
import { getDelegationsLocalStorageKey } from "@/utils/local_storage/getDelegationsLocalStorageKey";
import { signPsbtTransaction } from "@/utils/psbt";
import { truncateMiddle } from "@/utils/strings";
import wBtcIcon from "@public/icons/wbtc.svg";

const StakeBTCPage = () => {
  const { isErrorOpen } = useError();
  const router = useRouter();
  const { setSelectedDelegation } = useStake();

  const handleRowClick = (delegation: FinalityProvider) => {
    setSelectedDelegation(delegation);
    router.push(`/stake/btc/${delegation.btcPk}`);
  };

  const { btcWallet, address, publicKeyNoCoord, btcWalletNetwork } =
    useWallet();

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
    delegations,
    fetchNextDelegationsPage,
    hasNextDelegationsPage,
    isFetchingNextDelegationsPage,
  } = useGetDelegations(address, publicKeyNoCoord);

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
        <div className="flex items-baseline mb-4">
          <h1 className="text-[#332B29] text-2xl font-bold mr-[16px]">
            Choose Finality Provider
          </h1>
          <p className="text-[rgba(51,43,41,0.80)] text-lg font-light border-l border-[#332B29] ps-3">
            Select to delegate stake
          </p>
        </div>
        <div className="w-full mb-6 bg-white">
          <div className="border border-gray-200">
            <div className="flex items-center p-4 border-b border-gray-200">
              <div className="size-12 flex items-center justify-center mr-4">
                <Image src={wBtcIcon} alt="WBTC" width={65} height={65} />
              </div>
              <div className="flex items-center">
                <h2 className="text-[#332B29] text-[40px] font-medium leading-normal mr-4">
                  BTC
                </h2>
                <p className="text-[#332B29] text-[20px] font-light leading-normal">
                  Native Bitcoin
                </p>
              </div>
            </div>
            <div className="grid grid-cols-4 divide-x divide-gray-200">
              <div className="p-4 flex flex-col justify-end items-start self-stretch">
                <p className="text-[#332B29] text-[12px] font-extralight leading-normal">
                  TVL
                </p>
                <p className="text-[#332B29] text-[20px] font-medium leading-normal">
                  {satoshiToBtc(totalStakedSat)} BTC
                </p>
              </div>
              <div className="p-4 flex flex-col justify-end items-start self-stretch">
                <p className="text-[#332B29] text-[12px] font-extralight leading-normal">
                  CAP
                </p>
                <p className="text-[#332B29] text-[20px] font-medium leading-normal">
                  1.25K BTC
                </p>
              </div>
              <div className="p-4 flex flex-col justify-end items-start self-stretch">
                <p className="text-[#332B29] text-[12px] font-extralight leading-normal">
                  STAKING WINDOW
                </p>
                <p className="text-[#332B29] text-[20px] font-medium leading-normal">
                  239 blocks
                </p>
              </div>
              <div className="p-4 flex flex-col justify-end items-start self-stretch">
                <p className="text-[#332B29] text-[12px] font-extralight leading-normal">
                  PRICE
                </p>
                <p className="text-[#332B29] text-[20px] font-medium leading-normal">
                  $60,000
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="pb-12">
          <Table.Root>
            <Table.Header className="[--table-row-box-shadow:none]">
              <Table.Row>
                <Table.ColumnHeaderCell className="px-6 py-3 uppercase tracking-wider flex self-stretch text-[#6D655D] text-xs font-light">
                  Provider
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="px-6 py-3 uppercase tracking-wider text-[#6D655D] text-xs font-light">
                  My Stake
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="px-6 py-3 uppercase tracking-wider text-[#6D655D] text-xs font-light">
                  Total Delegation
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="px-6 py-3 uppercase tracking-wider text-[#6D655D] text-xs font-light">
                  Commission
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="px-6 py-3 uppercase tracking-wider text-[#6D655D] text-xs font-light">
                  Actions
                </Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body className="space-y-1.5">
              {finalityProviders?.map(
                (provider: FinalityProvider, index: number) =>
                  index % 2 == 0 ? (
                    <Table.Row
                      key={provider.btcPk}
                      className="mb-[5px] items-start gap-2.5 w-full border border-[#DCD4C9] bg-white [--table-row-box-shadow:none]"
                    >
                      <Table.Cell className="px-6 py-4 whitespace-nowrap">
                        <div className="text-[#332B29] text-xl font-medium">
                          {provider.description.moniker
                            ? provider.description.moniker
                            : "Unknown"}
                        </div>
                        <div className="text-[#6D655D] font-['GT_America_Mono_Trial'] text-sm font-normal">
                          {truncateMiddle(provider.btcPk, 5)}
                        </div>
                      </Table.Cell>
                      <Table.Cell className="px-6 py-4 whitespace-nowrap">
                        <div className="text-[#332B29] text-xl font-normal">
                          $0.00
                        </div>
                        <div className="text-[#6D655D] text-sm font-normal">
                          0.0 BTC
                        </div>
                      </Table.Cell>
                      <Table.Cell className="px-6 py-4 whitespace-nowrap">
                        <div className="text-[#332B29] text-xl font-normal">
                          $0.00
                        </div>
                        <div className="text-[#6D655D] text-sm font-normal">
                          {provider.totalDelegations} BTC
                        </div>
                      </Table.Cell>
                      <Table.Cell className="px-6 py-4 whitespace-nowrap">
                        <div className="text-[#332B29] text-xl font-normal">
                          {provider.commission
                            ? `${(Number(provider.commission) * 100).toFixed(0)}%`
                            : "-"}
                        </div>
                      </Table.Cell>
                      <Table.Cell className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleRowClick(provider)}
                          className="flex justify-center items-center w-[152px] h-[38px] px-[21px] py-[10px] 
                            gap-[10px] shrink-0 rounded bg-[#332B29] text-[#F5F1EB] text-sm font-medium"
                        >
                          SELECT
                        </button>
                      </Table.Cell>
                    </Table.Row>
                  ) : (
                    <Table.Row
                      key={provider.btcPk}
                      className="w-full h-[6px] border-none shadow-none"
                    ></Table.Row>
                  ),
              )}
            </Table.Body>
          </Table.Root>
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
              pushTx={btcWallet.pushTx}
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
