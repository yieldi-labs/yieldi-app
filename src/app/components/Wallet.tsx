"use client";

import * as ecc from "@bitcoin-js/tiny-secp256k1-asmjs";
import { DropdownMenu, Button } from "@radix-ui/themes";
import * as bitcoin from "bitcoinjs-lib";
import { NextPage } from "next";
import Image from "next/image";
import { useEffect } from "react";

import { useWallet } from "@/app/context/WalletContext";
import { truncateMiddle } from "@/utils/strings";
import btcIcon from "@public/icons/btc.svg";
export interface WalletProps {
  setConnectModalOpen: (open: boolean) => void;
}

const Wallet: NextPage<WalletProps> = ({ setConnectModalOpen }) => {
  const {
    address,
    btcWallet,
    btcWalletBalanceSat,
    disconnectWallet,
    isConnected,
  } = useWallet();

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
              <Button variant="soft" className="cursor-pointer">
                <span>
                  <Image src={btcIcon} width={18} height={18} alt="btc" />
                </span>{" "}
                {truncateMiddle(address, 5)} | {btcWalletBalanceSat / 1e8} BTC
                <DropdownMenu.TriggerIcon />
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
              className="cursor-pointer"
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
