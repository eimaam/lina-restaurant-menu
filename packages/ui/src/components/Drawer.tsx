import React from 'react';
import { Drawer as AntDrawer } from 'antd';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  width?: number | string;
  placement?: 'right' | 'left' | 'top' | 'bottom';
  className?: string;
  footer?: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  width = 480,
  placement = 'right',
  className,
  footer,
}) => {
  return (
    <AntDrawer
      open={isOpen}
      onClose={onClose}
      width={width}
      placement={placement}
      footer={footer}
      closeIcon={<X size={18} className="text-on-surface-variant hover:text-on-surface" />}
      className={cn('lina-custom-drawer', className)}
      styles={{
        content: {
          backgroundColor: 'var(--color-surface)',
        },
        header: {
          borderBottom: '1px solid var(--color-surface-container)',
          padding: '1.25rem 1.5rem',
        },
        body: {
          padding: '1.5rem',
        },
      }}
      title={
        title ? (
          <div className="font-serif text-lg font-bold text-on-surface">{title}</div>
        ) : null
      }
    >
      <div className="font-sans text-on-surface">{children}</div>
    </AntDrawer>
  );
};
