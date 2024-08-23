import { encode } from "url-safe-base64";

import { Pagination } from "../types/api";
import { Delegation } from "../types/delegations";

import { apiWrapper } from "./apiWrapper";

export interface PaginatedDelegations {
  delegations: Delegation[];
  pagination: Pagination;
  error: boolean;
}

interface DelegationsAPIResponse {
  data: DelegationAPI[];
  pagination: Pagination;
}

interface DelegationAPI {
  staking_tx_hash_hex: string;
  staker_pk_hex: string;
  finality_provider_pk_hex: string;
  state: string;
  staking_value: number;
  staking_tx: StakingTxAPI;
  unbonding_tx?: UnbondingTxAPI;
  is_overflow: boolean;
}

interface StakingTxAPI {
  tx_hex: string;
  output_index: number;
  start_timestamp: string;
  start_height: number;
  timelock: number;
}

interface UnbondingTxAPI {
  tx_hex: string;
  output_index: number;
}

export const getDelegations = async (
  key: string,
  publicKeyNoCoord?: string,
): Promise<PaginatedDelegations> => {
  if (!publicKeyNoCoord) {
    throw new Error("No public key provided");
  }

  // const limit = 100;
  // const reverse = false;

  const params = {
    pagination_key: encode(key),
    // "pagination_reverse": reverse,
    // "pagination_limit": limit,
    staker_btc_pk: encode(publicKeyNoCoord),
  };

  let response;
  try {
    response = await apiWrapper(
      "GET",
      "/v1/staker/delegations",
      "Error getting delegations",
      params,
    );
  } catch (error) {
    console.error(error);
    response = {
      data: {
        delegations: [
          {
            stakingTxHashHex: "abcdef1234567890",
            stakerPkHex: "stakerKey1",
            finalityProviderPkHex: "providerKey1",
            state: "active",
            stakingValueSat: 100000000,
            stakingTx: {
              txHex: "abcdef1234567890abcdef1234567890",
              outputIndex: 0,
              startTimestamp: "2023-08-21T12:00:00Z",
              startHeight: 680000,
              timelock: 600,
            },
            unbondingTx: undefined,
            isOverflow: false,
          },
          {
            stakingTxHashHex: "abcdef1234567891",
            stakerPkHex: "stakerKey2",
            finalityProviderPkHex: "providerKey2",
            state: "unbonding_requested",
            stakingValueSat: 200000000,
            stakingTx: {
              txHex: "abcdef1234567891abcdef1234567891",
              outputIndex: 1,
              startTimestamp: "2023-08-21T12:05:00Z",
              startHeight: 680005,
              timelock: 1200,
            },
            unbondingTx: {
              txHex: "unbonding1234567891abcdef",
              outputIndex: 2,
            },
            isOverflow: false,
          },
          {
            stakingTxHashHex: "abcdef1234567892",
            stakerPkHex: "stakerKey3",
            finalityProviderPkHex: "providerKey3",
            state: "pending",
            stakingValueSat: 300000000,
            stakingTx: {
              txHex: "abcdef1234567892abcdef1234567892",
              outputIndex: 2,
              startTimestamp: "2023-08-21T12:10:00Z",
              startHeight: 680010,
              timelock: 1800,
            },
            unbondingTx: undefined,
            isOverflow: true,
          },
          {
            stakingTxHashHex: "abcdef1234567893",
            stakerPkHex: "stakerKey4",
            finalityProviderPkHex: "providerKey4",
            state: "unbonded",
            stakingValueSat: 400000000,
            stakingTx: {
              txHex: "abcdef1234567893abcdef1234567893",
              outputIndex: 3,
              startTimestamp: "2023-08-21T12:15:00Z",
              startHeight: 680015,
              timelock: 2400,
            },
            unbondingTx: {
              txHex: "unbonding1234567893abcdef",
              outputIndex: 3,
            },
            isOverflow: false,
          },
          {
            stakingTxHashHex: "abcdef1234567894",
            stakerPkHex: "stakerKey5",
            finalityProviderPkHex: "providerKey5",
            state: "withdrawn",
            stakingValueSat: 500000000,
            stakingTx: {
              txHex: "abcdef1234567894abcdef1234567894",
              outputIndex: 4,
              startTimestamp: "2023-08-21T12:20:00Z",
              startHeight: 680020,
              timelock: 3000,
            },
            unbondingTx: undefined,
            isOverflow: false,
          },
          {
            stakingTxHashHex: "abcdef1234567895",
            stakerPkHex: "stakerKey6",
            finalityProviderPkHex: "providerKey6",
            state: "overflow",
            stakingValueSat: 600000000,
            stakingTx: {
              txHex: "abcdef1234567895abcdef1234567895",
              outputIndex: 5,
              startTimestamp: "2023-08-21T12:25:00Z",
              startHeight: 680025,
              timelock: 3600,
            },
            unbondingTx: undefined,
            isOverflow: true,
          },
          {
            stakingTxHashHex: "abcdef1234567896",
            stakerPkHex: "stakerKey7",
            finalityProviderPkHex: "providerKey7",
            state: "intermediate_unbonding",
            stakingValueSat: 700000000,
            stakingTx: {
              txHex: "abcdef1234567896abcdef1234567896",
              outputIndex: 6,
              startTimestamp: "2023-08-21T12:30:00Z",
              startHeight: 680030,
              timelock: 4200,
            },
            unbondingTx: {
              txHex: "unbonding1234567896abcdef",
              outputIndex: 4,
            },
            isOverflow: false,
          },
          {
            stakingTxHashHex: "abcdef1234567897",
            stakerPkHex: "stakerKey8",
            finalityProviderPkHex: "providerKey8",
            state: "intermediate_withdrawal",
            stakingValueSat: 800000000,
            stakingTx: {
              txHex: "abcdef1234567897abcdef1234567897",
              outputIndex: 7,
              startTimestamp: "2023-08-21T12:35:00Z",
              startHeight: 680035,
              timelock: 4800,
            },
            unbondingTx: undefined,
            isOverflow: true,
          },
          {
            stakingTxHashHex: "abcdef1234567898",
            stakerPkHex: "stakerKey9",
            finalityProviderPkHex: "providerKey9",
            state: "expired",
            stakingValueSat: 900000000,
            stakingTx: {
              txHex: "abcdef1234567898abcdef1234567898",
              outputIndex: 8,
              startTimestamp: "2023-08-21T12:40:00Z",
              startHeight: 680040,
              timelock: 5400,
            },
            unbondingTx: undefined,
            isOverflow: false,
          },
          {
            stakingTxHashHex: "abcdef1234567899",
            stakerPkHex: "stakerKey10",
            finalityProviderPkHex: "providerKey10",
            state: "active",
            stakingValueSat: 1000000000,
            stakingTx: {
              txHex: "abcdef1234567899abcdef1234567899",
              outputIndex: 9,
              startTimestamp: "2023-08-21T12:45:00Z",
              startHeight: 680045,
              timelock: 6000,
            },
            unbondingTx: undefined,
            isOverflow: false,
          },
        ],
        pagination: {
          next_key: "",
        },
      },
    };
    return {
      delegations: response.data.delegations,
      pagination: response.data.pagination,
      error: true,
    };
  }

  const delegationsAPIResponse: DelegationsAPIResponse = response.data;

  const delegations: Delegation[] = delegationsAPIResponse.data.map(
    (apiDelegation: DelegationAPI): Delegation => ({
      stakingTxHashHex: apiDelegation.staking_tx_hash_hex,
      stakerPkHex: apiDelegation.staker_pk_hex,
      finalityProviderPkHex: apiDelegation.finality_provider_pk_hex,
      state: apiDelegation.state,
      stakingValueSat: apiDelegation.staking_value,
      stakingTx: {
        txHex: apiDelegation.staking_tx.tx_hex,
        outputIndex: apiDelegation.staking_tx.output_index,
        startTimestamp: apiDelegation.staking_tx.start_timestamp,
        startHeight: apiDelegation.staking_tx.start_height,
        timelock: apiDelegation.staking_tx.timelock,
      },
      isOverflow: apiDelegation.is_overflow,
      unbondingTx: apiDelegation.unbonding_tx
        ? {
            txHex: apiDelegation.unbonding_tx.tx_hex,
            outputIndex: apiDelegation.unbonding_tx.output_index,
          }
        : undefined,
    }),
  );

  const pagination: Pagination = {
    next_key: delegationsAPIResponse.pagination.next_key,
  };
  return { delegations: delegations, pagination: pagination, error: false };
};
