import { useQuery } from "@tanstack/react-query";

import { getGlobalParams } from "@/app/api/getGlobalParams";
import { useAssets } from "@/app/context/AssetContext";
import { useWallet } from "@/app/context/WalletContext";
import { useBtcHeight } from "@/app/context/mempool/BtcHeightProvider";
import { satoshiToBtc } from "@/utils/btcConversions";
import { getCurrentGlobalParamsVersion } from "@/utils/globalParams";
import { maxDecimals } from "@/utils/maxDecimals";
import { Formatter } from "@/utils/numberFormatter";

const MetricsGrid: React.FC<{
  confirmedTvl: string;
  assetSymbol: string;
}> = ({ confirmedTvl, assetSymbol }) => {
  // Fetch global params and stats
  const { btcWallet } = useWallet();
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

  const btcHeight = useBtcHeight() ?? 0;
  const remainingBlocks = activationHeight
    ? activationHeight - btcHeight - 1
    : 0;

  const stakingCap = maxDecimals(
    satoshiToBtc(
      paramWithContext?.nextBlockParams?.currentVersion?.maxStakingAmountSat ||
        0,
    ),
    8,
  );
  const asset = useAssets().assets.find(
    (asset) => asset.assetSymbol === assetSymbol,
  );
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 md:divide-x-2 divide-yieldi-gray-200">
      <div className="p-4 flex flex-col justify-end items-start self-stretch border-r-2 border-b-2 md:border-b-0 md:border-r-0 border-yieldi-gray-200">
        <p className="text-yieldi-brown text-xs font-light leading-normal">
          TVL
        </p>
        <p className="text-yieldi-brown text-xl font-medium leading-normal">
          {confirmedTvl} {assetSymbol}
        </p>
      </div>
      <div className="p-4 flex flex-col justify-end items-start self-stretch md:border-r-2 md:border-b-0 border-b-2 border-yieldi-gray-200">
        <p className="text-yieldi-brown text-xs font-light leading-normal">
          CAP
        </p>
        <p className="text-yieldi-brown text-xl font-medium leading-normal">
          {stakingCap} {assetSymbol}
        </p>
      </div>
      <div className="p-4 flex flex-col justify-end items-start self-stretch border-r-2 border-yieldi-gray-200">
        <p className="text-yieldi-brown text-xs font-light leading-normal">
          STAKING WINDOW
        </p>
        <p className="text-yieldi-brown text-xl font-medium leading-normal">
          {remainingBlocks} blocks
        </p>
      </div>
      <div className="p-4 flex flex-col justify-end items-start self-stretch md:border-r-2 border-yieldi-gray-200">
        <p className="text-yieldi-brown text-xs font-light leading-normal">
          PRICE
        </p>
        <p className="text-yieldi-brown text-xl font-medium leading-normal">
          $ {Formatter.format(asset?.price || 0)} USD
        </p>
      </div>
    </div>
  );
};

export default MetricsGrid;
