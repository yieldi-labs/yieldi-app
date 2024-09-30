import { Table } from "@radix-ui/themes";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { Tooltip } from "react-tooltip";
import { twMerge } from "tailwind-merge";
import { useLocalStorage } from "usehooks-ts";

import { getGlobalParams } from "@/app/api/getGlobalParams";
import { useDialog } from "@/app/context/DialogContext";
import { useWallet } from "@/app/context/WalletContext";
import { getNetworkConfig } from "@/app/network.config";
import { Delegation, DelegationState } from "@/app/types/delegations";
import { ErrorState } from "@/app/types/errors";
import { GlobalParamsVersion } from "@/app/types/globalParams";
import { satoshiToBtc } from "@/utils/btcConversions";
import { signUnbondingTx } from "@/utils/delegations/signUnbondingTx";
import { signWithdrawalTx } from "@/utils/delegations/signWithdrawalTx";
import { getErrorMessage, getErrorTitle } from "@/utils/errors";
import { durationTillNow } from "@/utils/formatTime";
import { getState, getStateTooltip } from "@/utils/getState";
import { getCurrentGlobalParamsVersion } from "@/utils/globalParams";
import { calculateDelegationsDiff } from "@/utils/local_storage/calculateDelegationsDiff";
import { getDelegationsLocalStorageKey } from "@/utils/local_storage/getDelegationsLocalStorageKey";
import { getIntermediateDelegationsLocalStorageKey } from "@/utils/local_storage/getIntermediateDelegationsLocalStorageKey";
import { toLocalStorageIntermediateDelegation } from "@/utils/local_storage/toLocalStorageIntermediateDelegation";
import { maxDecimals } from "@/utils/maxDecimals";
import { Formatter } from "@/utils/numberFormatter";
import { signPsbtTransaction } from "@/utils/psbt";
import { trim } from "@/utils/trim";

import {
  MODE,
  MODE_UNBOND,
  MODE_WITHDRAW,
  UnbondWithdrawModal,
} from "../Modals/UnbondWithdrawModal";

// This component is responsible for rendering an individual delegation row or card
const DelegationRow: React.FC<{
  delegation: any;
  finalityProviderMoniker: string;
  asset: any;
  screenType: "table" | "card";
  onUnbond: () => void;
  onWithdraw: () => void;
  intermediateState?: string;
  globalParamsVersion: GlobalParamsVersion | undefined;
}> = ({
  delegation,
  finalityProviderMoniker,
  asset,
  screenType,
  onUnbond,
  onWithdraw,
  intermediateState,
}) => {
  const { stakingValueSat, stakingTx, stakingTxHashHex, state, isOverflow } =
    delegation;
  const { startTimestamp } = stakingTx;
  const currentTime = Date.now();
  const { mempoolApiUrl } = getNetworkConfig();

  const generateActionButton = () => {
    // This function generates the unbond or withdraw button
    // based on the state of the delegation
    // It also disables the button if the delegation
    // is in an intermediate state (local storage)

    if (state === DelegationState.ACTIVE) {
      return (
        <div className="">
          <button
            className="flex justify-center items-center w-[152px] h-[38px] px-[21px] py-[10px] gap-[10px] shrink-0 rounded bg-yieldi-brown text-white text-sm font-medium"
            onClick={() => onUnbond()}
          >
            Unbond
          </button>
        </div>
      );
    } else if (state === DelegationState.UNBONDED) {
      return (
        <div className="">
          <button
            className="flex justify-center items-center w-[152px] h-[38px] px-[21px] py-[10px] gap-[10px] shrink-0 rounded bg-yieldi-brown text-white text-sm font-medium"
            onClick={() => onWithdraw()}
            disabled={
              intermediateState === DelegationState.INTERMEDIATE_WITHDRAWAL
            }
          >
            Withdraw
          </button>
        </div>
      );
    } else if (state === DelegationState.UNBONDING) {
      return (
        <button
          className="opacity-50 flex justify-center items-center w-[152px] h-[38px] px-[21px] py-[10px] gap-[10px] shrink-0 rounded bg-yieldi-brown text-yieldi-beige text-sm font-medium"
          disabled={
            intermediateState === DelegationState.INTERMEDIATE_UNBONDING
          }
        >
          Unbond
        </button>
      );
    } else {
      return <></>;
    }
  };

  const isActive =
    intermediateState === DelegationState.ACTIVE ||
    state === DelegationState.ACTIVE;

  const renderState = () => {
    // overflow should be shown only on active state
    if (isOverflow && isActive) {
      return getState(DelegationState.OVERFLOW);
    } else {
      return getState(intermediateState || state);
    }
  };

  const renderStateTooltip = () => {
    // overflow should be shown only on active state
    if (isOverflow && isActive) {
      return getStateTooltip(DelegationState.OVERFLOW);
    } else {
      return getStateTooltip(intermediateState || state);
    }
  };

  const getStateBgColor = () => {
    if (state === DelegationState.ACTIVE) {
      return "bg-yieldi-green";
    } else if (state === DelegationState.WITHDRAWN) {
      return "bg-yieldi-gray-200";
    } else {
      return "bg-yieldi-yellow";
    }
  };

  if (screenType === "table") {
    return (
      <Table.Row
        key={stakingTxHashHex}
        className="mb-2 items-start gap-4 border shadow-sm hover:bg-gray-50"
      >
        <Table.Cell className="p-4">
          <p className="text-yieldi-brown text-xl font-medium leading-normal">
            {durationTillNow(startTimestamp, currentTime, [
              "days",
              "hours",
            ])}
          </p>
          <p className="text-yieldi-brown text-xs font-medium leading-normal">
            {startTimestamp}
          </p>
        </Table.Cell>
        <Table.Cell className="p-4">
          <div className="text-yieldi-brown text-xl font-medium leading-normal">
            {finalityProviderMoniker}{" "}
          </div>
          <a
            href={`${mempoolApiUrl}/tx/${stakingTxHashHex}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-yieldi-brown text-xs hover:underline"
          >
            {trim(stakingTxHashHex)}
          </a>
        </Table.Cell>
        <Table.Cell className="p-4">
          <div className="text-xl font-gt-america text-body font-normal">
            {`$${Formatter.format(maxDecimals(satoshiToBtc(stakingValueSat) * (asset?.price || 1), 4))}`}
            <br />
            <span className="font-gt-america text-sm font-normal text-yieldi-brown-light">
              {`${maxDecimals(satoshiToBtc(stakingValueSat), 5)} ${asset?.assetSymbol}`}
            </span>
          </div>
        </Table.Cell>
        <Table.Cell className="text-yieldi-brown text-lg font-normal p-4">{`$0.00 PENDING`}</Table.Cell>
        <Table.Cell className="text-sm font-normal">
          <span
            className={twMerge(
              "flex items-center justify-center w-[86px] h-[33px] px-2.5 py-3 gap-2.5 rounded-full text-primary font-medium text-[10px] font-gt-america-mono leading-3",
              getStateBgColor(),
            )}
          >
            <div
              className="flex justify-center items-center cursor-pointer align-middle"
              data-tooltip-id={`tooltip-${stakingTxHashHex}`}
              data-tooltip-content={renderStateTooltip()}
              data-tooltip-place="top"
            >
              <p className="uppercase">{renderState()}</p>
              <span>
                <Tooltip id={`tooltip-${stakingTxHashHex}`} />
              </span>
            </div>
          </span>
        </Table.Cell>
        <Table.Cell>{generateActionButton()}</Table.Cell>
      </Table.Row>
    );
  } else {
    return (
      <div className="w-full mb-6 bg-white">
        <div
          className="border border-yieldi-gray-200"
          key={delegation.finalityProviderPkHex}
        >
          <div className="grid grid-cols-2 justify-between border">
            <div className="border font-semibold">
              {finalityProviderMoniker}
              <p className="text-xs text-gray-500">{trim(stakingTxHashHex)}</p>
            </div>
            <div className="flex items-center ">
              <div
                className={` flex items-center rounded-full p-2 ${state === "active" ? "bg-yieldi-green text-black" : "bg-yieldi-red text-white"}`}
              >
                <p>{renderState()}</p>
                <span
                  className="cursor-pointer text-xs"
                  data-tooltip-id={`tooltip-${stakingTxHashHex}`}
                  data-tooltip-content={renderStateTooltip()}
                  data-tooltip-place="top"
                >
                  <AiOutlineInfoCircle />
                </span>
                <span>
                  <Tooltip id={`tooltip-${stakingTxHashHex}`} />
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 border">
            <div className="border rounded-none">
              <p className="font-semibold text-sm">Amount</p>
              {`$${maxDecimals(satoshiToBtc(stakingValueSat) * (asset?.price || 1), 4)}`}
              <br />
              {`${maxDecimals(satoshiToBtc(stakingValueSat), 5)} ${asset?.assetSymbol}`}
            </div>
            <div className="lg:col-span-1 border rounded-none">
              <p className="font-semibold text-sm">Withdrawal Balance</p>
              <p className="text-sm">0.0 BTC</p>
              <p className="text-xs text-yellow-500">↘ $0.00 PENDING</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 border">
            <div className="border rounded-none">
              <p className="font-semibold text-sm">Opened On</p>
              <p className="text-sm">
                {new Date(startTimestamp).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-500">
                {durationTillNow(startTimestamp, currentTime)}
              </p>
            </div>
            <div>{generateActionButton()}</div>
          </div>
        </div>
      </div>
    );
  }
};

const Transactions: React.FC<{
  delegations: any;
  finalityProvidersKV: Record<string, string>;
  asset: any;
  refreshKey: number; // Add refreshKey as a prop
  onRefresh: () => void; // Add a refresh handler
}> = ({ delegations, finalityProvidersKV, asset, refreshKey, onRefresh }) => {
  const { publicKeyNoCoord, btcWallet, btcWalletNetwork } = useWallet();
  const [modalOpen, setModalOpen] = useState(false);
  const [txID, setTxID] = useState("");
  const [modalMode, setModalMode] = useState<MODE>();

  const handleModal = (txID: string, mode: MODE) => {
    setModalOpen(true);
    setTxID(txID);
    setModalMode(mode);
  };

  useEffect(() => {
    // Whenever refreshKey changes, trigger a data fetch or refresh logic
    // This useEffect will trigger when refreshKey updates
    console.log("Refreshing transactions...");
  }, [refreshKey]); // Add refreshKey as a dependency

  const delegationsAPI = delegations.delegations;

  // Local storage state for delegations
  const delegationsLocalStorageKey =
    getDelegationsLocalStorageKey(publicKeyNoCoord);

  const [delegationsLocalStorage, setDelegationsLocalStorage] = useLocalStorage<
    Delegation[]
  >(delegationsLocalStorageKey, []);

  const intermediateDelegationsLocalStorageKey =
    getIntermediateDelegationsLocalStorageKey(publicKeyNoCoord);

  const [
    intermediateDelegationsLocalStorage,
    setIntermediateDelegationsLocalStorage,
  ] = useLocalStorage<Delegation[]>(intermediateDelegationsLocalStorageKey, []);

  const updateLocalStorage = (delegation: Delegation, newState: string) => {
    setIntermediateDelegationsLocalStorage((delegations) => [
      toLocalStorageIntermediateDelegation(
        delegation.stakingTxHashHex,
        publicKeyNoCoord,
        delegation.finalityProviderPkHex,
        delegation.stakingValueSat,
        delegation.stakingTx.txHex,
        delegation.stakingTx.timelock,
        newState,
      ),
      ...delegations,
    ]);
  };

  // Clean up the local storage delegations
  useEffect(() => {
    if (!delegations?.delegations) {
      return;
    }

    const updateDelegationsLocalStorage = async () => {
      const { areDelegationsDifferent, delegations: newDelegations } =
        await calculateDelegationsDiff(
          delegations.delegations,
          delegationsLocalStorage,
        );
      if (areDelegationsDifferent) {
        setDelegationsLocalStorage(newDelegations);
      }
    };

    updateDelegationsLocalStorage();
  }, [delegations, setDelegationsLocalStorage, delegationsLocalStorage]);

  // combine delegations from the API and local storage, prioritizing API data
  const combinedDelegationsData = delegationsAPI
    ? [...delegationsLocalStorage, ...delegationsAPI]
    : // if no API data, fallback to using only local storage delegations
      delegationsLocalStorage;

  const { showDialog } = useDialog();

  const { data: paramWithContext } = useQuery({
    queryKey: ["global params"],
    queryFn: async () => {
      const [height, versions] = await Promise.all([
        btcWallet!.getBTCTipHeight(),
        getGlobalParams(),
      ]);
      return {
        // The staking parameters are retrieved based on the current height + 1
        // so this verification should take this into account.
        currentHeight: height,
        nextBlockParams: getCurrentGlobalParamsVersion(height + 1, versions),
      };
    },
    refetchInterval: 60000, // 1 minute
    // Should be enabled only when the wallet is connected
    enabled: !!btcWallet,
    retry: (failureCount: number) => {
      return failureCount <= 3;
    },
  });

  // Handles unbonding requests for Active delegations that want to be withdrawn early
  // It constructs an unbonding transaction, creates a signature for it, and submits both to the back-end API
  const handleUnbond = async (id: string) => {
    // Sign the unbonding transaction
    if (btcWallet && btcWalletNetwork) {
      try {
        const { delegation } = await signUnbondingTx(
          id,
          delegationsAPI,
          publicKeyNoCoord,
          btcWalletNetwork,
          signPsbtTransaction(btcWallet),
        );
        // Update the local state with the new intermediate delegation
        updateLocalStorage(delegation, DelegationState.INTERMEDIATE_UNBONDING);
      } catch (error: Error | any) {
        showDialog({
          title: getErrorTitle(ErrorState.UNBONDING),
          message: getErrorMessage(ErrorState.UNBONDING, error.message),
          buttonTitle: "retry",
          onButtonClick: () => handleModal(id, MODE_UNBOND),
        });
      } finally {
        setModalOpen(false);
        setTxID("");
        setModalMode(undefined);
      }
    }
  };

  // Handles withdrawing requests for delegations that have expired timelocks
  // It constructs a withdrawal transaction, creates a signature for it, and submits it to the Bitcoin network
  const handleWithdraw = async (id: string) => {
    const address = await btcWallet?.getAddress();

    if (
      !delegationsAPI ||
      !publicKeyNoCoord ||
      !btcWalletNetwork ||
      !paramWithContext?.nextBlockParams?.currentVersion ||
      !btcWallet ||
      !address
    ) {
      Error("Missing required data to handle unbonding");
    } else {
      try {
        // Sign the withdrawal transaction
        const { delegation } = await signWithdrawalTx(
          id,
          delegationsAPI,
          publicKeyNoCoord,
          btcWalletNetwork,
          signPsbtTransaction(btcWallet),
          address,
          btcWallet.getNetworkFees,
          btcWallet.pushTx,
        );
        // Update the local state with the new intermediate delegation
        updateLocalStorage(delegation, DelegationState.INTERMEDIATE_WITHDRAWAL);
      } catch (error: Error | any) {
        showDialog({
          title: getErrorTitle(ErrorState.WITHDRAW),
          message: getErrorMessage(ErrorState.WITHDRAW, error.message),
          buttonTitle: "retry",
          onButtonClick: function (): void {
            handleModal(id, MODE_WITHDRAW);
          },
        });
      } finally {
        setModalOpen(false);
        setTxID("");
        setModalMode(undefined);
        onRefresh();
      }
    }
  };

  const handleOnProceed = (mode: MODE) => {
    console.log("Proceeding with action", mode);
    if (mode === MODE_UNBOND) {
      handleUnbond(txID);
    } else if (mode === MODE_WITHDRAW) {
      handleWithdraw(txID);
    }
  };

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden lg:block pb-12">
        <Table.Root>
          <Table.Header className="[--table-row-box-shadow:none]">
            <Table.Row className="bg-yieldi-beige">
              <Table.ColumnHeaderCell className="p-4 uppercase tracking-wider self-stretch text-yieldi-brown-light text-xs font-light">
                OPENED ON
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="p-4 uppercase tracking-wider self-stretch text-yieldi-brown-light text-xs font-light">
                PROVIDER
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="p-4 uppercase tracking-wider self-stretch text-yieldi-brown-light text-xs font-light">
                AMOUNT
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="p-4 uppercase tracking-wider self-stretch text-yieldi-brown-light text-xs font-light">
                STATUS
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="p-4 uppercase tracking-wider self-stretch text-yieldi-brown-light text-xs font-light">
                ACTIONS
              </Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body className="space-y-1.5 bg-white border-b">
            {combinedDelegationsData?.map((delegation: any) => {
              const finalityProviderMoniker =
                finalityProvidersKV[delegation.finalityProviderPkHex];
              const intermediateDelegation =
                intermediateDelegationsLocalStorage.find(
                  (item) =>
                    item.stakingTxHashHex === delegation.stakingTxHashHex,
                );
              return (
                <>
                  <DelegationRow
                    key={delegation.stakingTxHashHex}
                    delegation={delegation}
                    finalityProviderMoniker={finalityProviderMoniker}
                    asset={asset}
                    screenType="table"
                    onUnbond={() =>
                      handleModal(delegation.stakingTxHashHex, MODE_UNBOND)
                    }
                    onWithdraw={() =>
                      handleModal(delegation.stakingTxHashHex, MODE_WITHDRAW)
                    }
                    intermediateState={intermediateDelegation?.state}
                    globalParamsVersion={
                      paramWithContext?.nextBlockParams?.currentVersion
                    }
                  />
                  <Table.Row
                    key={
                      delegation.startTimestamp + delegation.stakingTxHashHex
                    }
                    className="w-full h-[6px] border-none shadow-none"
                  ></Table.Row>
                </>
              );
            })}
          </Table.Body>
        </Table.Root>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden grid gap-4">
        {delegations?.delegations?.map((delegation: any) => {
          const finalityProviderMoniker =
            finalityProvidersKV[delegation.finalityProviderPkHex];
          const intermediateDelegation =
            intermediateDelegationsLocalStorage.find(
              (item) => item.stakingTxHashHex === delegation.stakingTxHashHex,
            );
          return (
            <DelegationRow
              key={delegation.stakingTxHashHex}
              delegation={delegation}
              finalityProviderMoniker={finalityProviderMoniker}
              asset={asset}
              screenType="card"
              onUnbond={() =>
                handleModal(delegation.stakingTxHashHex, MODE_UNBOND)
              }
              onWithdraw={() =>
                handleModal(delegation.stakingTxHashHex, MODE_WITHDRAW)
              }
              intermediateState={intermediateDelegation?.state}
              globalParamsVersion={
                paramWithContext?.nextBlockParams?.currentVersion
              }
            />
          );
        })}
      </div>

      {modalMode &&
      txID &&
      paramWithContext?.nextBlockParams?.currentVersion ? (
        <UnbondWithdrawModal
          unbondingTimeBlocks={
            paramWithContext?.nextBlockParams?.currentVersion?.unbondingTime
          }
          unbondingFeeSat={
            paramWithContext?.nextBlockParams?.currentVersion?.unbondingFeeSat
          }
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onProceed={() => {
            handleOnProceed(modalMode);
          }}
          mode={modalMode}
        />
      ) : null}
    </>
  );
};

export default Transactions;
