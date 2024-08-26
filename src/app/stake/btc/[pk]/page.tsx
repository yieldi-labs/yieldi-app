"use client";

import { networks } from "bitcoinjs-lib";
import { useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";

import { Staking, StakingProps } from "@/app/components/Staking/Staking";
import { useStake } from "@/app/context/StakeContext";
import { useWallet } from "@/app/context/WalletContext";
import { Delegation } from "@/app/types/delegations";
import { getDelegationsLocalStorageKey } from "@/utils/local_storage/getDelegationsLocalStorageKey";
import { toNetwork } from "@/utils/wallet";

const StakeBTCDetailPage = () => {
  const { selectedDelegation } = useStake();
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
  }, [btcWallet]);

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
    selectedFinalityProvider: selectedDelegation,
    setDelegationsLocalStorage,
  };

  return <Staking {...stakingProps} />;
};

export default StakeBTCDetailPage;
