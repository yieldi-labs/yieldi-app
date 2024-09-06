import React, { createContext, useState, useContext, useCallback, useRef } from 'react';

import SimpleDialog from '../components/SimpleDialog';

interface DialogContent {
  title: string;
  message: string;
  buttonTitle: string;
  onButtonClick: () => void;
}

interface DialogContextType {
  showDialog: (content: DialogContent) => void;
  hideDialog: () => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dialogContentRef = useRef<DialogContent | null>(null);

  const showDialog = useCallback((content: DialogContent) => {
    dialogContentRef.current = content;
    setIsOpen(true);
  }, []);

  const hideDialog = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleButtonClick = useCallback(() => {
    if (dialogContentRef.current) {
      dialogContentRef.current.onButtonClick();
    }
    hideDialog();
  }, [hideDialog]);

  return (
    <DialogContext.Provider value={{ showDialog, hideDialog }}>
      {children}
      {dialogContentRef.current ? <SimpleDialog
          isOpen={isOpen}
          onClose={hideDialog}
          title={dialogContentRef.current.title}
          message={dialogContentRef.current.message}
          buttonTitle={dialogContentRef.current.buttonTitle}
          onButtonClick={handleButtonClick}
        /> : null}
    </DialogContext.Provider>
  );
};

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (context === undefined) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};