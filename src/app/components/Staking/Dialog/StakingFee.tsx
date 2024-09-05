import React, { useEffect, useState } from "react";

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
  selectedFeeRate,
  onSelectedFeeRateChange,
  reset,
  mempoolFeeRates,
}) => {
  const [customMode, setCustomMode] = useState(false);

  useEffect(() => {
    setCustomMode(false);
    if (reset) {
      onSelectedFeeRateChange(0);
    }
  }, [onSelectedFeeRateChange, reset]);

  const { coinName } = getNetworkConfig();

  const { minFeeRate, defaultFeeRate, maxFeeRate } =
    getFeeRateFromMempool(mempoolFeeRates);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);

    if (mempoolFeeRates && value >= 0) {
      if (value >= minFeeRate && value <= maxFeeRate) {
        onSelectedFeeRateChange(parseInt(e.target.value));
      }
    }
  };

  const defaultModeRender = () => {
    return (
      <div className="grid grid-cols-2 mb-4 bg-gray-50 border border-gray-200">
        <div className="p-3 border-r border-gray-200">
          <div className="text-sm text-gray-500 mb-1">FEE RATE</div>
          <div>
            {mempoolFeeRates ? (
              <strong>{defaultFeeRate} sats/vB</strong>
            ) : (
              <LoadingSmall text="Loading..." />
            )}
          </div>
        </div>
        <div className="p-3">
          <div className="text-sm text-gray-500 mb-1">TX FEE</div>
          <div>
            <strong>
              {satoshiToBtc(stakingFeeSat)} {coinName}
            </strong>
          </div>
        </div>
      </div>
    );
  };

  const selectedModeRender = () => {
    const showLowFeesWarning =
      selectedFeeRate && mempoolFeeRates && selectedFeeRate < defaultFeeRate;

    return (
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-2 mb-4 bg-gray-50 border border-gray-200">
          <div className="p-3 border-r border-gray-200">
            <div className="text-sm text-gray-500 mb-1">FEE RATE</div>
            <div>
              <strong>{selectedFeeRate || defaultFeeRate} sat/vB</strong>
            </div>
          </div>
          <div className="p-3">
            <div className="text-sm text-gray-500 mb-1">TX FEE</div>
            <div>
              <strong>
                {satoshiToBtc(stakingFeeSat)} {coinName}
              </strong>
            </div>
          </div>
        </div>
        <div>
          <input
            type="range"
            min={minFeeRate}
            max={maxFeeRate}
            value={selectedFeeRate || defaultFeeRate}
            className={`range range-xs my-2 opacity-60 ${showLowFeesWarning ? "range-error" : "range-primary"}`}
            onChange={handleSliderChange}
          />
          <div className="w-full flex justify-between text-xs px-0 items-center">
            <span className="opacity-50">{minFeeRate} sat/vB</span>
            {showLowFeesWarning ? (
              <p className="text-center text-error">
                Fees are low, inclusion is not guaranteed
              </p>
            ) : null}
            <span className="opacity-50">{maxFeeRate} sat/vB</span>
          </div>
        </div>
      </div>
    );
  };

  const customModeReady = customMode && mempoolFeeRates && stakingFeeSat;

  return (
    <div className="my-2 text-sm">
      {customModeReady ? selectedModeRender() : defaultModeRender()}
    </div>
  );
};
