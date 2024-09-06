export const enum WalletErrorType {
  ConnectionCancelled = "ConnectionCancelled",
}
import { ErrorState } from "@/app/types/errors";

export class WalletError extends Error {
  private type: WalletErrorType;
  constructor(type: WalletErrorType, message: string) {
    super(message);
    this.name = "WalletError";
    this.type = type;
  }

  public getType(): WalletErrorType {
    return this.type;
  }
}

export const getErrorTitle = (errorState: ErrorState) => {
  switch (errorState) {
    case ErrorState.SERVER_ERROR:
      return "Server Error";
    case ErrorState.WALLET:
      return "Network Error";
    case ErrorState.WITHDRAW:
      return "Withdraw Error";
    case ErrorState.STAKING:
      return "Stake Error";
    case ErrorState.UNBONDING:
      return "Unbonding Error";
    default:
      return "Unknown Error";
  }
};

export const getErrorMessage = (
  errorState: ErrorState,
  errorMessage: string,
) => {
  switch (errorState) {
    case ErrorState.SERVER_ERROR:
      return `Error fetching data due to: ${errorMessage}`;
    case ErrorState.UNBONDING:
      return `Your request to unbound failed due to: ${errorMessage}`;
    case ErrorState.WITHDRAW:
      return `Failed to withdraw due to: ${errorMessage}`;
    case ErrorState.STAKING:
      return `Failed to stake due to: ${errorMessage}`;
    case ErrorState.WALLET:
      return `Failed to switch network due to: ${errorMessage}`;
    default:
      return errorMessage;
  }
};
