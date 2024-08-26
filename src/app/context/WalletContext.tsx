"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";

import { WalletProvider as WalletProviderType } from "@/utils/wallet/wallet_provider";

interface WalletContextProps {
  btcWallet: WalletProviderType | undefined;
  btcWalletBalanceSat: number;
  address: string;
  connectWallet: (walletProvider: WalletProviderType) => Promise<void>;
  disconnectWallet: () => void;
  isConnected: boolean;
}

const WalletContext = createContext<WalletContextProps | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [btcWallet, setBTCWallet] = useState<WalletProviderType>();
  const [btcWalletBalanceSat, setBTCWalletBalanceSat] = useState(0);
  const [address, setAddress] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  const connectWallet = useCallback(
    async (walletProvider: WalletProviderType) => {
      try {
        await walletProvider.connectWallet();
        const walletAddress = await walletProvider.getAddress();
        const balanceSat = await walletProvider.getBalance();

        setBTCWallet(walletProvider);
        setBTCWalletBalanceSat(balanceSat);
        setAddress(walletAddress);
        setIsConnected(true);
        console.log({ btcWallet, btcWalletBalanceSat, address });
      } catch (error) {
        console.error("Failed to connect wallet:", error);
        throw new Error("Failed to connect wallet");
      }
    },
    [address, btcWallet, btcWalletBalanceSat],
  );

  const disconnectWallet = () => {
    setBTCWallet(undefined);
    setBTCWalletBalanceSat(0);
    setAddress("");
    setIsConnected(false);
  };

  return (
    <WalletContext.Provider
      value={{
        btcWallet,
        btcWalletBalanceSat,
        address,
        connectWallet,
        disconnectWallet,
        isConnected,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
