"use client";

import { Table, Button, Card } from "@radix-ui/themes";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import React from "react";

import { assets } from "@/app/config/StakedAssets";
import { useWallet } from "@/app/context/WalletContext";

const StakedAssetDetails: React.FC = () => {
  const { assetSymbol } = useParams(); // Access dynamic route parameter
  const { address, btcWallet, isConnected } = useWallet();
  const router = useRouter(); // To handle the back navigation

  const asset = assets.find((a) =>
    Array.isArray(assetSymbol)
      ? a.assetSymbol.toLowerCase() === assetSymbol[0]?.toLowerCase()
      : a.assetSymbol.toLowerCase() === assetSymbol?.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 pb-16">
      {/* Back Button */}
      <Button onClick={() => router.push("/assets")} variant="ghost">
        &larr; Assets
      </Button>

      <Card variant="classic" className="p-6 mb-4 border-none">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Image
              src="/btc.svg"
              alt="Bitcoin Logo"
              width={0}
              height={0}
              className="size-12"
            />
            <div className="ml-4">
              <h2 className="text-2xl font-bold">
                {asset?.assetSymbol.toUpperCase()}
              </h2>
              <p className="text-gray-500">{asset?.assetName}</p>
            </div>
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

        {/* Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-center">
          <Card variant="ghost" className="border-none">
            <p className="font-semibold">TVL</p>
            <p className="text-lg">1.25K BTC</p>
          </Card>
          <Card variant="ghost" className="border-none">
            <p className="font-semibold">Cap</p>
            <p className="text-lg">1.25K BTC</p>
          </Card>
          <Card variant="ghost" className="border-none">
            <p className="font-semibold">Staking Window</p>
            <p className="text-lg">239 blocks</p>
          </Card>
          <Card variant="ghost" className="border-none">
            <p className="font-semibold">Price</p>
            <p className="text-lg">$60,000</p>
          </Card>
        </div>
      </Card>

      {/* My Stake */}
      <Card variant="classic" className="p-6 mb-4 border-none">
        <h3 className="text-xl font-semibold mb-4">My Stake</h3>
        <div className="grid grid-cols-2 gap-6">
          <Card variant="ghost" className="text-center border-none">
            <p className="text-lg font-bold">2.045K BTC</p>
            <p className="text-gray-500">Wallet Balance</p>
          </Card>
          <Card variant="ghost" className="text-center border-none">
            <p className="text-lg font-bold">1.25K BTC</p>
            <p className="text-gray-500">Staked Balance</p>
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
            <Button variant="green" size="small">
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
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg">
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
