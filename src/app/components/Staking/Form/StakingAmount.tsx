import * as Form from "@radix-ui/react-form";
import { Flex, Link } from "@radix-ui/themes";
import { ChangeEvent, useEffect, useState, useCallback } from "react";
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
  const [touched, setTouched] = useState(false);
  const [updateTimeout, setUpdateTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );

  const errorLabel = "Staking amount";
  const generalErrorMessage = "You should input staking amount";

  const { coinName } = getNetworkConfig();

  useEffect(() => {
    if (reset) {
      setValue("");
      setError("");
      setTouched(false);
      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }
    }
  }, [reset, updateTimeout]);

  const validateAndSetAmount = useCallback(
    (amount: string) => {
      if (amount === "") {
        onStakingAmountSatChange(0);
        setError(generalErrorMessage);
        return;
      }

      const numValue = parseFloat(amount);
      const satoshis = btcToSatoshi(numValue);

      const validations = [
        {
          valid: !isNaN(Number(amount)),
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
          valid: validateDecimalPoints(amount),
          message: `${errorLabel} must have no more than 8 decimal points.`,
        },
      ];

      const firstInvalid = validations.find((validation) => !validation.valid);

      if (firstInvalid) {
        onStakingAmountSatChange(0);
        setError(firstInvalid.message);
      } else {
        setError("");
        onStakingAmountSatChange(satoshis);
      }
    },
    [
      minStakingAmountSat,
      maxStakingAmountSat,
      btcWalletBalanceSat,
      onStakingAmountSatChange,
      coinName,
      errorLabel,
      generalErrorMessage,
    ],
  );

  const debouncedValidateAndSetAmount = useCallback(
    (newValue: string) => {
      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }
      const timeout = setTimeout(() => {
        validateAndSetAmount(newValue);
      }, 500);
      setUpdateTimeout(timeout);
    },
    [updateTimeout, validateAndSetAmount],
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    setTouched(true);

    if (newValue === "") {
      setError(generalErrorMessage);
    } else {
      setError("");
    }

    debouncedValidateAndSetAmount(newValue);
  };

  const handleMaxClick = () => {
    //TODO: Add fee calculation
    const minFeeSats = 277;
    const safeMaxStakingAmountSat = maxStakingAmountSat - minFeeSats;
    const safeBtcWalletBalanceSat = btcWalletBalanceSat - minFeeSats;

    const maxAmount = Math.min(
      safeMaxStakingAmountSat,
      safeBtcWalletBalanceSat,
    );
    const maxAmountBtc = satoshiToBtc(maxAmount);
    const newValue = maxDecimals(maxAmountBtc, 8).toString();
    setValue(newValue);
    validateAndSetAmount(newValue);
  };

  const minStakeAmount = maxDecimals(satoshiToBtc(minStakingAmountSat), 8);
  const maxStakeAmount = maxDecimals(satoshiToBtc(maxStakingAmountSat), 8);

  return (
    <Flex direction="column" className="w-full bg-gray-100 mb-5">
      <Form.Field name="amount" className="w-full flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <Form.Label className="text-xs font-medium pl-2">
            AMOUNT
            <span className="font-normal pl-[2px]">
              (min: {minStakeAmount}, max: {maxStakeAmount})
            </span>
          </Form.Label>
          <span className="text-xs font-normal pr-2">
            Balance: {satoshiToBtc(btcWalletBalanceSat)}
          </span>
        </div>
        <div className="relative">
          <Form.Control asChild className="bg-gray-200 lg:py-3 px-1 lg:px-2">
            <input
              className={twMerge(
                "box-border w-full inline-flex appearance-none items-center justify-center pr-16",
                error ? "input-error" : "",
              )}
              type="text"
              value={value}
              onChange={handleChange}
              placeholder={coinName}
              required
            />
          </Form.Control>
          <Link
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleMaxClick();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded text-sm text-black text-sm underline decoration-black"
          >
            Max
          </Link>
        </div>
        {touched && error ? (
          <p className="text-sm text-error py-2">*{error}</p>
        ) : null}
      </Form.Field>
    </Flex>
  );
};
