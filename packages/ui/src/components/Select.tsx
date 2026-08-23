import React from 'react';
import { Select as AntSelect } from 'antd';
import type { SelectProps as AntSelectProps } from 'antd';
import { cn } from '../lib/utils';

export interface SelectProps extends AntSelectProps {
  label?: string;
  error?: string;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({ label, error, className, ...props }) => {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
          {label}
        </label>
      )}
      <AntSelect
        className={cn('w-full custom-antd-select', className)}
        status={error ? 'error' : undefined}
        {...props}
      />
      {error && <p className="text-xs text-error font-medium">{error}</p>}
    </div>
  );
};
