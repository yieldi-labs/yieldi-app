import { Card } from "@radix-ui/themes";

import { satoshiToBtc } from "@/utils/btcConversions";

const MyStakeCard: React.FC<{
  btcWalletBalanceSat: number;
  delegations: any;
  asset: any;
}> = ({ btcWalletBalanceSat, delegations }) => {
  const balance = satoshiToBtc(btcWalletBalanceSat);
  let totalStakedSat = 0;

  if (delegations) {
    totalStakedSat = delegations.delegations
      .filter((delegation: any) => delegation?.state === "ACTIVE")
      .reduce(
        (accumulator: number, item: any) => accumulator + item?.stakingValueSat,
        0,
      );
  }

  return (
    <Card className="p-6 mb-4 rounded-none">
      <h3 className="text-xl font-semibold mb-4">My Stake</h3>
      <div className="grid grid-cols-2 gap-6">
        <Card variant="ghost" className="border rounded-none">
          <p className="text-gray-500">Wallet Balance</p>
          <p className="flex text-lg font-bold">{balance} BTC</p>
        </Card>
        <Card variant="ghost" className="border rounded-none">
          <p className="text-gray-500">Staked Balance</p>
          <p className="flex text-lg font-bold">{totalStakedSat} BTC</p>
        </Card>
      </div>
    </Card>
  );
};

export default MyStakeCard;
