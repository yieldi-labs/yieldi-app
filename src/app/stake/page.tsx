"use client";

import { Table } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import React from "react";

import { RestakeAsset } from "@/app/types/restakeAsset";

const assets: RestakeAsset[] = [
  {
    assetName: "Bitcoin",
    assetSymbol: "BTC",
    amount: 0.0001,
    price: 10000,
    totalBalance: 0.0001,
    remainingBalance: 0.0001,
  },
  {
    assetName: "Ethereum",
    assetSymbol: "ETH",
    amount: 0.0001,
    price: 10000,
    totalBalance: 0.0001,
    remainingBalance: 0.0001,
  },
];

const RestakePage: React.FC = () => {
  const router = useRouter();
  const handleOnClick = (assetSymbol: string) => () => {
    router.push(`/stake/${assetSymbol.toLocaleLowerCase()}`);
  };
  return (
    <div className="p-10">
      <div className="flex">
        <h1>RESTAKE Page | </h1> <span> Choose an asset to stake</span>
      </div>
      <Table.Root className="">
        <Table.Header className="">
          <Table.Row>
            <Table.ColumnHeaderCell className=" align-middle text-black">
              Asset
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className=" align-middle hidden lg:table-cell text-black">
              TVL
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className="  align-middle text-black">
              Balance
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className="  text-black">
              ACTIONS
            </Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {assets.map((asset) => (
            <Table.Row
              key={asset.assetSymbol}
              className=""
              onClick={handleOnClick(asset.assetSymbol)}
            >
              <Table.Cell className="p-6 bg-[#D9D9D9]">
                {asset.assetSymbol}
                <br />
                {asset.assetName}
              </Table.Cell>
              <Table.Cell className="p-6 hidden lg:table-cell bg-[#D9D9D9]">
                {asset.totalBalance}
              </Table.Cell>
              <Table.Cell className="p-6 bg-[#D9D9D9]">
                {asset.remainingBalance}
              </Table.Cell>
              <Table.Cell className="p-6 bg-[#D9D9D9]">
                <button className="bg-[#A1FD59] text-black p-4 ">STAKE </button>
                <button className="bg-[#A1FD59] text-black p-4 ml-2">
                  WITHDRAW
                </button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </div>
  );
};

export default RestakePage;
