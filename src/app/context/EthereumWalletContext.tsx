"use client";

import { createContext, useContext, ReactNode } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";

interface EthereumWalletContextProps {
  ethAddress: string | undefined;
  connectEthWallet: () => void;
  disconnectEthWallet: () => void;
  isEthConnected: boolean;
}

const EthereumWalletContext = createContext<
  EthereumWalletContextProps | undefined
>(undefined);

export const EthereumWalletProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const connector = injected({
    target() {
      return {
        id: "windowProvider",
        name: "Window Provider",
        provider: window.ethereum,
      };
    },
  });
  const { address, isConnected } = useAccount();
  console.log("connector", connector);
  //   const { connect } = useConnect({
  //     connector: connector, // You can specify supported chains here
  //   });
  const { disconnect } = useDisconnect();

  const connectEthWallet = () => {
    // connect();
  };

  const disconnectEthWallet = () => {
    disconnect();
  };

  return (
    <EthereumWalletContext.Provider
      value={{
        ethAddress: address,
        connectEthWallet,
        disconnectEthWallet,
        isEthConnected: isConnected,
      }}
    >
      {children}
    </EthereumWalletContext.Provider>
  );
};

export const useEthereumWallet = () => {
  const context = useContext(EthereumWalletContext);
  if (!context) {
    throw new Error(
      "useEthereumWallet must be used within an EthereumWalletProvider"
    );
  }
  return context;
};
