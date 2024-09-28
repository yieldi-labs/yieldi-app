"use client";

import { Button } from "@radix-ui/themes";
import React from "react";

import { useEthereumWallet } from "@/app/context/EthereumWalletContext";
import { useWallet } from "@/app/context/WalletContext";

export interface WalletProps {
  setConnectModalOpen: (open: boolean) => void;
}

const Wallet: React.FC<WalletProps> = ({ setConnectModalOpen }) => {
  const {
    address: btcAddress,
    isConnected: isBtcConnected,
    disconnectWallet,
  } = useWallet();
  const { ethAddress, isEthConnected, connectEthWallet, disconnectEthWallet } =
    useEthereumWallet();

  return (
    <div className="wallet-container">
      {/* Bitcoin Wallet Section */}
      <div className="btc-wallet">
        <h3>Bitcoin Wallet</h3>
        {isBtcConnected ? (
          <>
            <div>Address: {btcAddress}</div>
            <Button onClick={disconnectWallet}>Disconnect BTC Wallet</Button>
          </>
        ) : (
          <Button onClick={() => setConnectModalOpen(true)}>
            Connect BTC Wallet
          </Button>
        )}
      </div>

      {/* Ethereum Wallet Section */}
      <div className="eth-wallet">
        <h3>Ethereum Wallet</h3>
        {isEthConnected ? (
          <>
            <div>Address: {ethAddress}</div>
            <Button onClick={disconnectEthWallet}>Disconnect ETH Wallet</Button>
          </>
        ) : (
          <Button onClick={connectEthWallet}>Connect ETH Wallet</Button>
        )}
      </div>
    </div>
  );
};

export default Wallet;
