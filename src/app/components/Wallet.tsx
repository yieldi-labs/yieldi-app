"use client";

import { Button } from "@radix-ui/themes";
import React from "react";

import { useEthereumWallet } from "@/app/context/EthereumWalletContext";
import { useWallet } from "@/app/context/WalletContext";
import { truncateMiddle } from "@/utils/strings";

import { ConnectButton } from "./connectButton";
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
    <>
      <DropdownMenu.Root modal={false}>
        <div className="md:justify-end flex border-x border-yieldi-gray-200 flex-1 md:flex-none">
          {isConnected && btcWallet ? (
            <>
              <DropdownMenu.Trigger>
                <Button className="cursor-pointer md:w-[166px] h-[56px] bg-yieldi-dark-gray text-white rounded-none w-full font-gt-america-mono">
                  <span>{truncateMiddle(address, 5)}</span>
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content className="z-50">
                <DropdownMenu.Sub>
                  <DropdownMenu.Item
                    className="cursor-pointer"
                    onClick={disconnectWallet}
                  >
                    Disconnect
                  </DropdownMenu.Item>
                </DropdownMenu.Sub>
              </DropdownMenu.Content>
            </>
          ) : (
            <Button
              variant="soft"
              className="cursor-pointer md:w-[166px] h-[56px] rounded-none bg-yieldi-green text-black w-full uppercase font-gt-america-mono"
              onClick={() => setConnectModalOpen(true)}
            >
              Connect Wallet
            </Button>
          )}
          <ConnectButton />
        </div>
      </DropdownMenu.Root>
    </>
  );
};

export default Wallet;
