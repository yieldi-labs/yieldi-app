import { Card } from "@radix-ui/themes";

const MetricsGrid: React.FC<{
  confirmedTvl: string;
  stakingCap: number;
  remainingBlocks: number;
}> = ({ confirmedTvl, stakingCap, remainingBlocks }) => {
  return (
    <div className="p-2 mt-6">
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 text-left">
        <Card variant="ghost" className="border rounded-none">
          <p className="">TVL</p>
          <p className="text-lg font-semibold">{confirmedTvl} BTC</p>
        </Card>
        <Card variant="ghost" className="border rounded-none">
          <p>Cap</p>
          <p className="text-lg font-semibold">{stakingCap} BTC</p>
        </Card>
        <Card variant="ghost" className="border rounded-none">
          <p>Staking Window</p>
          <p className="text-lg font-semibold">{remainingBlocks} blocks</p>
        </Card>
        <Card variant="ghost" className="border rounded-none">
          <p>Price</p>
          <p className="text-lg font-semibold">$60,000</p>
        </Card>
      </div>
    </div>
  );
};

export default MetricsGrid;
