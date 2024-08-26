"use client";

import { useStake } from "@/app/context/StakeContext";
import { useWallet } from "@/app/context/WalletContext";

const StakeBTCDetailPage = ({ params }: { params: { btcPk: string } }) => {
  const { btcPk } = params;
  const { selectedDelegation } = useStake();
  const { address } = useWallet();

  return (
    <div>
      <h1>Stake BTC Detail</h1>
      <p>Public Key: {btcPk}</p>
      <p>Wallet Address: {address}</p>
      <p>Name: {selectedDelegation?.name}</p>
      <p>Total Delegation: {selectedDelegation?.totalDelegation}</p>
      <p>Commission: {selectedDelegation?.commission}%</p>
    </div>
  );
};

export default StakeBTCDetailPage;
