import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import React, { ReactNode } from "react";

interface SimpleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string | ReactNode;
  buttonTitle: string | null;
  onButtonClick: () => void | null;
}

const SimpleDialog: React.FC<Partial<SimpleDialogProps>> = ({
  isOpen,
  onClose,
  title,
  content,
  buttonTitle,
  onButtonClick,
}) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
           bg-yieldi-beige shadow-lg w-[90%] max-w-dialog text-yieldi-brown"
        >
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-2xl font-bold p-2 font-gt-america-ext">
              {title}
            </Dialog.Title>
            <Dialog.Close className="p-2">
              <Cross2Icon width={36} height={36} />
            </Dialog.Close>
          </div>
          <div className="mb-6 p-4">{content}</div>
          {buttonTitle ? (
            <div className="flex justify-center px-2 pb-3">
              <button
                className="w-full py-4 px-2 bg-yieldi-green font-medium text-sm cursor-pointer border border-yieldi-gray-200 uppercase"
                onClick={onButtonClick}
              >
                {buttonTitle}
              </button>
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default SimpleDialog;
