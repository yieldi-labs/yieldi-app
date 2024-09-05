import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { useQuery } from "@tanstack/react-query";
import { Transaction, networks } from "bitcoinjs-lib";
import { set } from "date-fns";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "usehooks-ts";

import {
  OVERFLOW_HEIGHT_WARNING_THRESHOLD,
  OVERFLOW_TVL_WARNING_THRESHOLD,
} from "@/app/common/constants";
import { FeedbackModal } from "@/app/components/Modals/FeedbackModal";
import { PreviewModal } from "@/app/components/Modals/PreviewModal";
import { useError } from "@/app/context/Error/ErrorContext";
import { useGlobalParams } from "@/app/context/api/GlobalParamsProvider";
import { useStakingStats } from "@/app/context/api/StakingStatsProvider";
import { Delegation } from "@/app/types/delegations";
import { ErrorHandlerParam, ErrorState } from "@/app/types/errors";
import { FinalityProvider as FinalityProviderInterface } from "@/app/types/finalityProviders";
import { getNetworkConfig } from "@/config/network.config";
import {
  createStakingTx,
  signStakingTx,
} from "@/utils/delegations/signStakingTx";
import { getFeeRateFromMempool } from "@/utils/getFeeRateFromMempool";
import {
  ParamsWithContext,
  getCurrentGlobalParamsVersion,
} from "@/utils/globalParams";
import { isStakingSignReady } from "@/utils/isStakingSignReady";
import { toLocalStorageDelegation } from "@/utils/local_storage/toLocalStorageDelegation";
import { WalletProvider } from "@/utils/wallet/wallet_provider";
import wBtcIcon from "@public/icons/wbtc.svg";

import { StakingAmount } from "./Dialog/StakingAmount";
import { StakingFee } from "./Dialog/StakingFee";
import { StakingTime } from "./Dialog/StakingTime";
import { Message } from "./Dialog/States/Message";
import { WalletNotConnected } from "./Dialog/States/WalletNotConnected";
import stakingCapReached from "./Dialog/States/staking-cap-reached.svg";
import stakingNotStarted from "./Dialog/States/staking-not-started.svg";
import stakingUpgrading from "./Dialog/States/staking-upgrading.svg";

interface OverflowProperties {
  isHeightCap: boolean;
  overTheCapRange: boolean;
  approachingCapRange: boolean;
}

export interface StakingProps {
  btcHeight: number | undefined;
  isWalletConnected: boolean;
  onConnect: () => void;
  selectedFinalityProvider: FinalityProviderInterface | undefined;
  btcWallet: WalletProvider | undefined;
  btcWalletBalanceSat: number;
  btcWalletNetwork: networks.Network | undefined;
  address: string | undefined;
  publicKeyNoCoord: string;
  setDelegationsLocalStorage: Dispatch<SetStateAction<Delegation[]>>;
  isOpen: boolean;
  onCloseDialog: () => void;
}

export const Staking: React.FC<StakingProps> = ({
  btcHeight,
  isWalletConnected,
  onConnect,
  btcWallet,
  btcWalletNetwork,
  address,
  publicKeyNoCoord,
  setDelegationsLocalStorage,
  selectedFinalityProvider,
  btcWalletBalanceSat,
  isOpen,
  onCloseDialog,
}) => {
  // Staking form state
  const [stakingAmountSat, setStakingAmountSat] = useState(0);
  const [stakingTimeBlocks, setStakingTimeBlocks] = useState(150);
  // Selected fee rate, comes from the user input
  const [selectedFeeRate, setSelectedFeeRate] = useState(0);
  const [resetFormInputs, setResetFormInputs] = useState(0);
  const [feedbackModal, setFeedbackModal] = useState<{
    type: "success" | "cancel" | null;
    isOpen: boolean;
  }>({ type: null, isOpen: false });
  const [successFeedbackModalOpened, setSuccessFeedbackModalOpened] =
    useLocalStorage<boolean>("bbn-staking-successFeedbackModalOpened", false);
  const [cancelFeedbackModalOpened, setCancelFeedbackModalOpened] =
    useLocalStorage<boolean>("bbn-staking-cancelFeedbackModalOpened ", false);
  const [paramWithCtx, setParamWithCtx] = useState<
    ParamsWithContext | undefined
  >();
  const [overflow, setOverflow] = useState<OverflowProperties>({
    isHeightCap: false,
    overTheCapRange: false,
    approachingCapRange: false,
  });

  const finalityProvider = selectedFinalityProvider;
  const router = useRouter();
  const handleOnClose = () => {
    setStakingAmountSat(0);
    setSelectedFeeRate(0);
    setResetFormInputs(Number.MAX_SAFE_INTEGER);
    onCloseDialog();
  }

  // Mempool fee rates, comes from the network
  // Fetch fee rates, sat/vB
  const {
    data: mempoolFeeRates,
    error: mempoolFeeRatesError,
    isError: hasMempoolFeeRatesError,
    refetch: refetchMempoolFeeRates,
  } = useQuery({
    queryKey: ["mempool fee rates"],
    queryFn: async () => {
      if (btcWallet?.getNetworkFees) {
        return await btcWallet.getNetworkFees();
      }
    },
    enabled: !!btcWallet?.getNetworkFees,
    refetchInterval: 60000, // 1 minute
    retry: (failureCount) => {
      return !isErrorOpen && failureCount <= 3;
    },
  });

  // Fetch all UTXOs
  const {
    data: availableUTXOs,
    error: availableUTXOsError,
    isError: hasAvailableUTXOsError,
    refetch: refetchAvailableUTXOs,
  } = useQuery({
    queryKey: ["available UTXOs", address],
    queryFn: async () => {
      if (btcWallet?.getUtxos && address) {
        return await btcWallet.getUtxos(address);
      }
    },
    enabled: !!(btcWallet?.getUtxos && address),
    refetchInterval: 60000 * 5, // 5 minutes
    retry: (failureCount) => {
      return !isErrorOpen && failureCount <= 3;
    },
  });

  const stakingStats = useStakingStats();
  const [signing, setSigning] = useState(false);

  // load global params and calculate the current staking params
  const globalParams = useGlobalParams();
  useMemo(() => {
    if (!btcHeight || !globalParams.data) {
      return;
    }
    const paramCtx = getCurrentGlobalParamsVersion(
      btcHeight + 1,
      globalParams.data,
    );
    setParamWithCtx(paramCtx);
  }, [btcHeight, globalParams]);

  // Calculate the overflow properties
  useMemo(() => {
    if (!paramWithCtx || !paramWithCtx.currentVersion || !btcHeight) {
      return;
    }
    const nextBlockHeight = btcHeight + 1;
    const { stakingCapHeight, stakingCapSat, confirmationDepth } =
      paramWithCtx.currentVersion;
    // Use height based cap than value based cap if it is set
    if (stakingCapHeight) {
      setOverflow({
        isHeightCap: true,
        overTheCapRange:
          nextBlockHeight >= stakingCapHeight + confirmationDepth,
        /*
          When btc height is approching the staking cap height,
          there is higher chance of overflow due to tx not being included in the next few blocks on time
          We also don't take the confirmation depth into account here as majority
          of the delegation will be overflow after the cap is reached, unless btc fork happens but it's unlikely
        */
        approachingCapRange:
          nextBlockHeight >=
          stakingCapHeight - OVERFLOW_HEIGHT_WARNING_THRESHOLD,
      });
    } else if (stakingCapSat && stakingStats.data) {
      const { activeTVLSat, unconfirmedTVLSat } = stakingStats.data;
      setOverflow({
        isHeightCap: false,
        overTheCapRange: stakingCapSat <= activeTVLSat,
        approachingCapRange:
          stakingCapSat * OVERFLOW_TVL_WARNING_THRESHOLD < unconfirmedTVLSat,
      });
    }
  }, [paramWithCtx, btcHeight, stakingStats]);

  const { coinName } = getNetworkConfig();
  const stakingParams = paramWithCtx?.currentVersion;
  const firstActivationHeight = paramWithCtx?.firstActivationHeight;
  const isUpgrading = paramWithCtx?.isApprochingNextVersion;
  const isBlockHeightUnderActivation =
    !stakingParams ||
    (btcHeight &&
      firstActivationHeight &&
      btcHeight + 1 < firstActivationHeight);

  const { isErrorOpen, showError } = useError();

  useEffect(() => {
    if (resetFormInputs === Number.MAX_SAFE_INTEGER) {
      setResetFormInputs(0);
    }
  }, [resetFormInputs]);

  useEffect(() => {
    const handleError = ({
      error,
      hasError,
      errorState,
      refetchFunction,
    }: ErrorHandlerParam) => {
      if (hasError && error) {
        showError({
          error: {
            message: error.message,
            errorState,
            errorTime: new Date(),
          },
          retryAction: refetchFunction,
        });
      }
    };

    handleError({
      error: mempoolFeeRatesError,
      hasError: hasMempoolFeeRatesError,
      errorState: ErrorState.SERVER_ERROR,
      refetchFunction: refetchMempoolFeeRates,
    });
    handleError({
      error: availableUTXOsError,
      hasError: hasAvailableUTXOsError,
      errorState: ErrorState.SERVER_ERROR,
      refetchFunction: refetchAvailableUTXOs,
    });
  }, [
    availableUTXOsError,
    mempoolFeeRatesError,
    hasMempoolFeeRatesError,
    hasAvailableUTXOsError,
    refetchMempoolFeeRates,
    refetchAvailableUTXOs,
    showError,
  ]);

  const { minFeeRate, defaultFeeRate } = getFeeRateFromMempool(mempoolFeeRates);

  // Either use the selected fee rate or the fastest fee rate
  const feeRate = selectedFeeRate || defaultFeeRate;

  const handleSign = async () => {
    try {
      setSigning(true);
      // Initial validation
      if (!btcWallet) throw new Error("Wallet is not connected");
      if (!address) throw new Error("Address is not set");
      if (!btcWalletNetwork) throw new Error("Wallet network is not connected");
      if (!finalityProvider)
        throw new Error("Finality provider is not selected");
      if (!paramWithCtx || !paramWithCtx.currentVersion)
        throw new Error("Global params not loaded");
      if (!feeRate) throw new Error("Fee rates not loaded");
      if (!availableUTXOs || availableUTXOs.length === 0)
        throw new Error("No available balance");

      const { currentVersion: globalParamsVersion } = paramWithCtx;
      // Sign the staking transaction
      const { stakingTxHex, stakingTerm } = await signStakingTx(
        btcWallet,
        globalParamsVersion,
        stakingAmountSat,
        stakingTimeBlocks,
        finalityProvider.btcPk,
        btcWalletNetwork,
        address,
        publicKeyNoCoord,
        feeRate,
        availableUTXOs,
      );
      // UI
      handleFeedbackModal("success");
      handleLocalStorageDelegations(stakingTxHex, stakingTerm);
      setSigning(false);
    } catch (error: Error | any) {
      showError({
        error: {
          message: error.message,
          errorState: ErrorState.STAKING,
          errorTime: new Date(),
        },
        retryAction: handleSign,
      });
    } finally {
      handleOnClose();
      setSigning(false);
    }
  };

  // Save the delegation to local storage
  const handleLocalStorageDelegations = (
    signedTxHex: string,
    stakingTerm: number,
  ) => {
    setDelegationsLocalStorage((delegations) => [
      toLocalStorageDelegation(
        Transaction.fromHex(signedTxHex).getId(),
        publicKeyNoCoord,
        finalityProvider!.btcPk,
        stakingAmountSat,
        signedTxHex,
        stakingTerm,
      ),
      ...delegations,
    ]);
  };

  // Memoize the staking fee calculation
  const stakingFeeSat = useMemo(() => {
    if (
      btcWalletNetwork &&
      address &&
      publicKeyNoCoord &&
      stakingAmountSat &&
      finalityProvider &&
      paramWithCtx?.currentVersion &&
      mempoolFeeRates &&
      availableUTXOs
    ) {
      try {
        // check that selected Fee rate (if present) is bigger than the min fee
        if (selectedFeeRate && selectedFeeRate < minFeeRate) {
          throw new Error("Selected fee rate is lower than the hour fee");
        }
        const memoizedFeeRate = selectedFeeRate || defaultFeeRate;
        // Calculate the staking fee
        const { stakingFeeSat } = createStakingTx(
          paramWithCtx.currentVersion,
          stakingAmountSat,
          stakingTimeBlocks,
          finalityProvider.btcPk,
          btcWalletNetwork,
          address,
          publicKeyNoCoord,
          memoizedFeeRate,
          availableUTXOs,
        );
        return stakingFeeSat;
      } catch (error: Error | any) {
        // fees + staking amount can be more than the balance
        showError({
          error: {
            message: error.message,
            errorState: ErrorState.STAKING,
            errorTime: new Date(),
          },
          retryAction: () => setSelectedFeeRate(0),
        });
        setSelectedFeeRate(0);
        return 0;
      }
    } else {
      return 0;
    }
  }, [
    btcWalletNetwork,
    address,
    publicKeyNoCoord,
    stakingAmountSat,
    stakingTimeBlocks,
    finalityProvider,
    paramWithCtx,
    mempoolFeeRates,
    selectedFeeRate,
    availableUTXOs,
    showError,
    defaultFeeRate,
    minFeeRate,
  ]);

  const handleStakingAmountSatChange = (inputAmountSat: number) => {
    setStakingAmountSat(inputAmountSat);
  };

  const handleStakingTimeBlocksChange = (inputTimeBlocks: number) => {
    setStakingTimeBlocks(inputTimeBlocks);
  };

  // Show feedback modal only once for each type
  const handleFeedbackModal = (type: "success" | "cancel") => {
    if (!feedbackModal.isOpen && feedbackModal.type !== type) {
      const isFeedbackModalOpened =
        type === "success"
          ? successFeedbackModalOpened
          : cancelFeedbackModalOpened;
      if (!isFeedbackModalOpened) {
        setFeedbackModal({ type, isOpen: true });
      }
    }
  };

  const showOverflowWarning = (overflow: OverflowProperties) => {
    if (overflow.isHeightCap) {
      return (
        <Message
          title="Staking window closed"
          messages={[
            "Staking is temporarily disabled due to the staking window being closed.",
            "Please check your staking history to see if any of your stake is tagged overflow.",
            "Overflow stake should be unbonded and withdrawn.",
          ]}
          icon={stakingCapReached}
        />
      );
    } else {
      return (
        <Message
          title="Staking cap reached"
          messages={[
            "Staking is temporarily disabled due to the staking cap getting reached.",
            "Please check your staking history to see if any of your stake is tagged overflow.",
            "Overflow stake should be unbonded and withdrawn.",
          ]}
          icon={stakingCapReached}
        />
      );
    }
  };

  const handleCloseFeedbackModal = () => {
    if (feedbackModal.type === "success") {
      setSuccessFeedbackModalOpened(true);
    } else if (feedbackModal.type === "cancel") {
      setCancelFeedbackModalOpened(true);
    }
    setFeedbackModal({ type: null, isOpen: false });
  };

  const showApproachingCapWarning = () => {
    if (!overflow.approachingCapRange) {
      return;
    }
    if (overflow.isHeightCap) {
      return (
        <p className="text-center text-sm text-error">
          Staking window is closing. Your stake may <b>overflow</b>!
        </p>
      );
    }
    return (
      <p className="text-center text-sm text-error">
        Staking cap is filling up. Your stake may <b>overflow</b>!
      </p>
    );
  };

  const renderDialogContent = () => {
    // States of the staking form:
    // 1. Wallet is not connected
    if (!isWalletConnected) {
      return <WalletNotConnected onConnect={() => {onConnect(); handleOnClose(); }} />;
    }
    // 2. Staking has not started yet
    else if (isBlockHeightUnderActivation) {
      return (
        <Message
          title="Staking has not yet started"
          messages={[
            `Staking will be activated once ${coinName} block height passes ${firstActivationHeight ? firstActivationHeight - 1 : "-"}. The current ${coinName} block height is ${btcHeight || "-"}.`,
          ]}
          icon={stakingNotStarted}
        />
      );
    }
    // 3. Staking params upgrading
    else if (isUpgrading) {
      return (
        <Message
          title="Staking parameters upgrading"
          messages={[
            "The staking parameters are getting upgraded, staking will be re-enabled soon.",
          ]}
          icon={stakingUpgrading}
        />
      );
    }
    // 4. Staking cap reached
    else if (overflow.overTheCapRange) {
      return showOverflowWarning(overflow);
    }
    // 5. Staking form
    else if (stakingParams) {
      const {
        minStakingAmountSat,
        maxStakingAmountSat,
        minStakingTimeBlocks,
        maxStakingTimeBlocks,
        unbondingTime,
      } = stakingParams;

      // Staking time is fixed
      const stakingTimeFixed = minStakingTimeBlocks === maxStakingTimeBlocks;

      // Takes into account the fixed staking time
      const stakingTimeBlocksWithFixed = stakingTimeFixed
        ? minStakingTimeBlocks
        : stakingTimeBlocks;

      // Check if the staking transaction is ready to be signed
      const { isReady: signReady } = isStakingSignReady(
        minStakingAmountSat,
        maxStakingAmountSat,
        minStakingTimeBlocks,
        maxStakingTimeBlocks,
        stakingAmountSat,
        stakingTimeBlocksWithFixed,
        !!finalityProvider,
      );

      const previewReady =
        signReady && feeRate && availableUTXOs && stakingAmountSat;

      return (
        <>
          <div className="flex items-center mb-4 bg-gray-50 p-3 border border-gray-200">
            <div className="mr-3">
              <Image src={wBtcIcon} alt="WBTC" width={65} height={65} />
            </div>
            <div>
              <div className="font-bold">BTC</div>
              <div className="text-sm text-gray-500">Native Bitcoin</div>
            </div>
          </div>

          <div className="mb-4 bg-gray-50 p-3 border border-gray-200">
            <div className="text-sm text-gray-500 mb-1">Delegate</div>
            <div className="font-bold">
              {finalityProvider?.description.moniker}
            </div>
          </div>

          <StakingAmount
            minStakingAmountSat={minStakingAmountSat}
            maxStakingAmountSat={maxStakingAmountSat}
            btcWalletBalanceSat={btcWalletBalanceSat}
            onStakingAmountSatChange={handleStakingAmountSatChange}
            reset={resetFormInputs}
          />

          <StakingTime
            minStakingTimeBlocks={minStakingTimeBlocks}
            maxStakingTimeBlocks={maxStakingTimeBlocks}
            unbondingTimeBlocks={unbondingTime}
            onStakingTimeBlocksChange={handleStakingTimeBlocksChange}
            reset={resetFormInputs}
          />
          
          <StakingFee
            mempoolFeeRates={mempoolFeeRates}
            stakingFeeSat={stakingFeeSat}
            selectedFeeRate={selectedFeeRate}
            onSelectedFeeRateChange={setSelectedFeeRate}
            reset={resetFormInputs}
          />

          <button
            className="w-full bg-green-400 text-white py-3 font-bold hover:bg-green-500 transition duration-300"
            onClick={() => {
              handleSign();
            }}
            disabled={!previewReady || signing}
          >
            { signing ? "Signing Transaction" : "DELEGATE STAKE" }
          </button>

          {showApproachingCapWarning()}
        </>
      );
    } else {
      return (
        <Message
          title="Staking parameters not loaded"
          messages={[
            "The staking parameters are not loaded yet. Please try again later.",
          ]}
          icon={stakingNotStarted}
        />
      );
    }
  };

  return (
    <>
      <Dialog.Root open={isOpen} onOpenChange={(open) => { if (!open) { handleOnClose() }}}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-4 shadow-lg max-w-sm w-full border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-xl font-bold">
                Deposit Stake
              </Dialog.Title>
              <Dialog.Close className="text-gray-500 hover:text-gray-700">
                <Cross2Icon />
              </Dialog.Close>
            </div>
            {renderDialogContent()}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
     
      <FeedbackModal
        open={feedbackModal.isOpen}
        onClose={handleCloseFeedbackModal}
        type={feedbackModal.type}
      />
    </>
  );
};
