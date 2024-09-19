"use client";

import { Table } from "@radix-ui/themes";
import Image from "next/image";
import { Suspense, useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";

import BackButton from "@/app/components/BackButton";
import MetricsGrid from "@/app/components/Staking/Metrics";
import { Staking, StakingProps } from "@/app/components/Staking/Staking";
import { useData } from "@/app/context/DataContext";
import { useFinalityProviders } from "@/app/context/FinalityProvidersContext";
import { useStake } from "@/app/context/StakeContext";
import { useWallet } from "@/app/context/WalletContext";
import { Delegation } from "@/app/types/delegations";
import { FinalityProvider } from "@/app/types/finalityProviders";
import { satoshiToBtc } from "@/utils/btcConversions";
import { getDelegationsLocalStorageKey } from "@/utils/local_storage/getDelegationsLocalStorageKey";
import { maxDecimals } from "@/utils/maxDecimals";
import { truncateMiddle } from "@/utils/strings";
import wBtcIcon from "@public/icons/wbtc.svg";

import MobileFinalityProvidersView from "./MobileFinalityProvidersView";

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

  const { finalityProviders } = useFinalityProviders();
  const [btcHeight, setBtcHeight] = useState<number | undefined>(undefined);
  const delegationsLocalStorageKey =
    getDelegationsLocalStorageKey(publicKeyNoCoord);
  const [_, setDelegationsLocalStorage] = useLocalStorage<Delegation[]>(
    delegationsLocalStorageKey,
    [],
  );
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
        },
      );
    }
  }, [btcWallet]);

  const { statsData } = useData();

  const confirmedTvl = statsData?.totalTVLSat
    ? `${maxDecimals(satoshiToBtc(statsData.activeTVLSat), 8)}`
    : "0";

  return (
    <>
      <div className="lg:w-3/4 mx-auto px-4 md:px-16 lg:px-0">
        <div>
          <BackButton text="STAKE DETAILS" />
        </div>
        <div className="flex items-baseline mb-4">
          <h1 className="text-yieldi-brown text-2xl font-bold mr-4 font-gt-america-ext">
            Choose Finality Provider
          </h1>
          <p className="text-yieldi-brown/80 text-lg font-light border-l border-yieldi-brown ps-3 hidden md:block">
            Select to delegate stake
          </p>
        </div>
        <div className="w-full mb-6 bg-white">
          <div className="border-2 border-yieldi-gray-200">
            <div className="flex items-center p-4 border-b-2 border-yieldi-gray-200">
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
            <MetricsGrid confirmedTvl={confirmedTvl} assetSymbol={"BTC"} />
          </div>
        </div>

        {/* Desktop Finality Providers Table */}
        <div className="pb-12">
          <Table.Root className="hidden md:block">
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
                        <div className="text-yieldi-brown-light font-gt-america-mono text-sm font-normal">
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
                      <Table.Cell className="px-6 py-4 whitespace-nowrap align-middle">
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
                  ),
              )}
            </Table.Body>
          </Table.Root>

          {/* Mobile Finality Providers */}
          <MobileFinalityProvidersView
            finalityProviders={finalityProviders}
            handleSelectProvider={handleSelectProvider}
          />
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
