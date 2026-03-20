import React from 'react';
import { HelpButton, HelpCenterProvider, useHelpCenterContext } from '../help';

interface HelpCenterLayoutProps {
  children: React.ReactNode;
  showFloatingButton?: boolean;
}

const HelpCenterLayoutContent: React.FC<HelpCenterLayoutProps> = ({ 
  children, 
  showFloatingButton = true 
}) => {
  const { openHelpCenter } = useHelpCenterContext();

  console.log('🔍 HelpCenterLayout rendered, showFloatingButton:', showFloatingButton);

  const handleHelpClick = () => {
    console.log('🔍 Help button clicked!');
    openHelpCenter();
  };

  return (
    <>
      {children}
      
      {showFloatingButton && (
        <div className="fixed bottom-6 right-6 z-40">
          <HelpButton 
            onClick={handleHelpClick} 
            variant="floating" 
            size="lg"
            className="shadow-xl hover:scale-110 transition-transform"
          />
        </div>
      )}
    </>
  );
};

export const HelpCenterLayout: React.FC<HelpCenterLayoutProps> = (props) => {
  return (
    <HelpCenterProvider>
      <HelpCenterLayoutContent {...props} />
    </HelpCenterProvider>
  );
};
