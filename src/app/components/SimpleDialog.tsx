import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import React from "react";

interface SimpleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonTitle: string;
  onButtonClick: () => void;
}

const SimpleDialog: React.FC<SimpleDialogProps> = ({
  isOpen,
  onClose,
  title,
  message,
  buttonTitle,
  onButtonClick,
}) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
          border-2 border-[#DCD4C9] bg-yieldi-beige shadow-lg w-[90%] max-w-dialog text-[#332B29]"
        >
          <div className="flex justify-between items-center mb-4 border-b border-[#DCD4C9]">
            <Dialog.Title className="text-2xl font-bold text-[#332B29] p-2">
              {title}
            </Dialog.Title>
            <Dialog.Close className="text-[#332B29] border-x border-[#DCD4C9] p-2">
              <Cross2Icon width={36} height={36} />
            </Dialog.Close>
          </div>
          <div className="mb-6 p-4">{message}</div>
          <div className="flex justify-center px-2 pb-3">
            <button
              className="w-full py-4 px-2 bg-yieldi-green font-medium text-sm cursor-pointer border border-[#DCD4C9] uppercase"
              onClick={onButtonClick}
            >
              {buttonTitle}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default SimpleDialog;
