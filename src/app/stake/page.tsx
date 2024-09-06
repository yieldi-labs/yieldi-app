"use client";

import { Table } from "@radix-ui/themes";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

import { assets } from "@/app/config/StakedAssets";

const StakePage: React.FC = () => {
  const router = useRouter();
  const handleOnClick = (assetSymbol: string) => () => {
    router.push(`/stake/${assetSymbol.toLocaleLowerCase()}/details`);
  };

  return (
    <div className="flex pl-[64px] pr-[56px] h-full px-6 py-0 flex-col items-start gap-4 shrink-0 self-stretch">
      <div className="flex w-full items-center gap-4">
        <h2 className="text-m font-semibold">STAKE</h2>
        <span className="text-sm">Choose an asset to stake</span>
      </div>

      <div className="flex flex-col gap-2 w-full overflow-x-auto">
        <Table.Root className="min-w-full">
          <Table.Header>
            <Table.Row className="flex items-center justify-between bg-gray-100 border-b">
              <Table.ColumnHeaderCell className="flex w-1/4 p-2">
                Asset
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="w-1/5 p-2 hidden md:block">
                TVL
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="flex w-1/5 p-2">
                Wallet Balance
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="w-1/5 p-2 hidden md:block">
                Staked Balance
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="w-1/4 p-2 hidden lg:block">
                Withdrawal Balance
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="flex w-1/4 p-2">
                ACTIONS
              </Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {assets.map((asset) => (
              <Table.Row
                key={asset.assetSymbol}
                className="flex items-center justify-between bg-white border-b hover:bg-gray-50 cursor-pointer"
                onClick={handleOnClick(asset.assetSymbol)}
              >
                <Table.Cell className="w-1/4 p-2">
                  <div className="flex ">
                    <Image
                      src={`/${asset.assetSymbol.toLocaleLowerCase()}.svg`}
                      alt={`${asset.assetName} Logo`}
                      width={0}
                      height={0}
                      className="size-[35px] rounded-full"
                    />
                    <span className="flex-col">
                      <strong>{asset.assetSymbol}</strong>
                      <br />
                      <span className="text-xs">{asset.assetName}</span>
                    </span>
                  </div>
                </Table.Cell>
                <Table.Cell className="w-1/5 p-2 hidden md:block">
                  {asset.totalBalance}
                </Table.Cell>
                <Table.Cell className="flex w-1/5 p-2">
                  {asset.remainingBalance}
                </Table.Cell>
                <Table.Cell className="w-1/5 p-2 hidden md:block">
                  {asset.remainingBalance}
                </Table.Cell>
                <Table.Cell className="w-1/5 p-2 hidden lg:block">
                  {asset.remainingBalance}
                </Table.Cell>
                <Table.Cell className="flex w-1/4 p-2 flex gap-2">
                  <button className="bg-[#A1FD59] text-black  ">
                    <Image
                      src="/download.svg"
                      alt="Stake asset"
                      width={29}
                      height={32}
                    />
                  </button>
                  <button className="bg-[#6D655D] text-white  ">
                    <Image
                      src="/upload.svg"
                      alt="Unstake asset"
                      width={29}
                      height={28}
                    />
                  </button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </div>
    </div>
  );
};

export default StakePage;
