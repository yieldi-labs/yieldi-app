import { ChangeEvent, useEffect, useState, useCallback } from "react";

import { getNetworkConfig } from "@/config/network.config";
import { blocksToDisplayTime } from "@/utils/blocksToDisplayTime";

interface StakingTimeProps {
  minStakingTimeBlocks: number;
  maxStakingTimeBlocks: number;
  unbondingTimeBlocks: number;
  onStakingTimeBlocksChange: (inputTimeBlocks: number) => void;
  reset: boolean;
}

export const StakingTime: React.FC<StakingTimeProps> = ({
  minStakingTimeBlocks,
  maxStakingTimeBlocks,
  unbondingTimeBlocks,
  onStakingTimeBlocksChange,
  reset,
}) => {
  const [value, setValue] = useState("150");
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);

  const { coinName } = getNetworkConfig();

  const validateAndSetTime = useCallback(
    (timeValue: string) => {
      const numValue = Number(timeValue);

      if (timeValue === "" || isNaN(numValue) || numValue === 0) {
        setError("You should input a valid staking term");
        onStakingTimeBlocksChange(0);
        return;
      }

      if (numValue < minStakingTimeBlocks) {
        setError(`Staking term must be at least ${minStakingTimeBlocks} blocks.`);
        onStakingTimeBlocksChange(0);
        return;
      }

      if (numValue > maxStakingTimeBlocks) {
        setError(`Staking term must be no more than ${maxStakingTimeBlocks} blocks.`);
        onStakingTimeBlocksChange(0);
        return;
      }

      setError("");
      onStakingTimeBlocksChange(numValue);
    },
    [minStakingTimeBlocks, maxStakingTimeBlocks, onStakingTimeBlocksChange]
  );

  useEffect(() => {
    validateAndSetTime("150");
  }, [validateAndSetTime]);

  useEffect(() => {
    if (reset) {
      setValue("150");
      setError("");
      setTouched(false);
      validateAndSetTime("150");
    }
  }, [reset, validateAndSetTime]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    setTouched(true);
    validateAndSetTime(newValue);
  };

  const isFixed = minStakingTimeBlocks === maxStakingTimeBlocks;
  if (isFixed) {
    return (
      <div className="card mb-2 bg-base-200 p-4">
        <p>
          You can unbond and withdraw your stake anytime with an unbonding time
          of {blocksToDisplayTime(unbondingTimeBlocks)}.
        </p>
        <p>
          There is also a build-in maximum staking period of{" "}
          {blocksToDisplayTime(minStakingTimeBlocks)}.
        </p>
        <p>
          If the stake is not unbonded before the end of this period, it will
          automatically become withdrawable by you anytime afterwards.
        </p>
        <p>
          The above times are approximates based on average {coinName} block
          time.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-4 bg-gray-50 p-3 border border-gray-200">
      <div className="flex justify-between mb-1">
        <span className="text-sm text-gray-500">TERM</span>
        <span className="text-sm text-gray-500">
          in blocks (min {minStakingTimeBlocks})
        </span>
      </div>
      <div className="flex justify-end items-center">
        <input
          type="number"
          value={value}
          onChange={handleChange}
          className="text-right text-2xl font-bold w-full bg-transparent focus:outline-none"
          min={minStakingTimeBlocks}
          max={maxStakingTimeBlocks}
        />
      </div>
      {touched && error ? <p className="text-sm text-red-500 mt-1">{error}</p> : null}
    </div>
  );
};