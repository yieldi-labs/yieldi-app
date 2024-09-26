import { getNetworkConfig } from "@/app/config/network";
import { blocksToDisplayTime } from "@/utils/blocksToDisplayTime";
import { satoshiToBtc } from "@/utils/btcConversions";
import { maxDecimals } from "@/utils/maxDecimals";

import SimpleDialog from "../SimpleDialog";

export const MODE_UNBOND = "unbond";
export const MODE_WITHDRAW = "withdraw";
export type MODE = typeof MODE_UNBOND | typeof MODE_WITHDRAW;

interface PreviewModalProps {
  unbondingTimeBlocks: number;
  unbondingFeeSat: number;
  open: boolean;
  onClose: (value: boolean) => void;
  onProceed: () => void;
  mode: MODE;
}

export const UnbondWithdrawModal: React.FC<PreviewModalProps> = ({
  unbondingTimeBlocks,
  unbondingFeeSat,
  open,
  onClose,
  onProceed,
  mode,
}) => {
  const { coinName, networkName } = getNetworkConfig();

  const unbondTitle = "Unbond";

  const unbondContent = (
    <>
      You are about to unbond your stake before its expiration. <br />A
      transaction fee of{" "}
      <strong>
        {maxDecimals(satoshiToBtc(unbondingFeeSat), 8) || 0} {coinName}
      </strong>{" "}
      will be deduced from your stake by the {networkName} network. <br />
      The expected unbonding time will be about{" "}
      <strong>{blocksToDisplayTime(unbondingTimeBlocks)}</strong>. <br />
      After unbonded, you will need to use this dashboard to withdraw your stake
      for it to appear in your wallet.
    </>
  );

  const withdrawTitle = "Withdraw";
  const withdrawContent = (
    <>
      You are about to withdraw your stake. <br />A transaction fee will be
      deduced from your stake by the {networkName} network
    </>
  );

  const title = mode === MODE_UNBOND ? unbondTitle : withdrawTitle;
  const content = mode === MODE_UNBOND ? unbondContent : withdrawContent;

  const unbondWithdrawModalContent = (
    <div className="flex flex-col gap-4">
      <p className="text-left dark:text-neutral-content">{content}</p>
      <div className="flex gap-4">
        <button
          className="btn btn-outline flex-1"
          onClick={() => {
            onClose(false);
          }}
        >
          Cancel
        </button>
        <button
          className="btn-primary btn flex-1"
          onClick={() => {
            onClose(false);
            onProceed();
          }}
        >
          Proceed
        </button>
      </div>
    </div>
  );

  return (
    <SimpleDialog
      isOpen={open}
      onClose={() => {
        onClose(false);
      }}
      title={title}
      content={unbondWithdrawModalContent}
    />
  );
};
