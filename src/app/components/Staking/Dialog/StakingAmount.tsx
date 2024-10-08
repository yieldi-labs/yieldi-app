import { UTXO } from "btc-staking-ts";
import React, { ChangeEvent, useEffect, useState, useCallback } from "react";
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
  reset: number;
  availableUtxos: UTXO[] | undefined;
}

export const StakingAmount: React.FC<StakingAmountProps> = ({
  minStakingAmountSat,
  maxStakingAmountSat,
  btcWalletBalanceSat,
  onStakingAmountSatChange,
  reset,
  availableUtxos,
}) => {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);
  const [updateTimeout, setUpdateTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );

  const errorLabel = "Staking amount";
  const generalErrorMessage = "You should input staking amount";

  const { coinSymbol } = getNetworkConfig();

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
          message: `${errorLabel} must be at least ${satoshiToBtc(minStakingAmountSat)} ${coinSymbol}.`,
        },
        {
          valid: satoshis <= maxStakingAmountSat,
          message: `${errorLabel} must be no more than ${satoshiToBtc(maxStakingAmountSat)} ${coinSymbol}.`,
        },
        {
          valid: satoshis <= btcWalletBalanceSat,
          message: `${errorLabel} must be no more than ${satoshiToBtc(btcWalletBalanceSat)} wallet balance.`,
        },
        {
          valid: validateDecimalPoints(amount),
          message: `${errorLabel} must have no more than 8 decimal points.`,
        },
        {
          valid: availableUtxos != undefined && 1 >= availableUtxos?.length,
          message: "Not enough usable balance. Please wait for the next block.",
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
      coinSymbol,
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

  return (
    <div className="mb-2 mx-2 p-3 border border-yieldi-gray-200 bg-white">
      <div className="flex justify-between mb-3">
        <span className="text-sm">AMOUNT {availableUtxos?.length}</span>
        <span className="text-sm font-light">
          Balance: {satoshiToBtc(btcWalletBalanceSat)} {coinSymbol}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <button
          onClick={handleMaxClick}
          className="flex w-[56px] pb-2px pt-4px justify-center items-center 
        rounded bg-yieldi-brown text-yieldi-beige text-xs font-medium"
        >
          MAX
        </button>
        <input
          type="text"
          value={value}
          onChange={handleChange}
          className={twMerge(
            "text-right text-3xl font-bold w-full bg-transparent focus:outline-none font-gt-america-mono",
            error ? "text-red-500" : "",
          )}
          placeholder="0.00"
          required
        />
      </div>
      {touched && error ? (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      ) : null}
    </div>
  );
};
