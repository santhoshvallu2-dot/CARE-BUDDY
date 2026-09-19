import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2';
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 min-h-[36px]',
    md: 'px-4 py-2.5 text-sm gap-2 min-h-[44px]',
    lg: 'px-5 py-3.5 text-base gap-2.5 font-semibold min-h-[50px]',
  };

  const variantStyles = {
    primary: 'bg-warm-900 text-warm-50 shadow-xs hover:bg-warm-800 active:bg-warm-950 border border-transparent font-semibold',
    secondary: 'bg-warm-100 text-warm-900 hover:bg-warm-200 active:bg-warm-300 border border-warm-200/90 font-semibold',
    outline: 'border border-warm-200 bg-white text-warm-800 hover:bg-warm-50 hover:border-warm-300 shadow-2xs font-medium',
    ghost: 'text-warm-700 hover:bg-warm-100 hover:text-warm-950 border border-transparent font-medium',
    danger: 'bg-natural-redBg text-natural-redText border border-natural-redBorder hover:bg-red-100 active:bg-red-200 font-semibold',
    success: 'bg-warm-900 text-warm-50 hover:bg-warm-800 font-semibold',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0 flex items-center">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

export const PrimaryButton: React.FC<ButtonProps> = (props) => <Button variant="primary" {...props} />;
export const SecondaryButton: React.FC<ButtonProps> = (props) => <Button variant="secondary" {...props} />;
