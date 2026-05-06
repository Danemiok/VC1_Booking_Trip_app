import React, { createContext, useContext } from 'react';
import { HelpCenter } from './HelpCenter';
import { useHelpCenter } from '../../hooks/useHelpCenter';
const HelpCenterContext = createContext(undefined);
export const useHelpCenterContext = () => {
    const context = useContext(HelpCenterContext);
    if (!context) {
        throw new Error('useHelpCenterContext must be used within HelpCenterProvider');
    }
    return context;
};
export const HelpCenterProvider = ({ children }) => {
    const { isOpen, openHelpCenter, closeHelpCenter, toggleHelpCenter } = useHelpCenter();
    console.log('🔍 HelpCenterProvider rendered, isOpen:', isOpen);
    return (<HelpCenterContext.Provider value={{ isOpen, openHelpCenter, closeHelpCenter, toggleHelpCenter }}>
      {children}
      <HelpCenter isOpen={isOpen} onClose={closeHelpCenter}/>
    </HelpCenterContext.Provider>);
};
