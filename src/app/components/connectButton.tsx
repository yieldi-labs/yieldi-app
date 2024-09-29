"use client";

import { useRef, useEffect } from "react";
import {
  useAccountModal,
  useConnectModal,
  useChainModal,
} from "@rainbow-me/rainbowkit";
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
};
