import React from 'react';
import { HelpButton, HelpCenterProvider, useHelpCenterContext } from './index';
const TestContent = () => {
    const { isOpen, openHelpCenter, closeHelpCenter } = useHelpCenterContext();
    return (<div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Help Center Test</h1>
      
      <div className="space-y-4">
        <p>Help Center Status: {isOpen ? 'OPEN' : 'CLOSED'}</p>
        
        <div className="flex gap-4">
          <button onClick={openHelpCenter} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Open Help Center
          </button>
          
          <button onClick={closeHelpCenter} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
            Close Help Center
          </button>
        </div>
        
        <div className="space-y-2">
          <p>Button Variants:</p>
          <HelpButton onClick={openHelpCenter} variant="floating" size="sm"/>
          <HelpButton onClick={openHelpCenter} variant="floating" size="md"/>
          <HelpButton onClick={openHelpCenter} variant="floating" size="lg"/>
          <HelpButton onClick={openHelpCenter} variant="inline" size="sm"/>
          <HelpButton onClick={openHelpCenter} variant="inline" size="md"/>
          <HelpButton onClick={openHelpCenter} variant="inline" size="lg"/>
        </div>
      </div>
    </div>);
};
export const HelpTest = () => {
    return (<HelpCenterProvider>
      <TestContent />
    </HelpCenterProvider>);
};
