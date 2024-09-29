"use client";

import { Chain, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http, createStorage, cookieStorage } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";

const projectId = process.env.REACT_APP_RAINBOW_PROJECT_ID || "";

const supportedChains: Chain[] = [mainnet, sepolia];

export const config = getDefaultConfig({
  appName: "Yieldi",
  projectId,
  chains: supportedChains as any,
  storage: createStorage({
    storage: cookieStorage,
  }),
  transports: supportedChains.reduce(
    (object, chain) => ({ ...object, [chain.id]: http() }),
    {}
  ),
});
