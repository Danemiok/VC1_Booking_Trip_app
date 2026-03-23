import { useState } from 'react';

export const useHelpCenter = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openHelpCenter = () => setIsOpen(true);
  const closeHelpCenter = () => setIsOpen(false);
  const toggleHelpCenter = () => setIsOpen(!isOpen);

  return {
    isOpen,
    openHelpCenter,
    closeHelpCenter,
    toggleHelpCenter
  };
};
