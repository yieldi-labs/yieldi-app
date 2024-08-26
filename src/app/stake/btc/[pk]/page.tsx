"use client";

import { networks } from "bitcoinjs-lib";
import { useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";

import { Staking, StakingProps } from "@/app/components/Staking/Staking";
import { useFinalityProviders } from "@/app/context/FinalityProvidersContext";
import { useWallet } from "@/app/context/WalletContext";
import { Delegation } from "@/app/types/delegations";
import { FinalityProvider } from "@/app/types/finalityProviders";
import { getDelegationsLocalStorageKey } from "@/utils/local_storage/getDelegationsLocalStorageKey";
import { toNetwork } from "@/utils/wallet";

const StakeBTCDetailPage = ({ params }: { params: { pk: string } }) => {
  const { pk } = params;
  const finalityProvidersContext = useFinalityProviders();
  const {
    btcWallet,
    btcWalletBalanceSat,
    address,
    isConnected,
    publicKeyNoCoord,
    setConnectModalOpen,
  } = useWallet();
  const [btcHeight, setBtcHeight] = useState<number | undefined>(undefined);
  const [btcWalletNetwork, setBtcWalletNetwork] = useState<networks.Network>();
  const delegationsLocalStorageKey =
    getDelegationsLocalStorageKey(publicKeyNoCoord);
  const [, setDelegationsLocalStorage] = useLocalStorage<Delegation[]>(
    delegationsLocalStorageKey,
    [],
  );
  const [selectedFinalityProvider, setSelectedFinalityProvider] = useState<
    FinalityProvider | undefined
  >(undefined);

  useEffect(() => {
    //TODO: add auto refresh for btc height for every minute
    if (btcWallet) {
      Promise.all([btcWallet.getBTCTipHeight(), btcWallet.getNetwork()]).then(
        ([height, network]) => {
          setBtcHeight(height);
          setBtcWalletNetwork(toNetwork(network));
        },
      );
    }

    console.log({
      pk,
      selectedFinalityProvider,
      finalityProviders: finalityProvidersContext,
    });
    if (pk && finalityProvidersContext.finalityProviders) {
      const selectedFinalityProvider =
        finalityProvidersContext.finalityProviders.find(
          (fp) => fp.btcPk === pk,
        );
      setSelectedFinalityProvider(selectedFinalityProvider);
    }
  }, [
    btcWallet,
    pk,
    finalityProvidersContext,
    selectedFinalityProvider,
    isConnected,
  ]);

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
  };

  return <Staking {...stakingProps} />;
};

export default StakeBTCDetailPage;
