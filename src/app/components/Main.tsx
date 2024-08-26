"use client";

import "react-responsive-modal/styles.css";

import { NextPage } from "next";
import { ReactNode, useState } from "react";

import { ConnectModal } from "@/app/components/Modals/ConnectModal";
import { ErrorModal } from "@/app/components/Modals/ErrorModal";
import Navbar from "@/app/components/Navbar";
import { useError } from "@/app/context/Error/ErrorContext";
import { useWallet } from "@/app/context/WalletContext"; // Import the useWallet hook
import QueryClientProvider from "@/lib/providers/QueryClientProvider";

export interface MainProps {
  children: ReactNode;
}

const Main: NextPage<MainProps> = ({ children }: { children: ReactNode }) => {
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const { address: walletAddress, connectWallet } = useWallet();
  const { error, isErrorOpen, hideError, retryErrorAction } = useError();

  const handleConnectBTC = async (walletProvider: any) => {
    await connectWallet(walletProvider);
    setConnectModalOpen(false);
  };

  return (
    <div>
      <Navbar setConnectModalOpen={setConnectModalOpen} />
      <QueryClientProvider>
        <main className="h-screen grow pt-24">
          {children}
        </main>
      </QueryClientProvider>
      <ConnectModal
        open={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
        onConnect={handleConnectBTC}
        connectDisabled={!!walletAddress}
      />
      <ErrorModal
        open={isErrorOpen}
        errorMessage={error?.message}
        errorState={error?.errorState}
        errorTime={error?.errorTime}
        onClose={hideError}
        onRetry={retryErrorAction}
      />
    </div>
  );
};

export default Main;
