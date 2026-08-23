import React from 'react';
import { Table as AntTable } from 'antd';
import type { TableProps as AntTableProps } from 'antd';
import { cn } from '../../lib/utils';

export interface TableProps<T> extends AntTableProps<T> {
  className?: string;
}

export function Table<T extends object>({ className, ...props }: TableProps<T>) {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-sm">
      <AntTable<T>
        className={cn('lina-custom-table', className)}
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
          className: 'px-4 py-2',
        }}
        {...props}
      />
    </div>
  );
}
