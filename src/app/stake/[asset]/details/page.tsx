"use client";

import { Button } from "@radix-ui/themes";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

import { getGlobalParams } from "@/app/api/getGlobalParams";
import { getStats } from "@/app/api/getStats";
import BackButton from "@/app/components/BackButton";
import AssetDetailsSection from "@/app/components/Staking/AssetDetailsSection";
import MyStakeCard from "@/app/components/Staking/MyStakeCard";
import Transactions from "@/app/components/Transactions/Transactions";
import { assets } from "@/app/config/StakedAssets";
import { useFinalityProviders } from "@/app/context/FinalityProvidersContext";
import { useWallet } from "@/app/context/WalletContext";
import { useGetDelegations } from "@/app/hooks/useGetDelegations";
import { satoshiToBtc } from "@/utils/btcConversions";
import { getCurrentGlobalParamsVersion } from "@/utils/globalParams";
import { maxDecimals } from "@/utils/maxDecimals";

const StakedAssetDetails: React.FC = () => {
  const pathname = usePathname();
  const pathParts = pathname.split("/");
  const assetSymbol = pathParts.length > 2 ? pathParts[2] : null;
  const router = useRouter();
  const [btcHeight, setBtcHeight] = useState<number | undefined>(undefined);
  const [remainingBlocks, setRemainingBlocks] = useState<number>(0);
  // This state variable will force a re-render when its value changes
  const [refreshKey, setRefreshKey] = useState(0);

  const {
    address,
    btcWallet,
    publicKeyNoCoord,
    isConnected,
    btcWalletBalanceSat,
  } = useWallet();
  const asset = assets.find(
    (asset) => asset.assetSymbol.toLowerCase() === assetSymbol,
  );

  // Fetch global params and stats
  const { data: paramWithContext } = useQuery({
    queryKey: ["global params"],
    queryFn: async () => {
      const [height, versions] = await Promise.all([
        btcWallet!.getBTCTipHeight(),
        getGlobalParams(),
      ]);
      return {
        currentHeight: height,
        nextBlockParams: getCurrentGlobalParamsVersion(height + 1, versions),
        versions,
      };
    },
    refetchInterval: 60000,
    enabled: !!btcWallet,
  });

  const activationHeight =
    paramWithContext?.nextBlockParams?.currentVersion?.activationHeight;

  // Update remainingBlocks based on activationHeight and current Bitcoin height
  useEffect(() => {
    if (btcWallet && activationHeight && btcHeight !== undefined) {
      Promise.all([btcWallet.getBTCTipHeight(), btcWallet.getNetwork()]).then(
        ([height]) => {
          setBtcHeight(height);
          setRemainingBlocks(activationHeight - height);
        },
      );
    }
  }, [activationHeight, btcHeight, btcWallet, remainingBlocks]);

  const { delegations } = useGetDelegations(address, publicKeyNoCoord);
  const { data } = useQuery({
    queryKey: ["API_STATS"],
    queryFn: async () => getStats(),
    refetchInterval: 60000,
  });
  const confirmedTvl = data?.totalTVLSat
    ? `${maxDecimals(satoshiToBtc(data.activeTVLSat), 8)}`
    : "0";
  const stakingCap = maxDecimals(
    satoshiToBtc(
      paramWithContext?.nextBlockParams?.currentVersion?.maxStakingAmountSat ||
        0,
    ),
    8,
  );
  const { finalityProviders } = useFinalityProviders();
  const finalityProvidersKV: Record<string, string> = finalityProviders?.reduce(
    (acc, fp) => ({ ...acc, [fp?.btcPk]: fp?.description?.moniker }),
    {},
  );

  const handleOnClick = () => {
    router.push(`/stake/${assetSymbol}`);
  };

  // Function to trigger a refresh of the transactions table
  const refreshTransactions = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };

  return (
    <div className="lg:w-3/4 mx-auto px-4 md:px-16 lg:px-0">
      <div>
        <BackButton text=" ASSETS" />
      </div>
      <AssetDetailsSection
        asset={asset}
        isConnected={isConnected}
        confirmedTvl={confirmedTvl}
        stakingCap={stakingCap}
        remainingBlocks={remainingBlocks}
        onStakeClick={handleOnClick}
      />

      <MyStakeCard
        btcWalletBalanceSat={btcWalletBalanceSat}
        delegations={delegations}
        asset={asset}
      />

      {delegations?.delegations &&
      finalityProvidersKV &&
      btcWallet &&
      paramWithContext?.nextBlockParams?.currentVersion ? (
        <>
          <Transactions
            delegations={delegations}
            finalityProvidersKV={finalityProvidersKV}
            asset={asset}
            refreshKey={refreshKey}
            onRefresh={refreshTransactions}
          />
        </>
      ) : null}

      <div className="sm:hidden fixed bottom-0 inset-x-0 bg-white p-4 shadow-lg">
        <Button
          className={`w-full bg-yieldi-green text-black rounded-none ${
            !isConnected ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={!isConnected}
          onClick={handleOnClick}
        >
          STAKE
        </Button>
      </div>
    </div>
  );
};

export default StakedAssetDetails;