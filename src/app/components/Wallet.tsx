"use client";

import * as ecc from "@bitcoin-js/tiny-secp256k1-asmjs";
import { DropdownMenu, Button } from "@radix-ui/themes";
import * as bitcoin from "bitcoinjs-lib";
import { NextPage } from "next";
import { useEffect } from "react";

import { useWallet } from "@/app/context/WalletContext";
import { truncateMiddle } from "@/utils/strings";

import { ConnectButton } from "./connectButton";
export interface WalletProps {
  setConnectModalOpen: (open: boolean) => void;
}

const Wallet: NextPage<WalletProps> = ({ setConnectModalOpen }) => {
  const { address, btcWallet, disconnectWallet, isConnected } = useWallet();

  useEffect(() => {
    if (isConnected && btcWallet) {
      bitcoin.initEccLib(ecc);
    }
  }, [isConnected, btcWallet]);

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
