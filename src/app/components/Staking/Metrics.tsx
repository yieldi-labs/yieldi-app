const MetricsGrid: React.FC<{
  confirmedTvl: string;
  stakingCap: number;
  remainingBlocks: number;
  assetSymbol: string;
}> = ({ confirmedTvl, stakingCap, remainingBlocks, assetSymbol }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 md:divide-x-2 divide-yieldi-gray-200">
      <div className="p-4 flex flex-col justify-end items-start self-stretch md:border-b-0 md:border-r-0 border-yieldi-gray-200">
        <p className="text-yieldi-brown text-xs font-light leading-normal">
          TVL
        </p>
        <p className="text-yieldi-brown text-xl font-medium leading-normal">
          {confirmedTvl} {assetSymbol}
        </p>
      </div>
      <div className="p-4 flex flex-col justify-end items-start self-stretch md:border-r md:border-b-0 border-yieldi-gray-200">
        <p className="text-yieldi-brown text-xs font-light leading-normal">
          CAP
        </p>
        <p className="text-yieldi-brown text-xl font-medium leading-normal">
          {stakingCap} {assetSymbol}
        </p>
      </div>
      <div className="p-4 flex flex-col justify-end items-start self-stretch border-yieldi-gray-200">
        <p className="text-yieldi-brown text-xs font-light leading-normal">
          STAKING WINDOW
        </p>
        <p className="text-yieldi-brown text-xl font-medium leading-normal">
          {remainingBlocks} blocks
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
  );
};

export default MetricsGrid;
