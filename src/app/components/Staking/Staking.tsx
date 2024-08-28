import * as Form from "@radix-ui/react-form";
import { Flex, Link } from "@radix-ui/themes";
import { useQuery } from "@tanstack/react-query";
import { Transaction, networks } from "bitcoinjs-lib";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { Tooltip } from "react-tooltip";
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

// import { FinalityProviders } from "./FinalityProviders/FinalityProviders";
import { StakingAmount } from "./Form/StakingAmount";
import { StakingFee } from "./Form/StakingFee";
import { StakingTime } from "./Form/StakingTime";
import { Message } from "./Form/States/Message";
import { WalletNotConnected } from "./Form/States/WalletNotConnected";
import stakingCapReached from "./Form/States/staking-cap-reached.svg";
import stakingNotStarted from "./Form/States/staking-not-started.svg";
import stakingUpgrading from "./Form/States/staking-upgrading.svg";

interface OverflowProperties {
  isHeightCap: boolean;
  overTheCapRange: boolean;
  approchingCapRange: boolean;
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
}) => {
  // Staking form state
  const [stakingAmountSat, setStakingAmountSat] = useState(0);
  const [stakingTimeBlocks, setStakingTimeBlocks] = useState(0);
  // Selected fee rate, comes from the user input
  const [selectedFeeRate, setSelectedFeeRate] = useState(0);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [resetFormInputs] = useState(false);
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
    approchingCapRange: false,
  });

  const finalityProvider = selectedFinalityProvider;
  const router = useRouter();

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
        approchingCapRange:
          nextBlockHeight >=
          stakingCapHeight - OVERFLOW_HEIGHT_WARNING_THRESHOLD,
      });
    } else if (stakingCapSat && stakingStats.data) {
      const { activeTVLSat, unconfirmedTVLSat } = stakingStats.data;
      setOverflow({
        isHeightCap: false,
        overTheCapRange: stakingCapSat <= activeTVLSat,
        approchingCapRange:
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
      router.push("/stake/btc");
    } catch (error: Error | any) {
      showError({
        error: {
          message: error.message,
          errorState: ErrorState.STAKING,
          errorTime: new Date(),
        },
        retryAction: handleSign,
      });
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

  const handlePreviewModalClose = (isOpen: boolean) => {
    setPreviewModalOpen(isOpen);
    handleFeedbackModal("cancel");
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
    if (!overflow.approchingCapRange) {
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

  const renderStakingForm = () => {
    // States of the staking form:
    // 1. Wallet is not connected
    if (!isWalletConnected) {
      return <WalletNotConnected onConnect={onConnect} />;
    }
    // 2. Wallet is connected but we are still loading the staking params
    // else if (isLoading) {
    // return <LoadingView />;
    // }
    // 3. Staking has not started yet
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
    // 4. Staking params upgrading
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
    // 5. Staking cap reached
    else if (overflow.overTheCapRange) {
      return showOverflowWarning(overflow);
    }
    // 6. Staking form
    else if (stakingParams) {
      const {
        minStakingAmountSat,
        maxStakingAmountSat,
        minStakingTimeBlocks,
        maxStakingTimeBlocks,
        unbondingTime,
        confirmationDepth,
      } = stakingParams;

      // Staking time is fixed
      const stakingTimeFixed = minStakingTimeBlocks === maxStakingTimeBlocks;

      // Takes into account the fixed staking time
      const stakingTimeBlocksWithFixed = stakingTimeFixed
        ? minStakingTimeBlocks
        : stakingTimeBlocks;

      // Check if the staking transaction is ready to be signed
      const { isReady: signReady, reason: signNotReadyReason } =
        isStakingSignReady(
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
          <Form.Root
            onSubmit={(e: React.FormEvent) => {
              e.preventDefault();
            }}
            className="flex flex-1 flex-col border-gray-800 border bg-gray-100 
            min-w-[368px] md:min-w-[472px] md:py-[42px] py-[24px] md:px-[8px] px-[4px]"
          >
            <div className="flex flex-1 flex-col">
              <Flex direction="column" className="w-full bg-gray-100 mb-5">
                <h3 className="text-xs font-medium mb-2 pl-2">
                  FINALITY PROVIDER
                </h3>
                <Form.Field
                  name="finality-provider"
                  className="w-full bg-gray-200 lg:py-3 px-1 lg:px-2"
                >
                  <Flex justify="between" align="center">
                    <span>{finalityProvider?.description.moniker}</span>
                    <Link
                      href="#"
                      onClick={() => {
                        router.push("/stake/btc");
                      }}
                      className="text-black text-sm underline decoration-black"
                    >
                      Change
                    </Link>
                  </Flex>
                </Form.Field>
              </Flex>
              <StakingTime
                minStakingTimeBlocks={minStakingTimeBlocks}
                maxStakingTimeBlocks={maxStakingTimeBlocks}
                unbondingTimeBlocks={stakingParams.unbondingTime}
                onStakingTimeBlocksChange={handleStakingTimeBlocksChange}
                reset={resetFormInputs}
              />
              <StakingAmount
                minStakingAmountSat={minStakingAmountSat}
                maxStakingAmountSat={maxStakingAmountSat}
                btcWalletBalanceSat={btcWalletBalanceSat}
                onStakingAmountSatChange={handleStakingAmountSatChange}
                reset={resetFormInputs}
              />
              <StakingFee
                mempoolFeeRates={mempoolFeeRates}
                stakingFeeSat={stakingFeeSat}
                selectedFeeRate={selectedFeeRate}
                onSelectedFeeRateChange={setSelectedFeeRate}
                reset={resetFormInputs}
              />
            </div>
            {showApproachingCapWarning()}
            <div
              className="cursor-pointer text-xs flex justify-center"
              data-tooltip-id="tooltip-staking-preview"
              data-tooltip-content={signNotReadyReason}
              data-tooltip-place="top"
            >
              <button
                className="btn-primary btn mt-2 l:w-[340px] w-[260px] l:h-11 h-9 bg-blue-400 font-medium"
                type="button"
                disabled={!previewReady}
                onClick={() => {
                  setPreviewModalOpen(true);
                }}
              >
                Stake
              </button>
              <Tooltip id="tooltip-staking-preview" />
            </div>
            {previewReady ? (
              <PreviewModal
                open={previewModalOpen}
                onClose={handlePreviewModalClose}
                onSign={handleSign}
                finalityProvider={finalityProvider?.description.moniker}
                stakingAmountSat={stakingAmountSat}
                stakingTimeBlocks={stakingTimeBlocksWithFixed}
                stakingFeeSat={stakingFeeSat}
                confirmationDepth={confirmationDepth}
                feeRate={feeRate}
                unbondingTimeBlocks={unbondingTime}
              />
            ) : null}
          </Form.Root>
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
    <div className="card flex flex-col gap-2 bg-base-300 p-4 shadow-sm items-center">
      <div className="flex flex-row px-4 py-2 sm:px-6 md:px-8 items-center w-[320px] md:w-[500px] mb-2">
        <div
          className="flex items-center cursor-pointer"
          onClick={() => {
            router.push("/stake/btc");
          }}
        >
          <svg
            className="size-3 sm:size-4"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6.85355 3.14645C7.04882 3.34171 7.04882 3.65829 6.85355 3.85355L3.70711 7H12.5C12.7761 7 13 7.22386 13 7.5C13 7.77614 12.7761 8 12.5 8H3.70711L6.85355 11.1464C7.04882 11.3417 7.04882 11.6583 6.85355 11.8536C6.65829 12.0488 6.34171 12.0488 6.14645 11.8536L2.14645 7.85355C1.95118 7.65829 1.95118 7.34171 2.14645 7.14645L6.14645 3.14645C6.34171 2.95118 6.65829 2.95118 6.85355 3.14645Z"
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
            />
          </svg>
          <button className="btn btn-ghost btn-sm ml-1 sm:ml-2 text-xs sm:text-sm">
            Back
          </button>
        </div>
        <h3 className="font-bold text-sm sm:text-base md:text-lg absolute left-1/2 -translate-x-1/2">
          Stake
        </h3>
      </div>
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="divider m-0 lg:divider-horizontal lg:m-0" />
        <div className="flex flex-1 flex-col gap-4 lg:basis-2/5 xl:basis-1/3">
          {renderStakingForm()}
        </div>
      </div>
      <FeedbackModal
        open={feedbackModal.isOpen}
        onClose={handleCloseFeedbackModal}
        type={feedbackModal.type}
      />
    </div>
  );
};
