"use client";

import { Table } from "@radix-ui/themes";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

import { useAssets } from "@/app/context/AssetContext";
import { useWallet } from "@/app/context/WalletContext";
import { satoshiToBtc } from "@/utils/btcConversions";

import { StakeAsset } from "../types/stakeAsset";

import { MobileAssetInfo } from "./mobileAssetInfo";

const StakePage: React.FC = () => {
  const router = useRouter();
  const assets = useAssets().assets;
  const handleOnClick = (assetSymbol: string) => () => {
    router.push(`/stake/${assetSymbol.toLocaleLowerCase()}/details`);
  };

  const { btcWalletBalanceSat, isConnected } = useWallet();

  const filteredAssets = assets.filter((asset) =>
    process.env.NEXT_PUBLIC_ASSETS?.includes(asset.assetSymbol),
  );

  return (
    <div className="lg:w-3/4 mx-auto px-4 md:px-16 lg:px-0">
      <div className="flex items-baseline mb-4">
        <h1 className="text-yieldi-brown text-2xl font-bold mr-4 font-gt-america-ext">
          STAKE
        </h1>
        <p className="text-yieldi-brown/80 text-lg font-light border-l border-yieldi-brown ps-3 hidden md:block">
          Select to view details
        </p>
      </div>

      <div className="pb-12 hidden md:block">
        <Table.Root className="hidden md:block">
          <Table.Header className="[--table-row-box-shadow:none]">
            <Table.Row>
              <Table.ColumnHeaderCell className="px-6 py-3 uppercase tracking-wider flex self-stretch text-yieldi-brown-light text-xs font-light">
                ASSET
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="px-6 py-3 uppercase tracking-wider text-yieldi-brown-light text-xs font-light">
                TVL
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="px-6 py-3 uppercase tracking-wider text-yieldi-brown-light text-xs font-light">
                WALLET BALANCE
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="px-6 py-3 uppercase tracking-wider text-yieldi-brown-light text-xs font-light">
                STAKED BALANCE
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="px-6 py-3 uppercase tracking-wider text-yieldi-brown-light text-xs font-light">
                WITHDRAWAL BALANCE
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="px-6 py-3 uppercase tracking-wider text-yieldi-brown-light text-xs font-light">
                ACTIONS
              </Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body className="space-y-1.5">
            {filteredAssets?.map((asset: StakeAsset, index: number) => (
              <>
                <Table.Row
                  key={asset.assetName}
                  className="mb-[5px] gap-2.5 w-full border border-yieldi-gray-200 bg-white hover:bg-gray-50 [--table-row-box-shadow:none]"
                  onClick={handleOnClick(asset.assetSymbol)}
                  data-tooltip-id={`tooltip-${asset.assetName}`}
                  data-tooltip-content={`View ${asset.assetName} details`}
                  data-tooltip-place="top"
                >
                  <Table.Cell className="p-4 whitespace-nowrap">
                    <div className="flex items-center ">
                      <Image
                        src={`/${asset.assetSymbol.toLocaleLowerCase()}.svg`}
                        alt={`${asset.assetName} Logo`}
                        width={50}
                        height={50}
                        className="rounded-full pr-2"
                      />
                      <span className="flex-col items-center">
                        <span className="text-yieldi-brown font-gt-america text-xl font-normal">
                          {asset.assetSymbol}
                        </span>
                        <br />
                        <span className="text-yieldi-brown-light font-gt-america text-sm font-normal">
                          {asset.assetName}
                        </span>
                      </span>
                    </div>
                  </Table.Cell>
                  <Table.Cell className="px-6 py-4 items-center h-full ">
                    <div className="text-yieldi-brown text-xl font-normal ">
                      $0.00
                    </div>
                    <div className="text-yieldi-brown-light text-sm font-normal">
                      {isConnected
                        ? (
                            satoshiToBtc(btcWalletBalanceSat) * asset.price
                          ).toString()
                        : "-"}
                    </div>
                  </Table.Cell>
                  <Table.Cell className="px-6 py-4 ">
                    <div className="text-yieldi-brown text-xl font-normal flex items-center h-full  ">
                      {isConnected
                        ? (
                            satoshiToBtc(btcWalletBalanceSat) * asset.price
                          ).toString()
                        : "-"}{" "}
                    </div>
                  </Table.Cell>
                  <Table.Cell className="px-6 py-4">
                    <div className="text-yieldi-brown text-xl font-normal flex items-center h-full">
                      {asset.totalBalance} {asset.assetSymbol}
                    </div>
                  </Table.Cell>
                  <Table.Cell className="px-6 py-4 ">
                    <div className="text-yieldi-brown text-xl font-normal  ">
                      {asset.totalBalance} {asset.assetSymbol}
                      <div className="flex text-yieldi-brown-light text-sm font-normal items-center h-full">
                        <Image
                          src="/arrowTurnedDown.svg"
                          alt="Stake asset"
                          width={16}
                          height={16}
                          className="pr-1"
                        />
                        <p className="text-xs pr-1">0.0 {asset.assetSymbol}</p>
                        <p className="flex justify-center items-center px-3 gap-2.5 text-xxs rounded-full bg-yieldi-yellow text-yieldi-brown-light">
                          PENDING
                        </p>
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell className="px-6 py-4 whitespace-nowrap ">
                    <button className="bg-yieldi-green text-black items-center rounded mr-5 ">
                      <Image
                        src="/download.svg"
                        alt="Stake asset"
                        width={28}
                        height={28}
                      />
                    </button>
                    <button className="bg-yieldi-brown-light text-white items-center rounded">
                      <Image
                        src="/upload.svg"
                        alt="Unstake asset"
                        width={28}
                        height={28}
                      />
                    </button>
                  </Table.Cell>
                </Table.Row>
                <Table.Row
                  key={index}
                  className="w-full h-[6px] border-none shadow-none"
                ></Table.Row>
              </>
            ))}
          </Table.Body>
        </Table.Root>
      </div>

      {/** Mobile Asset Info */}
      <div className="md:hidden">
        {filteredAssets?.map((asset: StakeAsset) => (
          <span
            key={asset.assetName + asset.assetSymbol}
            onClick={handleOnClick(asset.assetSymbol)}
          >
            <MobileAssetInfo asset={asset} />
          </span>
        ))}
      </div>
    </div>
  );
};

export default StakePage;
