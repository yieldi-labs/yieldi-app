import { Button } from "@radix-ui/themes";

const StakeButton: React.FC<{
  isConnected: boolean;
  handleOnClick: any;
}> = ({ isConnected, handleOnClick }) => {
  return (
    <Button
      onClick={handleOnClick}
      className={`w-full bg-[#A1FD59] text-black rounded-none ${!isConnected ? "opacity-50 cursor-not-allowed" : ""}`}
      disabled={!isConnected}
    >
      STAKE
    </Button>
  );
};

export default StakeButton;
