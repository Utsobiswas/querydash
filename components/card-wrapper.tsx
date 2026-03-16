'use client';

import { ReactNode } from 'react';

interface CardWrapperProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function CardWrapper({ children, title, subtitle, className = '' }: CardWrapperProps) {
  return (
    <div className={`glass p-6 chart-animation ${className}`}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
