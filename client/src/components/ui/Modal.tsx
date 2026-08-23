import React from 'react';
import { Modal as AntModal } from 'antd';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  width?: number | string;
  className?: string;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  width = 600,
  className,
  footer,
}) => {
  return (
    <AntModal
      open={isOpen}
      onCancel={onClose}
      footer={footer}
      width={width}
      centered
      closeIcon={<X size={18} className="text-on-surface-variant hover:text-on-surface" />}
      className={cn('lina-custom-modal', className)}
      styles={{
        content: {
          borderRadius: '1.25rem',
          padding: '1.5rem',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-outline-variant)',
          boxShadow: 'var(--shadow-elevated)',
        },
        header: {
          backgroundColor: 'transparent',
          marginBottom: '1rem',
          borderBottom: '1px solid var(--color-surface-container)',
          paddingBottom: '0.75rem',
        },
      }}
      title={
        title ? (
          <div className="font-serif text-lg font-bold text-on-surface">{title}</div>
        ) : null
      }
    >
      <div className="text-on-surface font-sans">{children}</div>
    </AntModal>
  );
};
