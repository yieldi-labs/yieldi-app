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
        <div className="flex justify-between p-4 border-b border-yieldi-gray-200">
          <div className="flex items-center">
            <div className="size-12 flex items-center justify-center mr-4">
              <Image
                src={`/${asset?.assetSymbol.toLowerCase()}.svg`}
                alt={`${asset?.assetSymbol} Logo`}
                width={65}
                height={65}
              />
            </div>
            <div className="flex items-center">
              <h2 className="text-yieldi-brown text-4xl font-medium leading-normal mr-4">
                {asset?.assetSymbol.toUpperCase()}
              </h2>
              <p className="text-yieldi-brown text-xl font-light leading-normal">
                {asset?.assetName}
              </p>
            </div>
          </div>
          <button
            className={`hidden sm:block cursor-pointer px-24 py-2 m-8 
            gap-2 shrink-0 rounded bg-yieldi-green text-yieldi-black text-base font-medium ${
              !isConnected ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={!isConnected}
            onClick={onStakeClick}
          >
            STAKE
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 md:divide-x divide-yieldi-gray-200">
          <div className="p-4 flex flex-col justify-end items-start self-stretch border-r border-b md:border-b-0 md:border-r-0 border-yieldi-gray-200">
            <p className="text-yieldi-brown text-xs font-light leading-normal">
              TVL
            </p>
            <p className="text-yieldi-brown text-xl font-medium leading-normal">
              {confirmedTvl} {asset?.assetSymbol}
            </p>
          </div>
          <div className="p-4 flex flex-col justify-end items-start self-stretch md:border-r md:border-b-0 border-b border-yieldi-gray-200">
            <p className="text-yieldi-brown text-xs font-light leading-normal">
              CAP
            </p>
            <p className="text-yieldi-brown text-xl font-medium leading-normal">
              {stakingCap} {asset?.assetSymbol}
            </p>
          </div>
          <div className="p-4 flex flex-col justify-end items-start self-stretch border-r border-yieldi-gray-200">
            <p className="text-yieldi-brown text-xs font-light leading-normal">
              STAKING WINDOW
            </p>
            <p className="text-yieldi-brown text-xl font-medium leading-normal">
              {remainingBlocks > 0 ? `${remainingBlocks} blocks` : "0 blocks"}
            </p>
          </div>
          <div className="p-4 flex flex-col justify-end items-start self-stretch md:border-r border-yieldi-gray-200">
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
