import { DelegationState } from "@/app/types/delegations";

// Convert state to human readable format
export const getState = (state: string) => {
  switch (state) {
    case DelegationState.ACTIVE:
      return "Active";
    case DelegationState.UNBONDING_REQUESTED:
      return "Unbonding Requested";
    case DelegationState.UNBONDING:
      return "Unbonding";
    case DelegationState.UNBONDED:
      return "Unbonded";
    case DelegationState.WITHDRAWN:
      return "Withdrawn";
    case DelegationState.PENDING:
      return "Pending";
    case DelegationState.OVERFLOW:
      return "Overflow";
    case DelegationState.EXPIRED:
      return "Expired";
    // Intermediate local storage states
    case DelegationState.INTERMEDIATE_UNBONDING:
      return "Requesting Unbonding";
    case DelegationState.INTERMEDIATE_WITHDRAWAL:
      return "Withdrawal Submitted";
    default:
      return "Unknown";
  }
};

// Create state tooltips for the additional information
export const getStateTooltip = (state: string) => {
  switch (state) {
    case DelegationState.ACTIVE:
      return "When the position is active.";
    case DelegationState.UNBONDING_REQUESTED:
      return "When the unbonding tx is awaiting confirmation.";
    case DelegationState.UNBONDING:
      return "When the unbonding tx is awaiting confirmation.";
    case DelegationState.UNBONDED:
      return "When the unbonding tx is confirmed, the stake amount is now eligible to be withdrawn.";
    case DelegationState.WITHDRAWN:
      return "When the stake amount is fully withdrawn and the position is no longer active.";
    case DelegationState.PENDING:
      return "When the position is awaiting confirmation before becoming active";
    case DelegationState.OVERFLOW:
      return "When the stake cap is reached";
    case DelegationState.EXPIRED:
      return "When the stake time lock has expired";
    // Intermediate local storage states
    case DelegationState.INTERMEDIATE_UNBONDING:
      return "When the unbonding tx is awaiting confirmation.";
    case DelegationState.INTERMEDIATE_WITHDRAWAL:
      return "When the withdraw tx is awaiting confirmation.";
    default:
      return "Unknown";
  }
};
