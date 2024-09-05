"use client";

import { Table, Button, Card } from "@radix-ui/themes";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

import { getGlobalParams } from "@/app/api/getGlobalParams";
import { getStats } from "@/app/api/getStats";
import { assets } from "@/app/config/StakedAssets";
import { useWallet } from "@/app/context/WalletContext";
import { useGetDelegations } from "@/app/hooks/useGetDelegations";
import { DelegationState } from "@/app/types/delegations";
import { satoshiToBtc } from "@/utils/btcConversions";
import { getCurrentGlobalParamsVersion } from "@/utils/globalParams";
import { maxDecimals } from "@/utils/maxDecimals";

const StakedAssetDetails: React.FC = () => {
  const pathname = usePathname(); // Access dynamic route parameter
  const pathParts = pathname.split("/");
  const assetSymbol = pathParts.length > 2 ? pathParts[2] : null;
  const [btcHeight, setBtcHeight] = useState<number | undefined>(undefined);
  const [remainingBlocks, setRemainingBlocks] = useState<number>(0);
  const {
    address,
    btcWallet,
    publicKeyNoCoord,
    isConnected,
    btcWalletBalanceSat,
  } = useWallet();
  const router = useRouter(); // To handle the back navigation
  const asset = assets.find(
    (asset) => asset.assetSymbol.toLowerCase() === assetSymbol
  );
  const { data: paramWithContext } = useQuery({
    queryKey: ["global params"],
    queryFn: async () => {
      const [height, versions] = await Promise.all([
        btcWallet!.getBTCTipHeight(),
        getGlobalParams(),
      ]);
      return {
        // The staking parameters are retrieved based on the current height + 1
        // so this verification should take this into account.
        currentHeight: height,
        nextBlockParams: getCurrentGlobalParamsVersion(height + 1, versions),
        versions,
      };
    },
    refetchInterval: 60000, // 1 minute
    // Should be enabled only when the wallet is connected
    enabled: !!btcWallet,
    retry: (failureCount: number) => {
      return failureCount <= 3;
    },
  });
  const activationHeight =
    paramWithContext?.nextBlockParams?.currentVersion?.activationHeight;
  console.log("activationHeight", activationHeight);

  const stakingCap = maxDecimals(
    satoshiToBtc(
      paramWithContext?.nextBlockParams?.currentVersion?.maxStakingAmountSat ||
        0
    ),
    8
  );

  useEffect(() => {
    if (btcWallet) {
      Promise.all([btcWallet.getBTCTipHeight(), btcWallet.getNetwork()]).then(
        ([height]) => {
          setBtcHeight(height);
        }
      );

      setRemainingBlocks(activationHeight || 0 - (btcHeight || 0) - 1);
    }
  }, [
    activationHeight,
    btcHeight,
    btcWallet,
    isConnected,
    paramWithContext?.nextBlockParams?.currentVersion?.activationHeight,
  ]);

  const {
    delegations,
    fetchNextDelegationsPage,
    hasNextDelegationsPage,
    isFetchingNextDelegationsPage,
  } = useGetDelegations(address, publicKeyNoCoord);

  const { data } = useQuery({
    queryKey: ["API_STATS"],
    queryFn: async () => getStats(),
    refetchInterval: 60000, // 1 minute
    retry: (failureCount) => {
      return failureCount <= 3;
    },
  });
  console.log("data", data);

  const confirmedTvl = data?.totalTVLSat
    ? `${maxDecimals(satoshiToBtc(data.activeTVLSat), 8)}`
    : 0;

  const currentVersion = paramWithContext?.nextBlockParams?.currentVersion;
  console.log("currentVersion", currentVersion);

  const balance = satoshiToBtc(btcWalletBalanceSat);

  let totalStakedSat = 0;

  if (delegations) {
    totalStakedSat = delegations.delegations
      .filter((delegation) => delegation?.state === DelegationState.ACTIVE)
      .reduce(
        (accumulator: number, item) => accumulator + item?.stakingValueSat,
        0
      );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 pb-16">
      {/* Back Button */}
      <Button onClick={() => router.push("/stake")} variant="ghost">
        &larr; Assets
      </Button>

      <Card variant="classic" className="p-6 mb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-5">
            <Image
              src={`/${asset?.assetSymbol}.svg`}
              alt={`${asset?.assetSymbol} Logo`}
              width={0}
              height={0}
              className="size-12"
            />
            <h2 className="text-3xl font-bold">
              {asset?.assetSymbol.toUpperCase()}
            </h2>
            <p className="text">{asset?.assetName}</p>
          </div>
          <Button
            className={`hidden sm:block cursor-pointer w-[173px] h-[55px] bg-[#A1FD59] text-black rounded-none ${
              !isConnected ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={!isConnected}
          >
            STAKE
          </Button>
        </div>

        <div className="p-2 mt-6">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 text-left">
            <Card variant="ghost" className="border rounded-none">
              <p className="">TVL</p>
              <p className="text-lg font-semibold">
                {confirmedTvl}
                {" BTC"}
              </p>
            </Card>
            <Card variant="ghost" className="border rounded-none">
              <p>Cap</p>
              <p className="text-lg font-semibold">{stakingCap}{" BTC"}</p>
            </Card>
            <Card variant="ghost" className="border rounded-none">
              <p>Staking Window</p>
              <p className="text-lg font-semibold">
                {btcWallet ? `${remainingBlocks} blocks` : "0 blocks"}
              </p>
            </Card>
            <Card variant="ghost" className="border rounded-none">
              <p>Price</p>
              <p className="text-lg font-semibold">$60,000</p>
            </Card>
          </div>
        </div>
      </Card>

      {/* My Stake */}
      <Card className="p-6 mb-4 rounded-none">
        <h3 className="text-xl font-semibold mb-4">My Stake</h3>
        <div className="grid grid-cols-2 gap-6">
          <Card variant="ghost" className="border rounded-none">
            <p className="text-gray-500">Wallet Balance</p>
            <p className="flex text-lg font-bold">
              {balance}
              {" BTC"}
            </p>
            <p className="hidden sm:block text-xs">
              {"$"}
              {balance ?? 0 * (asset?.price ?? 1)}
            </p>
          </Card>
          <Card variant="ghost" className="border rounded-none">
            <p className="text-gray-500">Staked Balance</p>
            <p className="flex text-lg font-bold">
              {totalStakedSat}
              {" BTC"}
            </p>
            <p className="hidden sm:block text-xs">
              {"$"}
              {balance ?? 0 * (asset?.price ?? 1)}
            </p>
          </Card>
        </div>
      </Card>

      {/* Transactions Table - Mobile View */}
      <div className="grid gap-4">
        <Card variant="classic" className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">Babylon Foundation</p>
              <p className="text-xs text-gray-500">bb0bced...5538fdd1</p>
            </div>
            <Button variant="green" size="1">
              Active
            </Button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 mt-4">
            <div>
              <p className="font-semibold text-sm">Amount</p>
              <p className="text-sm">1.25 BTC</p>
            </div>
            <div className="lg:col-span-1">
              <p className="font-semibold text-sm">Withdrawal Balance</p>
              <p className="text-sm">1.25 BTC</p>
              <p className="text-xs text-yellow-500">↘ 0.25 BTC PENDING</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 mt-4">
            <div>
              <p className="font-semibold text-sm">Opened On</p>
              <p className="text-sm">2023-04-05 12:00</p>
              <p className="text-xs text-gray-500">2 days ago</p>
            </div>
            <Button variant="outline" className="self-center">
              Unbond
            </Button>
          </div>
        </Card>

        <Card variant="classic" className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">Babylon Foundation</p>
              <p className="text-xs text-gray-500">bb0bced...5538fdd1</p>
            </div>
            <Button variant="red" size="small">
              Closed
            </Button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 mt-4">
            <div>
              <p className="font-semibold text-sm">Amount</p>
              <p className="text-sm">1.25 BTC</p>
            </div>
            <div className="lg:col-span-1">
              <p className="font-semibold text-sm">Withdrawal Balance</p>
              <p className="text-sm">1.25 BTC</p>
              <p className="text-xs text-yellow-500">↘ 0.25 BTC PENDING</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 mt-4">
            <div>
              <p className="font-semibold text-sm">Opened On</p>
              <p className="text-sm">2024-08-30 12:00:00</p>
              <p className="text-xs text-gray-500">2 days ago</p>
            </div>
            <Button variant="outline" className="self-center">
              Unbond
            </Button>
          </div>
        </Card>
      </div>

      {/* Footer Stake Button for Mobile */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 bg-white p-4 shadow-lg">
        <Button
          className={`w-full bg-[#A1FD59] text-black rounded-none ${
            !isConnected ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={!isConnected}
        >
          STAKE
        </Button>
      </div>
    </div>
  );
};

export default StakedAssetDetails;
