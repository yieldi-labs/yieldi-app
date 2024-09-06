"use client";

import "react-responsive-modal/styles.css";

import { NextPage } from "next";
import { ReactNode } from "react";

import { ConnectModal } from "@/app/components/Modals/ConnectModal";
import Navbar from "@/app/components/Navbar";
import { useWallet } from "@/app/context/WalletContext"; // Import the useWallet hook
import QueryClientProvider from "@/lib/providers/QueryClientProvider";

import { useFetchFinalityProviders } from "../hooks/useFetchFinalityProviders";

export interface MainProps {
  children: ReactNode;
}

const Main: NextPage<MainProps> = ({ children }: { children: ReactNode }) => {
  useFetchFinalityProviders();

  const { connectWallet, connectModalOpen, setConnectModalOpen } = useWallet();
  const handleConnectBTC = async (walletProvider: any) => {
    await connectWallet(walletProvider);
    setConnectModalOpen(false);
  };

  return (
    <div className="bg-yieldi-beige">
      <Navbar setConnectModalOpen={setConnectModalOpen} />
      <QueryClientProvider>
        <main className="h-screen grow pt-24">{children}</main>
      </QueryClientProvider>
      <ConnectModal
        open={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
        onConnect={handleConnectBTC}
      />
    </div>
  );
};

export default Main;
