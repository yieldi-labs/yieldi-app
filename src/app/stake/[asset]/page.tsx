"use client";

import { Table } from "@radix-ui/themes";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";

import { getGlobalParams } from "@/app/api/getGlobalParams";
import { getDelegations_testData } from "@/app/api/testData/getDelegations_testData";
import BackButton from "@/app/components/BackButton";
import { Delegations } from "@/app/components/Delegations/Delegations";
import { Staking, StakingProps } from "@/app/components/Staking/Staking";
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
  const { setSelectedDelegation } = useStake();

  const handleSelectProvider = (delegation: FinalityProvider) => {
    setSelectedDelegation(delegation);
    setSelectedFinalityProvider(delegation);
    setStakingDialogIsOpen(true);
  };

  const {
    btcWallet,
    address,
    publicKeyNoCoord,
    btcWalletNetwork,
    btcWalletBalanceSat,
    isConnected,
    setConnectModalOpen,
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
      return failureCount <= 3;
    },
  });

  const { finalityProviders } = useFinalityProviders();
  const [btcHeight, setBtcHeight] = useState<number | undefined>(undefined);
  const delegationsLocalStorageKey =
    getDelegationsLocalStorageKey(publicKeyNoCoord);
  const [delegationsLocalStorage, setDelegationsLocalStorage] = useLocalStorage<
    Delegation[]
  >(delegationsLocalStorageKey, []);
  const [selectedFinalityProvider, setSelectedFinalityProvider] = useState<
    FinalityProvider | undefined
  >(undefined);
  const [stakingDialogIsOpen, setStakingDialogIsOpen] = useState(false);

  const stakingProps: StakingProps = {
    btcHeight,
    btcWallet,
    btcWalletNetwork,
    btcWalletBalanceSat,
    isWalletConnected: isConnected,
    onConnect: function (): void {
      setConnectModalOpen(true);
    },
    address,
    publicKeyNoCoord,
    selectedFinalityProvider: selectedFinalityProvider,
    setDelegationsLocalStorage,
    isOpen: stakingDialogIsOpen,
    onCloseDialog: () => {
      setStakingDialogIsOpen(false);
      setSelectedFinalityProvider(undefined);
    },
  };

  useEffect(() => {
    //TODO: add auto refresh for btc height for every minute and move this to wallet context
    if (btcWallet) {
      Promise.all([btcWallet.getBTCTipHeight(), btcWallet.getNetwork()]).then(
        ([height, _network]) => {
          setBtcHeight(height);
          // setBtcWalletNetwork(toNetwork(network));
        }
      );
    }
  }, [btcWallet]);

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

  // Finality providers key-value map { pk: moniker }
  const finalityProvidersKV = finalityProviders?.reduce(
    (acc, fp) => ({ ...acc, [fp?.btcPk]: fp?.description?.moniker }),
    {}
  );

  let totalStakedSat = 0;

  if (delegations) {
    totalStakedSat = delegations.delegations
      .filter((delegation) => delegation?.state === DelegationState.ACTIVE)
      .reduce(
        (accumulator: number, item) => accumulator + item?.stakingValueSat,
        0
      );
  }

  return (
    <>
      <div className="lg:w-3/4 mx-auto px-4 md:px-16 lg:px-0">
        <div>
          <BackButton text="STAKE DETAILS" />
        </div>
        <div className="flex items-baseline mb-4">
          <h1 className="text-yieldi-brown text-2xl font-bold mr-4 font-gt-america">
            Choose Finality Provider
          </h1>
          <p className="text-yieldi-brown/80 text-lg font-light border-l border-yieldi-brown ps-3">
            Select to delegate stake
          </p>
        </div>
        <div className="w-full mb-6 bg-white">
          <div className="border border-yieldi-gray-200">
            <div className="flex items-center p-4 border-b border-yieldi-gray-200">
              <div className="size-12 flex items-center justify-center mr-4">
                <Image src={wBtcIcon} alt="WBTC" width={65} height={65} />
              </div>
              <div className="flex items-center">
                <h2 className="text-yieldi-brown text-4xl font-medium leading-normal mr-4">
                  BTC
                </h2>
                <p className="text-yieldi-brown text-xl font-light leading-normal">
                  Native Bitcoin
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 md:divide-x divide-yieldi-gray-200">
              <div className="p-4 flex flex-col justify-end items-start self-stretch border-r border-b md:border-b-0 md:border-r-0 border-yieldi-gray-200">
                <p className="text-yieldi-brown text-xs font-light leading-normal">
                  TVL
                </p>
                <p className="text-yieldi-brown text-xl font-medium leading-normal">
                  {satoshiToBtc(totalStakedSat)} BTC
                </p>
              </div>
              <div className="p-4 flex flex-col justify-end items-start self-stretch md:border-r md:border-b-0 border-b border-yieldi-gray-200">
                <p className="text-yieldi-brown text-xs font-light leading-normal">
                  CAP
                </p>
                <p className="text-yieldi-brown text-xl font-medium leading-normal">
                  1.25K BTC
                </p>
              </div>
              <div className="p-4 flex flex-col justify-end items-start self-stretch border-r border-yieldi-gray-200">
                <p className="text-yieldi-brown text-xs font-light leading-normal">
                  STAKING WINDOW
                </p>
                <p className="text-yieldi-brown text-xl font-medium leading-normal">
                  239 blocks
                </p>
              </div>
              <div className="p-4 flex flex-col justify-end items-start self-stretch md:border-r border-yieldi-gray-200">
                <p className="text-yieldi-brown text-xs font-light leading-normal">
                  PRICE
                </p>
                <p className="text-yieldi-brown text-xl font-medium leading-normal">
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
                <Table.ColumnHeaderCell className="px-6 py-3 uppercase tracking-wider flex self-stretch text-yieldi-brown-light text-xs font-light">
                  Provider
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="px-6 py-3 uppercase tracking-wider text-yieldi-brown-light text-xs font-light">
                  My Stake
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="px-6 py-3 uppercase tracking-wider text-yieldi-brown-light text-xs font-light">
                  Total Delegation
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="px-6 py-3 uppercase tracking-wider text-yieldi-brown-light text-xs font-light text-center">
                  Commission
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="px-6 py-3 uppercase tracking-wider text-yieldi-brown-light text-xs font-light">
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
                      className="mb-[5px] items-start gap-2.5 w-full border border-yieldi-gray-200 bg-white [--table-row-box-shadow:none]"
                    >
                      <Table.Cell className="pl-6 py-4 whitespace-nowrap">
                        <div className="text-yieldi-brown text-xl font-medium">
                          {provider.description.moniker
                            ? provider.description.moniker
                            : "Unknown"}
                        </div>
                        <div className="text-yieldi-brown-light font-['GT_America_Mono_Trial'] text-sm font-normal">
                          {truncateMiddle(provider.btcPk, 5)}
                        </div>
                      </Table.Cell>
                      <Table.Cell className="px-6 py-4 whitespace-nowrap">
                        <div className="text-yieldi-brown text-xl font-normal">
                          $0.00
                        </div>
                        <div className="text-yieldi-brown-light text-sm font-normal">
                          0.0 BTC
                        </div>
                      </Table.Cell>
                      <Table.Cell className="px-6 py-4 whitespace-nowrap">
                        <div className="text-yieldi-brown text-xl font-normal">
                          $0.00
                        </div>
                        <div className="text-yieldi-brown-light text-sm font-normal">
                          {provider.totalDelegations} BTC
                        </div>
                      </Table.Cell>
                      <Table.Cell className="px-6 py-4 whitespace-nowrap">
                        <div className="text-yieldi-brown text-xl font-normal text-center">
                          {provider.commission
                            ? `${(Number(provider.commission) * 100).toFixed(0)}%`
                            : "-"}
                        </div>
                      </Table.Cell>
                      <Table.Cell className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleSelectProvider(provider)}
                          className="flex justify-center items-center w-[152px] h-[38px] px-[21px] py-[10px] 
                            gap-[10px] shrink-0 rounded bg-yieldi-brown text-yieldi-beige text-sm font-medium"
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
                  )
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
      <Staking {...stakingProps} />
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
