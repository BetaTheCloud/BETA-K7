import React from 'react';

interface K7LogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
}

export default function K7Logo({ className = 'w-10 h-10', size, showText = false }: K7LogoProps) {
  const style = size ? { width: size, height: size } : undefined;

  return (
    <div className={`relative flex items-center shrink-0 select-none ${className}`} style={style}>
      <img
        src="/ust_bar_logo.png"
        alt="Kilis 7 Aralık Üniversitesi Resmi Logosu"
        className="w-full h-full object-contain rounded-full drop-shadow-md transition-transform hover:scale-105"
        loading="eager"
        onError={(e) => {
          const target = e.currentTarget;
          if (!target.src.includes('logo.svg')) {
            target.src = '/logo.svg';
          }
        }}
      />
    </div>
  );
}
