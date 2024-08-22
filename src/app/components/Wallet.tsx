"use client";

import btcIcon from "@public/icons/btc.svg";
import { DropdownMenu, Button, Card } from "@radix-ui/themes";
import { networks } from "bitcoinjs-lib";
import Image from "next/image";
import { useCallback, useState } from "react";

import { ConnectModal } from "@/app/components/Modals/ConnectModal";
import { ErrorModal } from "@/app/components/Modals/ErrorModal";
import { useError } from "@/app/context/Error/ErrorContext";
import { ErrorState } from "@/app/types/errors";
import { WalletError, WalletErrorType } from "@/app/utils/errors";
import { getPublicKeyNoCoord, isSupportedAddressType, toNetwork } from "@/app/utils/wallet";
import { WalletProvider } from "@/app/utils/wallet/wallet_provider";


export default function Wallet() {

  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [btcWallet, setBTCWallet] = useState<WalletProvider>();
  const [btcWalletBalanceSat, setBTCWalletBalanceSat] = useState(0);
  const [_btcWalletNetwork, setBTCWalletNetwork] = useState<networks.Network>();
  const [publicKeyNoCoord, setPublicKeyNoCoord] = useState("");

  const [address, setAddress] = useState("");
  const { error, isErrorOpen, showError, hideError, retryErrorAction } =
    useError();

  const handleDisconnectBTC = () => {
    setBTCWallet(undefined);
    setBTCWalletBalanceSat(0);
    setBTCWalletNetwork(undefined);
    setPublicKeyNoCoord("");
    setAddress("");
  };

  const handleConnectBTC = useCallback(
    async (walletProvider: WalletProvider) => {
      // close the modal
      setConnectModalOpen(false);

      try {
        await walletProvider.connectWallet();
        const address = await walletProvider.getAddress();
        // check if the wallet address type is supported in babylon
        const supported = isSupportedAddressType(address);
        if (!supported) {
          throw new Error(
            "Invalid address type. Please use a Native SegWit or Taproot",
          );
        }

        const balanceSat = await walletProvider.getBalance();
        const publicKeyNoCoord = getPublicKeyNoCoord(
          await walletProvider.getPublicKeyHex(),
        );
        setBTCWallet(walletProvider);
        setBTCWalletBalanceSat(balanceSat);
        setBTCWalletNetwork(toNetwork(await walletProvider.getNetwork()));
        setAddress(address);
        setPublicKeyNoCoord(publicKeyNoCoord.toString("hex"));
      } catch (error: Error | any) {
        if (
          error instanceof WalletError &&
          error.getType() === WalletErrorType.ConnectionCancelled
        ) {
          // User cancelled the connection, hence do nothing
          return;
        }
        let errorMessage;
        switch (true) {
          case /Incorrect address prefix for (Testnet \/ Signet|Mainnet)/.test(
            error.message,
          ):
            errorMessage =
              "Unsupported address type detected. Please use a Native SegWit or Taproot address.";
            break;
          default:
            errorMessage = error.message;
            break;
        }
        showError({
          error: {
            message: errorMessage,
            errorState: ErrorState.WALLET,
            errorTime: new Date(),
          },
          retryAction: () => handleConnectBTC(walletProvider),
        });
        console.error(errorMessage);
      }
    },
    [showError],
  );

  const truncateMiddle = (str: string, padding: number) => {
    return str.length <= padding * 2
      ? str
      : str.slice(0, padding) + "…" + str.slice(-1 * padding);
  }

  return (<>
    <DropdownMenu.Root modal={false}>
      {btcWallet ? 
        <>
          <DropdownMenu.Trigger>
            <Button variant="soft" className="cursor-pointer">
              <span><Image src={btcIcon} width={18} height={18} alt="btc" /></span> {truncateMiddle(address, 5)} | {btcWalletBalanceSat / 1e8 } BTC 
              <DropdownMenu.TriggerIcon />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content className="z-50">
            <DropdownMenu.Sub>
              <DropdownMenu.Item className="cursor-pointer" onClick={handleDisconnectBTC}>Disconnect</DropdownMenu.Item>
            </DropdownMenu.Sub>
          </DropdownMenu.Content>
        </> : 
        <>
          <Button variant="soft" className="cursor-pointer" onClick={() => setConnectModalOpen(true)}>
            Connect Wallet
          </Button>
        </>
      }
    </DropdownMenu.Root>
    <ConnectModal
      open={connectModalOpen}
      onClose={() => setConnectModalOpen(false)}
      onConnect={handleConnectBTC}
      connectDisabled={!!address} />
    <ErrorModal
      open={isErrorOpen}
      errorMessage={error.message}
      errorState={error.errorState}
      errorTime={error.errorTime}
      onClose={hideError}
      onRetry={retryErrorAction} />
  </>);
}
