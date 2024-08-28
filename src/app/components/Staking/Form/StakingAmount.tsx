import * as Form from "@radix-ui/react-form";
import { Flex } from "@radix-ui/themes";
import { ChangeEvent, FocusEvent, useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

import { getNetworkConfig } from "@/config/network.config";
import { btcToSatoshi, satoshiToBtc } from "@/utils/btcConversions";
import { maxDecimals } from "@/utils/maxDecimals";

import { validateDecimalPoints } from "./validation/validation";

interface StakingAmountProps {
  minStakingAmountSat: number;
  maxStakingAmountSat: number;
  btcWalletBalanceSat: number;
  onStakingAmountSatChange: (inputAmountSat: number) => void;
  reset: boolean;
}

export const StakingAmount: React.FC<StakingAmountProps> = ({
  minStakingAmountSat,
  maxStakingAmountSat,
  btcWalletBalanceSat,
  onStakingAmountSatChange,
  reset,
}) => {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  // Track if the input field has been interacted with
  const [touched, setTouched] = useState(false);

  const errorLabel = "Staking amount";
  const generalErrorMessage = "You should input staking amount";

  const { coinName } = getNetworkConfig();

  // Use effect to reset the state when reset prop changes
  useEffect(() => {
    setValue("");
    setError("");
    setTouched(false);
  }, [reset]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // Allow the input to be changed freely
    setValue(newValue);

    if (touched && newValue === "") {
      setError(generalErrorMessage);
    } else {
      setError("");
    }
  };

  const handleBlur = (_e: FocusEvent<HTMLInputElement>) => {
    setTouched(true);

    if (value === "") {
      onStakingAmountSatChange(0);
      setError(generalErrorMessage);
      return;
    }

    const numValue = parseFloat(value);
    const satoshis = btcToSatoshi(numValue);

    // Run all validations
    const validations = [
      {
        valid: !isNaN(Number(value)),
        message: `${errorLabel} must be a valid number.`,
      },
      {
        valid: numValue !== 0,
        message: `${errorLabel} must be greater than 0.`,
      },
      {
        valid: satoshis >= minStakingAmountSat,
        message: `${errorLabel} must be at least ${satoshiToBtc(minStakingAmountSat)} ${coinName}.`,
      },
      {
        valid: satoshis <= maxStakingAmountSat,
        message: `${errorLabel} must be no more than ${satoshiToBtc(maxStakingAmountSat)} ${coinName}.`,
      },
      {
        valid: satoshis <= btcWalletBalanceSat,
        message: `${errorLabel} must be no more than ${satoshiToBtc(btcWalletBalanceSat)} wallet balance.`,
      },
      {
        valid: validateDecimalPoints(value),
        message: `${errorLabel} must have no more than 8 decimal points.`,
      },
    ];

    // Find the first failing validation
    const firstInvalid = validations.find((validation) => !validation.valid);

    if (firstInvalid) {
      onStakingAmountSatChange(0);
      setError(firstInvalid.message);
    } else {
      setError("");
      onStakingAmountSatChange(satoshis);
      setValue(maxDecimals(satoshiToBtc(satoshis), 8).toString());
    }
  };

  const minStakeAmount = maxDecimals(satoshiToBtc(minStakingAmountSat), 8);
  const maxStakeAmount = maxDecimals(satoshiToBtc(maxStakingAmountSat), 8);
  return (
    <Flex direction="column" className="w-full max-w-md bg-gray-100 mb-5">
      <Form.Field name="amount" className="w-full flex flex-col">
        <Form.Label className="text-xs font-medium mb-2 pl-2">
          AMOUNT
          <span className="font-normal pl-[2px]">
            min/max: {minStakeAmount}/{maxStakeAmount} {coinName}
          </span>
        </Form.Label>
        <Form.Control asChild className="bg-gray-200 lg:py-3 px-1 lg:px-2">
          <input
            className={twMerge(
              "box-border w-full inline-flex appearance-none items-center justify-center",
              error ? "input-error" : "",
            )}
            type="text"
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={coinName}
            required
          />
        </Form.Control>
        {error ? <p className="text-sm text-error py-2">*{error}</p> : null}
      </Form.Field>
    </Flex>
  );
};
