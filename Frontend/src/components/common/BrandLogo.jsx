import React from 'react';
import { cn } from '../../utils/utils';
const logoSrc = () => '/logos/logoBookingTrip.png';
export const BrandLogo = ({ variant = 'mark', className, imageClassName, showText = false, }) => {
    if (variant === 'full') {
        return (<img src={logoSrc()} alt="Komrong" className={cn('block object-contain', className, imageClassName)} draggable={false} loading="eager"/>);
    }
    return (<div className={cn('inline-flex items-center gap-3', className)}>
      <img src={logoSrc()} alt="Komrong" className={cn('block object-contain', imageClassName)} draggable={false} loading="eager"/>
      {showText && (<span className="font-bold leading-none tracking-tight text-inherit">Komrong</span>)}
    </div>);
};
