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
    <div className="w-full mb-6 bg-white">
      <div className="border border-yieldi-gray-200">
        <div className="flex flex-wrap justify-between">
          {/* Asset symbol and name section */}
          <div className="p-4 flex items-center space-x-4">
            <div className="size-12 justify-center mr-4">
              <Image
                src={`/${asset?.assetSymbol.toLowerCase()}.svg`}
                alt={`${asset?.assetSymbol} Logo`}
                width={65}
                height={65}
              />
            </div>
            <div className="flex items-center space-x-2">
              <h2 className="text-yieldi-brown text-4xl font-medium leading-normal">
                {asset?.assetSymbol.toUpperCase()}
              </h2>
              <p className="text-yieldi-brown text-xl font-light leading-normal">
                {asset?.assetName}
              </p>
            </div>
          </div>

          {/* Stake button section */}
          <div className="p-4 flex items-center w-full md:w-auto">
            <button
              className={`w-full cursor-pointer px-20 py-2 gap-2 rounded bg-yieldi-green text-yieldi-black text-base font-medium ${
                !isConnected ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={!isConnected}
              onClick={onStakeClick}
            >
              STAKE
            </button>
          </div>
        </div>
        <div className="flex flex-wrap border-t border-yieldi-gray-200">
          {/* TVL Section */}
          <div className="p-4 flex-1 border-r border-yieldi-gray-200">
            <p className="text-yieldi-brown text-xs font-light leading-normal">
              TVL
            </p>
            <p className="text-yieldi-brown text-xl font-medium leading-normal">
              {confirmedTvl} {asset?.assetSymbol}
            </p>
          </div>

          {/* CAP Section */}
          <div className="p-4 flex-1 border-r border-yieldi-gray-200">
            <p className="text-yieldi-brown text-xs font-light leading-normal">
              CAP
            </p>
            <p className="text-yieldi-brown text-xl font-medium leading-normal">
              {stakingCap} {asset?.assetSymbol}
            </p>
          </div>

          {/* Staking Window Section */}
          <div className="p-4 flex-1 border-r border-yieldi-gray-200">
            <p className="text-yieldi-brown text-xs font-light leading-normal">
              STAKING WINDOW
            </p>
            <p className="text-yieldi-brown text-xl font-medium leading-normal">
              {remainingBlocks > 0 ? `${remainingBlocks} blocks` : "0 blocks"}
            </p>
          </div>

          {/* Price Section */}
          <div className="p-4 flex-1">
            <p className="text-yieldi-brown text-xs font-light leading-normal">
              PRICE
            </p>
            <p className="text-yieldi-brown text-xl font-medium leading-normal">
              $60,000
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetDetailsSection;
