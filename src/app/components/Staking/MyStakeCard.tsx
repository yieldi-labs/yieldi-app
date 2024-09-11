import { satoshiToBtc } from "@/utils/btcConversions";

const MyStakeCard: React.FC<{
  btcWalletBalanceSat: number;
  delegations: any;
  asset: any;
}> = ({ btcWalletBalanceSat, delegations, asset }) => {
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
    <div className="w-full mb-6 bg-white">
      <div className="border border-yieldi-gray-200 mb-4">
        <div className="border p-4">
          <h3 className="text-xl font-semibold font-gt-america">MY STAKE</h3>
        </div>
        <div className="grid grid-cols-2">
          <div className="border border-yieldi-gray-200 p-4 flex-row">
            <p className="text-yieldi-brown text-xs font-light leading-normal">
              WALLET BALANCE
            </p>
            <p className="text-yieldi-brown text-xl font-medium leading-normal">
              {balance} {asset?.assetSymbol}
            </p>
            <p className="text-yieldi-brown text-xs font-medium leading-normal">
              {"$"} {balance * asset?.price} {"USD"}
            </p>
          </div>
          <div className="border border-yieldi-gray-200 p-4 flex-row">
            <p className="text-yieldi-brown text-xs font-light leading-normal">
              STAKED BALANCE
            </p>
            <p className="text-yieldi-brown text-xl font-medium leading-normal">
              {totalStakedSat} {asset?.assetSymbol}
            </p>
            <p className="text-yieldi-brown text-xs font-medium leading-normal">
              {"$"} {totalStakedSat * asset?.price} {"USD"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyStakeCard;
