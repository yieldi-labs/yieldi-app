"use client";

import "react-responsive-modal/styles.css";

// import { QueryClient } from "@tanstack/react-query";
import { networks } from "bitcoinjs-lib";
import { NextPage } from "next";
import { ReactNode, useCallback, useState } from "react";

import { ConnectModal } from "@/app/components/Modals/ConnectModal";
import { ErrorModal } from "@/app/components/Modals/ErrorModal";
import Navbar from "@/app/components/Navbar";
import { useError } from "@/app/context/Error/ErrorContext";
import { ErrorState } from "@/app/types/errors";
// import QueryClientProvider from "@/lib/providers/QueryClientProvider";
import { WalletError, WalletErrorType } from "@/utils/errors";
import {
  getPublicKeyNoCoord,
  isSupportedAddressType,
  toNetwork,
} from "@/utils/wallet";
import { WalletProvider } from "@/utils/wallet/wallet_provider";

export interface MainProps {
  children: ReactNode;
}

const Main: NextPage<MainProps> = ({ children }: { children: ReactNode }) => {
  // const [queryClient] = useState(() => new QueryClient());
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [btcWallet, setBTCWallet] = useState<WalletProvider>();
  const [btcWalletBalanceSat, setBTCWalletBalanceSat] = useState(0);
  const [_btcWalletNetwork, setBTCWalletNetwork] = useState<networks.Network>();
  const [, setPublicKeyNoCoord] = useState("");
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

  return (
    <div>
      <Navbar
        address={address}
        setConnectModalOpen={setConnectModalOpen}
        btcWallet={btcWallet}
        btcWalletBalanceSat={btcWalletBalanceSat}
        handleDisconnectBTC={handleDisconnectBTC}
      />
      <main className="h-screen grow pt-24">{children}</main>
      <ConnectModal
        open={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
        onConnect={handleConnectBTC}
        connectDisabled={!!address}
      />
      <ErrorModal
        open={isErrorOpen}
        errorMessage={error.message}
        errorState={error.errorState}
        errorTime={error.errorTime}
        onClose={hideError}
        onRetry={retryErrorAction}
      />
    </div>
  );
};

export default Main;
