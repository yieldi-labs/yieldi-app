// @TODO: Remove this file and replace with API/env file to get the staked assets. This is currently mock data

import { StakeAsset } from "../types/stakeAsset";

export const assets: StakeAsset[] = [
  {
    assetName: "Native Bitcoin",
    assetSymbol: "BTC",
    assetPriceSymbol: "bitcoin",
    amount: 0.0001,
    price: 10000,
    totalBalance: 0.0001,
    remainingBalance: 0.0001,
  },
  {
    assetName: "Native ETH",
    assetSymbol: "ETH",
    assetPriceSymbol: "ethereum",
    amount: 0.0001,
    price: 10000,
    totalBalance: 0.0001,
    remainingBalance: 0.0001,
  },
  {
    assetName: "Staked Coinbase ETH",
    assetSymbol: "cbETH",
    assetPriceSymbol: "coinbase-wrapped-staked-eth",
    amount: 0.0001,
    price: 10000,
    totalBalance: 0.0001,
    remainingBalance: 0.0001,
  },
];
