import { Card } from "@radix-ui/themes";
import Image from "next/image";
import React from "react";

import { StakeAsset } from "@/app/types/stakeAsset";
import { Formatter } from "@/utils/numberFormatter";
export const MobileAssetInfo: React.FC<MobileStakeAssetInfo> = ({
  asset,
  TVL,
  stakedBalance,
  walletBalance,
  withdrawalBalance,
  pendingBalance,
}) => {
  return (
    <div className="mb-4 bg-white border-2">
      <div className="grid grid-cols-7 border-yieldi-gray-200 border">
        <Card variant="ghost" className=" flex col-span-4 rounded-none p-6">
          <div className="size-12 flex items-center justify-center mr-4 h-full">
            <Image
              src={`/${asset?.assetSymbol.toLowerCase()}.svg`}
              alt={`${asset?.assetSymbol} Logo`}
              width={50}
              height={50}
            />
          </div>
          <div className="flex-col items-center ">
            <h2 className="text-yieldi-brown text-xl font-medium leading-normal shrink-0">
              {asset?.assetSymbol.toUpperCase()}
            </h2>
            <p className="text-yieldi-brown text-sm font-light leading-normal shrink-0">
              {asset?.assetName}
            </p>
          </div>
        </Card>
        <div className="rounded-none p-4 col-span-3">
          <p className="text-yieldi-brown text-lg uppercase">
            TVL ${Formatter.format((TVL as number) * asset.price)}
          </p>
          <p className="flex text-yieldi-brown-light text-sm font-light shrink-0">
            {TVL as number} {asset.assetSymbol}
          </p>
        </div>
      </div>
      <div>
        <div className="grid grid-cols-7 text-left border-yieldi-gray-200 border">
          <Card variant="ghost" className="col-span-4 rounded-none p-6 ">
            <div className="text-yieldi-brown text-xs font-light leading-normal">
              Staked Balance
            </div>
            <span className="text-yieldi-brown text-xl font-medium">
              {stakedBalance} {asset.assetSymbol}
            </span>
          </Card>
          <div className="rounded-none border-yieldi-gray-200 border-l-2 p-4 col-span-3">
            <p className="text-yieldi-brown text-xs font-light leading-normal">
              Wallet Balance
            </p>
            <p className="text-yieldi-brown text-xl font-medium">
              {walletBalance} {asset.assetSymbol}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-7 border-yieldi-gray-200 border">
          <Card variant="ghost" className="col-span-4 rounded-none p-6">
            <p className="text-yieldi-brown text-xs font-light leading-normal">
              Withdrawal Balance
            </p>
            <div className="text-yieldi-brown text-xl font-medium  ">
              {withdrawalBalance} {asset.assetSymbol}
              <div className="flex text-yieldi-brown-light text-sm font-normal items-center ">
                <Image
                  src="/arrowTurnedDown.svg"
                  alt="Stake asset"
                  width={16}
                  height={16}
                  className="pr-1"
                />
                <p className="text-xs pr-1 pt-1">
                  {pendingBalance} {asset.assetSymbol}
                </p>
                <p className="flex justify-center items-center px-3 gap-2.5 text-xxs rounded-full bg-yieldi-yellow text-yieldi-brown-light">
                  PENDING
                </p>
              </div>
            </div>
          </Card>
          <div className="rounded-none border-l-2 border-yieldi-gray-200 p-4 col-span-3">
            <p className="text-yieldi-brown text-xs font-light leading-normal">
              Actions
            </p>
            <div className="flex items-center self-stretch gap-3 h-full">
              <button className="bg-yieldi-green text-black items-center rounded pl-1 pr-[5px] py-[5px] ">
                <Image
                  src="/download.svg"
                  alt="Stake asset"
                  width={28}
                  height={28}
                />
              </button>
              <button className="bg-yieldi-brown-light text-white items-center rounded p-[5px]">
                <Image
                  src="/upload.svg"
                  alt="Unstake asset"
                  width={28}
                  height={28}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface MobileStakeAssetInfo {
  asset: StakeAsset;
  TVL: string | number;
  walletBalance: number;
  stakedBalance: number;
  withdrawalBalance: number;
  pendingBalance?: number;
}
