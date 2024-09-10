"use client";

import * as ecc from "@bitcoin-js/tiny-secp256k1-asmjs";
import { DropdownMenu, Button } from "@radix-ui/themes";
import * as bitcoin from "bitcoinjs-lib";
import { NextPage } from "next";
import { useEffect } from "react";

import { useWallet } from "@/app/context/WalletContext";
import { truncateMiddle } from "@/utils/strings";
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
        {isConnected && btcWallet ? (
          <>
            <DropdownMenu.Trigger>
              <Button className="cursor-pointer w-[173px] h-[55px] bg-yieldi-dark-gray text-white rounded-none">
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
          <>
            <Button
              variant="soft"
              className="cursor-pointer w-[173px] h-[55px] rounded-none bg-yieldi-green text-black"
              onClick={() => setConnectModalOpen(true)}
            >
              Connect Wallet
            </Button>
          </>
        )}
      </DropdownMenu.Root>
    </>
  );
};

export default Wallet;
