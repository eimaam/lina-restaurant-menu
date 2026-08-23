import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  RefreshCw,
  Eye,
  CheckCircle2,
  Clock,
  Send,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import { adminApi } from '../lib/api';
import { formatNaira, Badge, Modal, toast, WhatsAppIcon } from '@lina/ui';
import { OrderStatus, type OrderResponse, type OrderStatusType } from '@lina/types';

export const OrdersHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [fulfillmentFilter, setFulfillmentFilter] = useState('all');

  // Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getOrders({
        search: search.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        fulfillmentType: fulfillmentFilter !== 'all' ? fulfillmentFilter : undefined,
      });
      setOrders(res.orders || []);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, fulfillmentFilter]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await adminApi.updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus as OrderStatusType } : o))
      );
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus as OrderStatusType });
      }
      toast.success(`Order status updated to ${newStatus}.`);
    } catch (err) {
      toast.error('Failed to update order status.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-on-surface">
            Customer Orders Log
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Real-time feed of all incoming WhatsApp and digital checkout orders
          </p>
        </div>

        <button
          onClick={loadOrders}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-surface-container hover:bg-surface-container-high text-xs font-bold rounded-xl border border-outline-variant transition-all cursor-pointer select-none"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-surface-container-lowest p-3.5 rounded-2xl border border-outline-variant">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-surface-container-low text-xs rounded-xl px-3 py-2 border border-outline-variant focus:outline-none focus:border-primary font-medium"
          >
            <option value="all">All Statuses</option>
            <option value={OrderStatus.Received}>Received</option>
            <option value={OrderStatus.Confirmed}>Confirmed</option>
            <option value={OrderStatus.Preparing}>Preparing</option>
            <option value={OrderStatus.Completed}>Completed</option>
            <option value={OrderStatus.Cancelled}>Cancelled</option>
          </select>

          {/* Fulfillment Filter */}
          <select
            value={fulfillmentFilter}
            onChange={(e) => setFulfillmentFilter(e.target.value)}
            className="bg-surface-container-low text-xs rounded-xl px-3 py-2 border border-outline-variant focus:outline-none focus:border-primary font-medium"
          >
            <option value="all">All Fulfillment Modes</option>
            <option value="dine_in">Dine-In</option>
            <option value="pickup">Takeaway / Pickup</option>
            <option value="delivery">Delivery</option>
          </select>
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[240px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order #, customer, table..."
            className="w-full bg-surface-container-low text-xs rounded-xl pl-9 pr-4 py-2 border border-outline-variant focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant overflow-hidden shadow-card">
        {loading ? (
          <div className="p-12 text-center text-xs text-on-surface-variant">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-xs text-on-surface-variant">
            No orders found matching the filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-container-low border-b border-outline-variant text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Order #</th>
                  <th className="py-3.5 px-4">Customer / Destination</th>
                  <th className="py-3.5 px-4">Fulfillment</th>
                  <th className="py-3.5 px-4">Dishes & Quantity</th>
                  <th className="py-3.5 px-4">Subtotal</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-surface-container/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-sm text-on-surface">
                        #{order.orderNumber}
                      </div>
                      <div className="text-[11px] text-on-surface-variant">
                        {new Date(order.createdAt).toLocaleString([], {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-on-surface">
                        {order.customer?.name || 'Guest'}
                      </div>
                      {order.customer?.phone && (
                        <div className="text-[11px] text-on-surface-variant">
                          {order.customer.phone}
                        </div>
                      )}
                      {order.tableNumber && (
                        <div className="text-[11px] font-semibold text-primary">
                          Table: {order.tableNumber}
                        </div>
                      )}
                      {order.deliveryAddress && (
                        <div className="text-[11px] text-on-surface-variant truncate max-w-xs">
                          {order.deliveryAddress}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          order.fulfillmentType === 'dine_in'
                            ? 'primary'
                            : order.fulfillmentType === 'delivery'
                            ? 'secondary'
                            : 'neutral'
                        }
                      >
                        {order.fulfillmentType}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        {order.items.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="text-[11px] text-on-surface truncate max-w-xs">
                            {item.quantity}x {item.name}
                            {item.selectedSize && ` (${item.selectedSize.name})`}
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <div className="text-[10px] text-on-surface-variant font-semibold">
                            +{order.items.length - 2} more items
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-serif font-black text-sm text-secondary">
                      {formatNaira(order.subtotal)}
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-3.5 px-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                        className="bg-surface-container text-xs rounded-lg px-2.5 py-1 border border-outline-variant focus:outline-none focus:border-primary font-bold cursor-pointer"
                      >
                        <option value={OrderStatus.Received}>Received</option>
                        <option value={OrderStatus.Confirmed}>Confirmed</option>
                        <option value={OrderStatus.Preparing}>Preparing</option>
                        <option value={OrderStatus.Completed}>Completed</option>
                        <option value={OrderStatus.Cancelled}>Cancelled</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface transition-all cursor-pointer"
                      >
                        <Eye size={13} />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect Order Details Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Order #${selectedOrder.orderNumber} Details`}
          width={560}
        >
          <div className="space-y-5 text-xs">
            {/* Customer & Fulfillment Header */}
            <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-on-surface">
                  {selectedOrder.customer?.name || 'Guest'}
                </span>
                <Badge variant="primary">{selectedOrder.fulfillmentType}</Badge>
              </div>
              {selectedOrder.customer?.phone && (
                <div>Phone: {selectedOrder.customer.phone}</div>
              )}
              {selectedOrder.tableNumber && (
                <div className="font-semibold text-primary">
                  Table / Seat: {selectedOrder.tableNumber}
                </div>
              )}
              {selectedOrder.deliveryAddress && (
                <div>Delivery Address: {selectedOrder.deliveryAddress}</div>
              )}
              {selectedOrder.orderNotes && (
                <div className="italic text-on-surface-variant">
                  Kitchen Note: "{selectedOrder.orderNotes}"
                </div>
              )}
            </div>

            {/* Line Items List */}
            <div className="space-y-2">
              <div className="font-bold text-xs uppercase tracking-wider text-on-surface-variant">
                Items Ordered
              </div>
              <div className="divide-y divide-surface-container bg-surface-container-lowest rounded-2xl border border-outline-variant p-3">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="py-2 flex items-start justify-between gap-3 first:pt-0 last:pb-0">
                    <div>
                      <div className="font-bold text-on-surface">
                        {item.quantity}x {item.name}
                      </div>
                      {item.selectedSize && (
                        <div className="text-[11px] text-primary font-medium">
                          Size: {item.selectedSize.name}
                        </div>
                      )}
                      {item.selectedOptions && item.selectedOptions.length > 0 && (
                        <div className="text-[11px] text-on-surface-variant">
                          Options: {item.selectedOptions.map((o) => o.optionName).join(', ')}
                        </div>
                      )}
                      {item.specialInstructions && (
                        <div className="text-[11px] italic text-on-surface-variant/80">
                          ↳ {item.specialInstructions}
                        </div>
                      )}
                    </div>
                    <div className="font-serif font-bold text-secondary">
                      {formatNaira(item.lineTotal)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Subtotal Footer */}
            <div className="p-4 bg-surface-container rounded-2xl flex items-center justify-between font-bold text-sm">
              <span>Total Logged Amount</span>
              <span className="font-serif text-lg text-secondary">
                {formatNaira(selectedOrder.subtotal)}
              </span>
            </div>

            {/* Action Bar */}
            {selectedOrder.whatsappDeepLinkUrl && (
              <div className="pt-2">
                <a
                  href={selectedOrder.whatsappDeepLinkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[#25D366] hover:bg-[#1ebd59] text-white font-bold rounded-xl text-xs transition-all shadow-xs"
                >
                  <WhatsAppIcon size={16} />
                  <span>Re-open WhatsApp Message</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
