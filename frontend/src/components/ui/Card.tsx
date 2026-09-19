import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-warm-200/70 p-4 shadow-2xs ${
        hoverable || onClick
          ? 'transition-all duration-200 hover:border-warm-300 hover:shadow-xs cursor-pointer active:scale-[0.99]'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
