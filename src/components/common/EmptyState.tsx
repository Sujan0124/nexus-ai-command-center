import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-dashed border-nexus-border rounded-2xl bg-nexus-surface/50 ${className}`}>
      <div className="w-12 h-12 rounded-xl bg-nexus-elevated border border-nexus-border flex items-center justify-center text-indigo-400 mb-4 shadow-sm">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-nexus-text">{title}</h3>
      <p className="text-sm text-nexus-text-muted max-w-sm mt-1.5 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <div className="mt-6">
          <Button size="sm" variant="primary" onClick={onAction}>
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
};
