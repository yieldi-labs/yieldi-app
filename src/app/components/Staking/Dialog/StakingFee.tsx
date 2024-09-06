import React, { useEffect } from "react";

import { getNetworkConfig } from "@/config/network.config";
import { satoshiToBtc } from "@/utils/btcConversions";
import { getFeeRateFromMempool } from "@/utils/getFeeRateFromMempool";
import { Fees } from "@/utils/wallet/wallet_provider";

import { LoadingSmall } from "../../Loading/Loading";

interface StakingFeeProps {
  stakingFeeSat: number;
  selectedFeeRate: number;
  onSelectedFeeRateChange: (fee: number) => void;
  reset: number;
  mempoolFeeRates?: Fees;
}

export const StakingFee: React.FC<StakingFeeProps> = ({
  stakingFeeSat,
  onSelectedFeeRateChange,
  reset,
  mempoolFeeRates,
}) => {
  useEffect(() => {
    if (reset) {
      onSelectedFeeRateChange(0);
    }
  }, [onSelectedFeeRateChange, reset]);

  const { coinName } = getNetworkConfig();

  const { defaultFeeRate } = getFeeRateFromMempool(mempoolFeeRates);

  return (
    <div className="my-2 text-sm">
      <div className="grid grid-cols-2 mb-2 mx-2 border border-[#DCD4C9] bg-white">
        <div className="p-3 border-r border-[#DCD4C9]">
          <div className="text-sm mb-1 font-light">FEE RATE</div>
          <div>
            {mempoolFeeRates ? (
              <p>{defaultFeeRate} sats/vB</p>
            ) : (
              <LoadingSmall text="Loading..." />
            )}
          </div>
        </div>
        <div className="p-3">
          <div className="text-sm mb-1 font-light">TX FEE</div>
          <p>
            {satoshiToBtc(stakingFeeSat)} {coinName}
          </p>
        </div>
      </div>
    </div>
  );
};
