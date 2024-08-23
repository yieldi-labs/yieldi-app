"use client";

import { useStake } from "@/context/StakeContext";

const StakeBTCDetailPage = ({ params }: { params: { btcPk: string } }) => {
  const { btcPk } = params;
  const { selectedDelegation } = useStake();

  return (
    <div>
      <h1>Stake BTC Detail</h1>
      <p>Public Key: {btcPk}</p>
      <p>Name: {selectedDelegation?.name}</p>
      <p>Total Delegation: {selectedDelegation?.totalDelegation}</p>
      <p>Commission: {selectedDelegation?.commission}%</p>
    </div>
  );
};

export default StakeBTCDetailPage;
