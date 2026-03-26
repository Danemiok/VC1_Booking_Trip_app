import React, { createContext, useContext, ReactNode } from 'react';
import { HelpCenter } from './HelpCenter';
import { useHelpCenter } from '../../hooks/useHelpCenter';

interface HelpCenterContextType {
  isOpen: boolean;
  openHelpCenter: () => void;
  closeHelpCenter: () => void;
  toggleHelpCenter: () => void;
}

const HelpCenterContext = createContext<HelpCenterContextType | undefined>(undefined);

export const useHelpCenterContext = () => {
  const context = useContext(HelpCenterContext);
  if (!context) {
    throw new Error('useHelpCenterContext must be used within HelpCenterProvider');
  }
  return context;
};

interface HelpCenterProviderProps {
  children: ReactNode;
}

export const HelpCenterProvider: React.FC<HelpCenterProviderProps> = ({ children }) => {
  const { isOpen, openHelpCenter, closeHelpCenter, toggleHelpCenter } = useHelpCenter();

  console.log('🔍 HelpCenterProvider rendered, isOpen:', isOpen);

  return (
    <HelpCenterContext.Provider value={{ isOpen, openHelpCenter, closeHelpCenter, toggleHelpCenter }}>
      {children}
      <HelpCenter isOpen={isOpen} onClose={closeHelpCenter} />
    </HelpCenterContext.Provider>
  );
};
