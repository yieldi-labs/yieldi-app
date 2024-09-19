import Image from "next/image";

import MetricsGrid from "./Metrics";

const AssetDetailsSection: React.FC<{
  asset: any;
  isConnected: boolean;
  confirmedTvl: string;
  onStakeClick: () => void;
}> = ({ asset, isConnected, confirmedTvl, onStakeClick }) => {
  return (
    <div className="w-full mb-6 bg-white">
      <div className="border-2 border-yieldi-gray-200">
        <div className="flex justify-between p-4 border-b-2 border-yieldi-gray-200">
          <div className="flex items-center">
            <div className="size-12 flex items-center justify-center mr-4">
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
              className={` hidden md:block w-full cursor-pointer px-20 py-2 gap-2 rounded bg-yieldi-green text-yieldi-black text-base font-medium ${
                !isConnected ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={!isConnected}
              onClick={onStakeClick}
            >
              STAKE
            </button>
          </div>
        </div>
        <MetricsGrid
          confirmedTvl={confirmedTvl}
          assetSymbol={asset?.assetSymbol}
        />
      </div>
    </div>
  );
};

export default AssetDetailsSection;
