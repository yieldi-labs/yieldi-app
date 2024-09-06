import { Card, Button } from "@radix-ui/themes";
import Image from "next/image";


const AssetDetailsSection: React.FC<{
  asset: any;
  isConnected: boolean;
  confirmedTvl: string;
  stakingCap: number;
  remainingBlocks: number;
  onStakeClick: () => void;
}> = ({
  asset,
  isConnected,
  confirmedTvl,
  stakingCap,
  remainingBlocks,
  onStakeClick,
}) => {
  return (
    <Card variant="classic" className="p-6 mb-4">
      {/* Asset Info */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-5">
          <Image
            src={`/${asset?.assetSymbol}.svg`}
            alt={`${asset?.assetSymbol} Logo`}
            width={0}
            height={0}
            className="size-12"
          />
          <div>
            <h2 className="text-3xl font-bold">
              {asset?.assetSymbol.toUpperCase()}
            </h2>
            <p>{asset?.assetName}</p>
          </div>
        </div>
        <Button
          className={`hidden sm:block cursor-pointer w-[173px] h-[55px] bg-[#A1FD59] text-black rounded-none ${
            !isConnected ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={!isConnected}
          onClick={onStakeClick}
        >
          STAKE
        </Button>
      </div>

      {/* Metrics Grid */}
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
            <p className="text-lg font-semibold">
              {stakingCap}
              {" BTC"}
            </p>
          </Card>
          <Card variant="ghost" className="border rounded-none">
            <p>Staking Window</p>
            <p className="text-lg font-semibold">
              {remainingBlocks > 0 ? `${remainingBlocks} blocks` : "0 blocks"}
            </p>
          </Card>
          <Card variant="ghost" className="border rounded-none">
            <p>Price</p>
            <p className="text-lg font-semibold">$60,000</p>
          </Card>
        </div>
      </div>
    </Card>
  );
};

export default AssetDetailsSection;
