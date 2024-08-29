import * as Form from "@radix-ui/react-form";
import { Flex } from "@radix-ui/themes";
import { ChangeEvent, useEffect, useState, useCallback } from "react";
import { twMerge } from "tailwind-merge";

import { getNetworkConfig } from "@/config/network.config";
import { blocksToDisplayTime } from "@/utils/blocksToDisplayTime";

import { validateNoDecimalPoints } from "./validation/validation";

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
  const [updateTimeout, setUpdateTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );

  const errorLabel = "Staking term";
  const generalErrorMessage = "You should input staking term";

  const { coinName } = getNetworkConfig();

  const validateAndSetTime = useCallback(
    (timeValue: string) => {
      if (timeValue === "") {
        onStakingTimeBlocksChange(0);
        setError(generalErrorMessage);
        return;
      }

      const numValue = Number(timeValue);

      const validations = [
        {
          valid: !isNaN(numValue),
          message: `${errorLabel} must be a valid number.`,
        },
        {
          valid: numValue !== 0,
          message: `${errorLabel} must be greater than 0.`,
        },
        {
          valid: validateNoDecimalPoints(timeValue),
          message: `${errorLabel} must not have decimal points.`,
        },
        {
          valid: numValue >= minStakingTimeBlocks,
          message: `${errorLabel} must be at least ${minStakingTimeBlocks} blocks.`,
        },
        {
          valid: numValue <= maxStakingTimeBlocks,
          message: `${errorLabel} must be no more than ${maxStakingTimeBlocks} blocks.`,
        },
      ];

      const firstInvalid = validations.find((validation) => !validation.valid);

      if (firstInvalid) {
        onStakingTimeBlocksChange(0);
        setError(firstInvalid.message);
      } else {
        setError("");
        onStakingTimeBlocksChange(numValue);
      }
    },
    [
      minStakingTimeBlocks,
      maxStakingTimeBlocks,
      onStakingTimeBlocksChange,
      errorLabel,
      generalErrorMessage,
    ],
  );

  const debouncedValidateAndSetTime = useCallback(
    (newValue: string) => {
      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }
      const timeout = setTimeout(() => {
        validateAndSetTime(newValue);
      }, 1000);
      setUpdateTimeout(timeout);
    },
    [updateTimeout, validateAndSetTime],
  );

  useEffect(() => {
    // Set and validate initial value
    validateAndSetTime("150");

    // Cleanup function
    return () => {
      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }
    };
  }, [validateAndSetTime, updateTimeout]);

  useEffect(() => {
    if (reset) {
      setValue("150");
      setError("");
      setTouched(false);
      validateAndSetTime("150");
      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }
    }
  }, [reset, validateAndSetTime, updateTimeout]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    setTouched(true);

    if (newValue === "") {
      setError(generalErrorMessage);
    } else {
      setError("");
    }

    debouncedValidateAndSetTime(newValue);
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
    <Flex direction="column" className="w-full bg-gray-100 mb-5">
      <Form.Field name="finality-provider" className="w-full flex flex-col">
        <Form.Label className="text-xs font-medium mb-2 pl-2">
          TERM{" "}
          <span className="font-normal pl-[2px]">
            in blocks (min {minStakingTimeBlocks})
          </span>
        </Form.Label>
        <Form.Control asChild className="bg-gray-200 lg:py-3 px-1 lg:px-2">
          <input
            className={twMerge(
              "box-border w-full inline-flex appearance-none items-center justify-center",
              error ? "input-error" : "",
            )}
            type="number"
            value={value}
            onChange={handleChange}
            placeholder="150"
            required
          />
        </Form.Control>
        {touched && error ? (
          <p className="text-sm text-error py-2">*{error}</p>
        ) : null}
      </Form.Field>
    </Flex>
  );
};
