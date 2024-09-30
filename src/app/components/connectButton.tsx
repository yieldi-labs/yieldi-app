"use client";

import {
  useAccountModal,
  useConnectModal,
  useChainModal,
} from "@rainbow-me/rainbowkit";
import { useRef, useEffect } from "react";
import { useAccount, useDisconnect } from "wagmi";

export const ConnectButton = () => {
  const { isConnecting, address, isConnected, chain } = useAccount();

  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();
  const { openChainModal } = useChainModal();
  const { disconnect } = useDisconnect();

  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
  }, []);

  if (!isConnected) {
    return (
      <button
        className="btn"
        onClick={async () => {
          // Disconnecting wallet first because sometimes when is connected but the user is not connected
          if (isConnected) {
            disconnect();
          }
          openConnectModal?.();
        }}
        disabled={isConnecting}
      >
        {isConnecting ? "Connecting..." : "Connect your wallet"}
      </button>
    );
  }
  if (isConnected && !chain) {
    return (
      <button className="btn" onClick={openChainModal}>
        Wrong network
      </button>
    );
  }
  return (
    <div className="max-w-5xl w-full flex items-center justify-between">
      <div
        className="flex justify-center items-center px-4 py-2 border border-neutral-700 bg-neutral-800/30 rounded-xl font-mono font-bold gap-x-2 cursor-pointer"
        onClick={async () => openAccountModal?.()}
      >
        <p>{address}</p>
      </div>
    </div>
  );
};
