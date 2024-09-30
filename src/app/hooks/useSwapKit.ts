import { Chain, createSwapKit, EVMChains, WalletOption } from "@swapkit/sdk";
import { useState, useCallback } from "react";

export const useSwapKit = () => {
  const [client] = useState(() => createSwapKit());
  const [isConnected, setIsConnected] = useState(false);

  const connectWallet = useCallback(
    async (walletOption: WalletOption, phrase?: string) => {
      try {
        let connection;

        switch (walletOption) {
          case WalletOption.KEYSTORE:
            if (!phrase)
              throw new Error("Phrase is required for KEYSTORE option");
            connection = await client.connectKeystore(
              [Chain.Ethereum, Chain.Bitcoin, Chain.THORChain],
              phrase,
            );
            break;

          case WalletOption.XDEFI:
            connection = await client.connectXDEFI([
              Chain.Bitcoin,
              Chain.Ethereum,
              Chain.THORChain,
            ]);
            break;

          case WalletOption.METAMASK:
            connection = await client.connectEVMWallet(
              [EVMChains[4]],
              WalletOption.METAMASK,
            );
            break;

          case WalletOption.OKX:
            connection = await client.connectOkx([
              Chain.Ethereum,
              Chain.Bitcoin,
            ]);
            break;

          default:
            throw new Error("Unsupported wallet option");
        }

        setIsConnected(true);
        return connection;
      } catch (error) {
        console.error("Failed to connect wallet:", error);
        setIsConnected(false);
        throw error;
      }
    },
    [client],
  );

  const disconnectWallet = useCallback(async () => {
    try {
      client.disconnectAll();
      setIsConnected(false);
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
      throw error;
    }
  }, [client]);

  return {
    client,
    isConnected,
    connectWallet,
    disconnectWallet,
  };
};
