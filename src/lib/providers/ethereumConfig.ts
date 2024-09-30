"use client";

import { Chain, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http, createStorage, cookieStorage } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECTID;

const supportedChains: Chain[] = [mainnet, sepolia];

export const config = getDefaultConfig({
  appName: "Yieldi",

  projectId: projectId || "",
  chains: supportedChains as any,
  storage: createStorage({
    storage: cookieStorage,
  }),
  transports: supportedChains.reduce(
    (object, chain) => ({ ...object, [chain.id]: http() }),
    {}
  ),
  ssr: true,
});
