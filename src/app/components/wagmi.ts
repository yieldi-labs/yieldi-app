import { createClient } from "viem";
import { http, createConfig } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";

export const wagmiClient = createConfig({
  chains: [mainnet, sepolia],

  client({ chain }) {
    return createClient({ chain, transport: http() });
  },
});
