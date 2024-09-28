"use client";

import Image from "next/image";
import { Suspense, useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";

import BackButton from "@/app/components/BackButton";
import MetricsGrid from "@/app/components/Staking/Metrics";
import { Staking, StakingProps } from "@/app/components/Staking/Staking";
import { useAssets } from "@/app/context/AssetContext";
import { useData } from "@/app/context/DataContext";
import { useFinalityProviders } from "@/app/context/FinalityProvidersContext";
import { useStake } from "@/app/context/StakeContext";
import { useWallet } from "@/app/context/WalletContext";
import { useGetDelegations } from "@/app/hooks/useGetDelegations";
import { Delegation, DelegationState } from "@/app/types/delegations";
import { FinalityProvider } from "@/app/types/finalityProviders";
import { satoshiToBtc } from "@/utils/btcConversions";
import { getDelegationsLocalStorageKey } from "@/utils/local_storage/getDelegationsLocalStorageKey";
import { maxDecimals } from "@/utils/maxDecimals";
import wBtcIcon from "@public/icons/wbtc.svg";

import DesktopFinalityProvidersView from "./DesktopFinalityProvidersView";
import MobileFinalityProvidersView from "./MobileFinalityProvidersView";

const StakeBTCPage = () => {
  const { setSelectedDelegation } = useStake();
  const {
    btcWallet,
    address,
    publicKeyNoCoord,
    btcWalletNetwork,
    btcWalletBalanceSat,
    isConnected,
    setConnectModalOpen,
  } = useWallet();
  const { assets } = useAssets();
  const { finalityProviders } = useFinalityProviders();
  const { statsData } = useData();

  const [btcHeight, setBtcHeight] = useState<number | undefined>(undefined);
  const [selectedFinalityProvider, setSelectedFinalityProvider] = useState<
    FinalityProvider | undefined
  >(undefined);
  const [stakingDialogIsOpen, setStakingDialogIsOpen] = useState(false);

  const delegation = useGetDelegations(address, publicKeyNoCoord);
  const delegationsLocalStorageKey =
    getDelegationsLocalStorageKey(publicKeyNoCoord);
  const [_, setDelegationsLocalStorage] = useLocalStorage<Delegation[]>(
    delegationsLocalStorageKey,
    [],
  );

  const activeDelegations: Delegation[] =
    delegation?.delegations?.delegations?.filter(
      (item: Delegation) => item.state === DelegationState.ACTIVE,
    ) || [];

  const simplifiedDelegations = activeDelegations.map((item) => ({
    finalityProviderPkHex: item.finalityProviderPkHex,
    stakingValueSat: item.stakingValueSat,
  }));

  const asset = assets.find((asset) => asset.assetSymbol === "BTC");

  const handleSelectProvider = (delegation: FinalityProvider) => {
    setSelectedDelegation(delegation);
    setSelectedFinalityProvider(delegation);
    setStakingDialogIsOpen(true);
  };

  const stakingProps: StakingProps = {
    btcHeight,
    btcWallet,
    btcWalletNetwork,
    btcWalletBalanceSat,
    isWalletConnected: isConnected,
    onConnect: () => setConnectModalOpen(true),
    address,
    publicKeyNoCoord,
    selectedFinalityProvider,
    setDelegationsLocalStorage,
    isOpen: stakingDialogIsOpen,
    onCloseDialog: () => {
      setStakingDialogIsOpen(false);
      setSelectedFinalityProvider(undefined);
    },
  };

  useEffect(() => {
    if (btcWallet) {
      Promise.all([btcWallet.getBTCTipHeight(), btcWallet.getNetwork()]).then(
        ([height, _network]) => {
          setBtcHeight(height);
        },
      );
    }
  }, [btcWallet]);

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
            <MetricsGrid confirmedTvl={confirmedTvl} assetSymbol="BTC" />
          </div>
        </div>

        <div className="pb-12">
          <DesktopFinalityProvidersView
            finalityProviders={finalityProviders}
            simplifiedDelegations={simplifiedDelegations}
            asset={asset}
            handleSelectProvider={handleSelectProvider}
          />
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
