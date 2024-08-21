"use client";

import { ConnectModal } from "@/app/components/Modals/ConnectModal";
import { useCallback, useState } from "react";
import { WalletProvider } from "@/app/utils/wallet/wallet_provider";
import { networks } from "bitcoinjs-lib";
import { useError } from "@/app/context/Error/ErrorContext";
import { getPublicKeyNoCoord, isSupportedAddressType, toNetwork } from "@/app/utils/wallet";
import { WalletError, WalletErrorType } from "@/app/utils/errors";
import { ErrorState } from "@/app/types/errors";
import { ErrorModal } from "@/app/components/Modals/ErrorModal";

export default function Wallet() {

  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [btcWallet, setBTCWallet] = useState<WalletProvider>();
  const [btcWalletBalanceSat, setBTCWalletBalanceSat] = useState(0);
  const [btcWalletNetwork, setBTCWalletNetwork] = useState<networks.Network>();
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

  return (
    <main className="relative">
      <div className="z-10 text-sm lg:flex">
        <button onClick={() => setConnectModalOpen(true)}>
          Connect Wallet
        </button>
        {btcWallet && (
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center justify-center">
              <span className="ml-2">Bitcoin</span>
            </div>
            <div className="flex items-center justify-center">
              <span>Address: {address}</span>
              <button onClick={handleDisconnectBTC}>Disconnect</button>
            </div>
            <div className="flex items-center justify-center">
              <span>Balance: {btcWalletBalanceSat} sats</span>
            </div>
            <div className="flex items-center justify-center">
              <span>Public Key: {publicKeyNoCoord}</span>
            </div>
          </div>
        )}
      </div>
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
        onRetry={retryErrorAction}
      />
    </main>
  );
}
