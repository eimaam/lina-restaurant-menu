import React, { useState, useEffect, useCallback } from 'react';
import {
  History,
  Search,
  Filter,
  Eye,
  RefreshCw,
  User,
  Shield,
  Clock,
  Calendar,
  Layers,
  Code,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { adminApi } from '../lib/api';
import { Button, Input, Modal, Badge, toast, cn } from '@lina/ui';
import type { AuditLogResponse } from '@lina/types';

const RESOURCE_OPTIONS = [
  { label: 'All Resources', value: '' },
  { label: 'Staff & Users', value: 'User' },
  { label: 'Menu Items', value: 'MenuItem' },
  { label: 'Categories', value: 'MenuCategory' },
  { label: 'Banners & Promos', value: 'Banner' },
  { label: 'Orders Log', value: 'Order' },
  { label: 'Delivery Zones', value: 'DeliveryZone' },
  { label: 'Brand Settings', value: 'Settings' },
  { label: 'Auth & Logins', value: 'Auth' },
];

const ACTION_OPTIONS = [
  { label: 'All Actions', value: '' },
  { label: 'Create', value: 'create' },
  { label: 'Update', value: 'update' },
  { label: 'Delete', value: 'delete' },
  { label: 'Toggle Availability', value: 'toggle_availability' },
  { label: 'Status Change', value: 'status_change' },
  { label: 'Reset Password', value: 'reset_password' },
  { label: 'Activate', value: 'activate' },
  { label: 'Deactivate', value: 'deactivate' },
  { label: 'Login', value: 'login' },
];

const actionBadgeVariant = (action: string): 'primary' | 'secondary' | 'neutral' => {
  switch (action) {
    case 'create':
    case 'activate':
    case 'login':
      return 'primary';
    case 'update':
    case 'toggle_availability':
    case 'status_change':
      return 'secondary';
    case 'delete':
    case 'deactivate':
    case 'reset_password':
    default:
      return 'neutral';
  }
};

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  // Selected Log Detail Modal
  const [selectedLog, setSelectedLog] = useState<AuditLogResponse | null>(null);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAuditLogs({
        page,
        limit: 25,
        search: search.trim() || undefined,
        resource: resourceFilter || undefined,
        action: actionFilter || undefined,
      });

      setLogs(data.logs || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Failed to load audit logs', err);
      toast.error('Failed to load audit trail logs.');
    } finally {
      setLoading(false);
    }
  }, [page, search, resourceFilter, actionFilter]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // Debounced search reset to page 1
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleResourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setResourceFilter(e.target.value);
    setPage(1);
  };

  const handleActionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setActionFilter(e.target.value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-on-surface flex items-center gap-2">
            <span>System Audit Trail</span>
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Immutable activity log tracking all staff actions, catalog updates, price modifications, and logins.
          </p>
        </div>

        <Button
          onClick={loadLogs}
          variant="outline"
          size="sm"
          icon={<RefreshCw size={14} className={loading ? 'animate-spin' : ''} />}
        >
          Refresh Logs
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-surface-container-lowest p-4 rounded-3xl border border-outline-variant grid grid-cols-1 sm:grid-cols-3 gap-3 shadow-card">
        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search by actor, email, or description..."
            value={search}
            onChange={handleSearchChange}
            className="w-full bg-surface-container text-xs rounded-xl pl-9 pr-4 py-2.5 border border-outline-variant focus:outline-none focus:border-primary"
          />
        </div>

        {/* Resource Filter */}
        <div>
          <select
            value={resourceFilter}
            onChange={handleResourceChange}
            className="w-full bg-surface-container text-xs rounded-xl px-3 py-2.5 border border-outline-variant focus:outline-none focus:border-primary font-medium"
          >
            {RESOURCE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Action Filter */}
        <div>
          <select
            value={actionFilter}
            onChange={handleActionChange}
            className="w-full bg-surface-container text-xs rounded-xl px-3 py-2.5 border border-outline-variant focus:outline-none focus:border-primary font-medium"
          >
            {ACTION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant overflow-hidden shadow-card">
        {loading ? (
          <div className="p-16 text-center text-xs text-on-surface-variant">
            Loading system audit logs...
          </div>
        ) : logs.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <History size={20} />
            </div>
            <h3 className="font-serif font-bold text-base text-on-surface">No audit logs found</h3>
            <p className="text-xs text-on-surface-variant max-w-xs mx-auto">
              {search || resourceFilter || actionFilter
                ? 'No activity matches your current filters.'
                : 'System activity will appear here as orders and management changes occur.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-container-low border-b border-outline-variant text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Actor</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Resource</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {logs.map((entry) => (
                  <tr
                    key={entry._id}
                    onClick={() => setSelectedLog(entry)}
                    className="hover:bg-surface-container-low transition-colors cursor-pointer"
                  >
                    {/* Timestamp */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-on-surface-variant font-mono text-[11px]">
                      {new Date(entry.createdAt).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>

                    {/* Actor */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#161311] text-primary flex items-center justify-center font-serif font-bold text-xs shrink-0">
                          {entry.userName ? entry.userName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-on-surface truncate">{entry.userName}</div>
                          <div className="text-[10px] text-on-surface-variant truncate">
                            {entry.userEmail}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4">
                      <Badge variant={actionBadgeVariant(entry.action)} size="sm">
                        {entry.action.replace(/_/g, ' ')}
                      </Badge>
                    </td>

                    {/* Resource */}
                    <td className="py-3.5 px-4 font-mono font-bold text-on-surface">
                      {entry.resource}
                    </td>

                    {/* Description */}
                    <td className="py-3.5 px-4 max-w-xs truncate text-on-surface">
                      {entry.description}
                    </td>

                    {/* Action Button */}
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedLog(entry)}
                        className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all"
                        title="View Detailed Payload"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-outline-variant flex items-center justify-between text-xs text-on-surface-variant bg-surface-container-low">
            <div>
              Showing {logs.length} of {total} total audit records (Page {page} of {totalPages})
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                icon={<ChevronLeft size={14} />}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                icon={<ChevronRight size={14} />}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Inspect Log Detail Modal */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="Audit Log Detail"
        width={560}
      >
        {selectedLog && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 bg-surface-container-low p-4 rounded-2xl border border-outline-variant">
              <div>
                <span className="text-[10px] font-bold uppercase text-on-surface-variant block">
                  Timestamp
                </span>
                <span className="font-mono text-on-surface">
                  {new Date(selectedLog.createdAt).toLocaleString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-on-surface-variant block">
                  Action & Resource
                </span>
                <div className="flex items-center gap-1.5 pt-0.5">
                  <Badge variant={actionBadgeVariant(selectedLog.action)} size="sm">
                    {selectedLog.action}
                  </Badge>
                  <span className="font-mono font-bold text-on-surface">
                    {selectedLog.resource}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-on-surface-variant block">
                  Performed By
                </span>
                <span className="font-bold text-on-surface">{selectedLog.userName}</span>
                <span className="text-on-surface-variant block">{selectedLog.userEmail}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-on-surface-variant block">
                  Actor Role / IP
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="neutral" size="sm">
                    {selectedLog.userRole}
                  </Badge>
                  {selectedLog.ipAddress && (
                    <span className="font-mono text-[11px] text-on-surface-variant">
                      {selectedLog.ipAddress}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-on-surface-variant block mb-1">
                Description
              </span>
              <p className="text-sm font-medium text-on-surface bg-surface-container-low p-3 rounded-xl border border-outline-variant">
                {selectedLog.description}
              </p>
            </div>

            {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
              <div>
                <span className="text-[10px] font-bold uppercase text-on-surface-variant block mb-1">
                  Recorded Payload / Changes (JSON)
                </span>
                <pre className="bg-[#161311] text-[#FAF7F2] p-3.5 rounded-2xl text-[11px] font-mono overflow-x-auto border border-primary/20 max-h-56">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <Button variant="ghost" size="sm" onClick={() => setSelectedLog(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
