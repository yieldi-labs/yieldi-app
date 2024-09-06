import { Card, Table, Button } from "@radix-ui/themes";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useLocalStorage } from "usehooks-ts";

import { getGlobalParams } from "@/app/api/getGlobalParams";
import { useError } from "@/app/context/Error/ErrorContext";
import { useWallet } from "@/app/context/WalletContext";
import { getNetworkConfig } from "@/app/network.config";
import { Delegation, DelegationState } from "@/app/types/delegations";
import { ErrorState } from "@/app/types/errors";
import { satoshiToBtc } from "@/utils/btcConversions";
import { signUnbondingTx } from "@/utils/delegations/signUnbondingTx";
import { signWithdrawalTx } from "@/utils/delegations/signWithdrawalTx";
import { durationTillNow } from "@/utils/formatTime";
import { getCurrentGlobalParamsVersion } from "@/utils/globalParams";
import { getIntermediateDelegationsLocalStorageKey } from "@/utils/local_storage/getIntermediateDelegationsLocalStorageKey";
import { toLocalStorageIntermediateDelegation } from "@/utils/local_storage/toLocalStorageIntermediateDelegation";
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
}> = ({
  delegation,
  finalityProviderMoniker,
  asset,
  screenType,
  onUnbond,
  onWithdraw,
}) => {
  const { stakingValueSat, stakingTx, stakingTxHashHex, state } = delegation;
  const { startTimestamp } = stakingTx;
  const currentTime = Date.now();
  const { mempoolApiUrl } = getNetworkConfig();

  const generateActionButton = () => {
    if (state === "ACTIVE") {
      return (
        <Button variant="outline" className="self-center" onClick={onUnbond}>
          Unbond
        </Button>
      );
    } else if (state === "UNBONDED") {
      return (
        <Button variant="outline" className="self-center" onClick={onWithdraw}>
          Withdraw
        </Button>
      );
    }
    return null;
  };

  if (screenType === "table") {
    return (
      <Table.Row
        key={stakingTxHashHex}
        className="mb-2 items-start gap-4 border shadow-sm p-4"
      >
        <Table.Cell className="text-[#332B29] text-lg font-medium">
          {durationTillNow(startTimestamp, currentTime)}
        </Table.Cell>
        <Table.Cell className="text-[#6D655D] font-['GT_America_Mono_Trial'] text-sm font-normal">
          {finalityProviderMoniker}{" "}
          <a
            href={`${mempoolApiUrl}/tx/${stakingTxHashHex}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {trim(stakingTxHashHex)}
          </a>
        </Table.Cell>
        <Table.Cell className="text-[#332B29] text-lg font-normal">
          {`$${satoshiToBtc(stakingValueSat) * (asset?.price || 1)}`}
          <br />
          {`${satoshiToBtc(stakingValueSat)} ${asset?.assetSymbol}`}
        </Table.Cell>
        <Table.Cell className="text-[#332B29] text-lg font-normal">{`$0.00 PENDING`}</Table.Cell>
        <Table.Cell className="text-sm font-normal">
          <span
            className={`px-3 py-1 rounded-full ${state === "ACTIVE" ? "bg-green-500" : "bg-red-500"} text-white`}
          >
            {state}
          </span>
        </Table.Cell>
        <Table.Cell>{generateActionButton()}</Table.Cell>
      </Table.Row>
    );
  } else {
    return (
      <Card
        className="p-4 border rounded-none"
        key={delegation.finalityProviderPkHex}
      >
        <div className="grid grid-cols-2 justify-between border">
          <div className="border font-semibold">
            {finalityProviderMoniker}
            <p className="text-xs text-gray-500">{trim(stakingTxHashHex)}</p>
          </div>
          <div className="flex">
            <Button
              size="2"
              className={`${
                state === "ACTIVE"
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
              }}`}
            >
              {state}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 border">
          <div className="border rounded-none">
            <p className="font-semibold text-sm">Amount</p>
            {`$${satoshiToBtc(stakingValueSat) * (asset?.price || 1)}`}
            <br />
            {`${satoshiToBtc(stakingValueSat)} ${asset?.assetSymbol}`}{" "}
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
      </Card>
    );
  }
};

const Transactions: React.FC<{
  delegations: any;
  finalityProvidersKV: Record<string, string>;
  asset: any;
}> = ({ delegations, finalityProvidersKV, asset }) => {
  const { publicKeyNoCoord, btcWallet, btcWalletNetwork } = useWallet();
  const [modalOpen, setModalOpen] = useState(false);
  const [txID, setTxID] = useState("");
  const [modalMode, setModalMode] = useState<MODE>();
  const { showError } = useError();

  const handleModal = (txID: string, mode: MODE) => {
    setModalOpen(true);
    setTxID(txID);
    setModalMode(mode);
  };

  const delegationsAPI = delegations.delegations;

  const intermediateDelegationsLocalStorageKey =
    getIntermediateDelegationsLocalStorageKey(publicKeyNoCoord);

  const [_, setIntermediateDelegationsLocalStorage] = useLocalStorage<
    Delegation[]
  >(intermediateDelegationsLocalStorageKey, []);

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
    if (
      !delegationsAPI ||
      !publicKeyNoCoord ||
      !btcWalletNetwork ||
      !paramWithContext?.nextBlockParams?.currentVersion
    ) {
      Error("Missing required data to handle unbonding");
    } else {
      try {
        // Sign the unbonding transaction
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
        showError({
          error: {
            message: error.message,
            errorState: ErrorState.UNBONDING,
            errorTime: new Date(),
          },
          retryAction: () => handleModal(id, MODE_UNBOND),
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
        showError({
          error: {
            message: error.message,
            errorState: ErrorState.WITHDRAW,
            errorTime: new Date(),
          },
          retryAction: () => handleModal(id, MODE_WITHDRAW),
        });
      } finally {
        setModalOpen(false);
        setTxID("");
        setModalMode(undefined);
      }
    }
  };

  const handleOnProceed = (mode: MODE) => {
    if (mode === MODE_UNBOND) {
      handleUnbond(txID);
    } else if (mode === MODE_WITHDRAW) {
      handleWithdraw(txID);
    }
  };

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <Table.Root>
          <Table.Header className="[--table-row-box-shadow:none]">
            <Table.Row className="bg-[#F5F1EB]">
              <Table.ColumnHeaderCell className="px-6 py-3 uppercase tracking-wider text-[#6D655D] text-xs font-light">
                OPENED ON
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="px-6 py-3 uppercase tracking-wider text-[#6D655D] text-xs font-light">
                PROVIDER
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="px-6 py-3 uppercase tracking-wider text-[#6D655D] text-xs font-light">
                AMOUNT
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="px-6 py-3 uppercase tracking-wider text-[#6D655D] text-xs font-light">
                WITHDRAWAL BALANCE
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="px-6 py-3 uppercase tracking-wider text-[#6D655D] text-xs font-light">
                STATUS
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="px-6 py-3 uppercase tracking-wider text-[#6D655D] text-xs font-light">
                ACTIONS
              </Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body className="space-y-1.5">
            {delegations?.delegations?.map((delegation: any) => {
              const finalityProviderMoniker =
                finalityProvidersKV[delegation.finalityProviderPkHex];
              return (
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
                />
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
          return (
            <DelegationRow
              key={delegation.stakingTxHashHex}
              delegation={delegation}
              finalityProviderMoniker={finalityProviderMoniker}
              asset={asset}
              screenType="card"
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
