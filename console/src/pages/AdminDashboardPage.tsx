import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  UtensilsCrossed,
  TrendingUp,
  Clock,
  ArrowRight,
  Sparkles,
  QrCode,
  DollarSign,
  ShoppingBag,
  Activity,
} from 'lucide-react';
import { adminApi } from '../lib/api';
import { formatNaira, Badge, Button } from '@lina/ui';
import { useAuth } from '../contexts/AuthContext';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const [statsData, ordersRes] = await Promise.all([
          adminApi.getOrderStats(),
          adminApi.getOrders({ limit: 6 }),
        ]);
        setStats(statsData);
        setRecentOrders(ordersRes.orders || []);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const pendingCount = (stats?.receivedOrders || 0) + (stats?.preparingOrders || 0);

  return (
    <div className="space-y-8">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-on-surface">
            Welcome back, {user?.name || 'Manager'}
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Lina Restaurant, Bar And Street Food • Operations Console
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/menu"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#161311] hover:bg-black text-[#FAF7F2] font-semibold text-xs rounded-xl shadow-xs transition-all"
          >
            <UtensilsCrossed size={14} className="text-primary" />
            <span>Menu & Stock</span>
          </Link>
          <Link
            to="/orders"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-surface-container text-on-surface font-semibold text-xs rounded-xl border border-outline-variant transition-all"
          >
            <ClipboardList size={14} className="text-on-surface-variant" />
            <span>Orders Log</span>
          </Link>
        </div>
      </div>

      {/* ── Minimalist KPI Metrics Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Sales Volume */}
        <div className="bg-white rounded-2xl border border-outline-variant p-5.5 space-y-2 shadow-xs transition-all hover:border-outline">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface-variant">Total Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant">
              <TrendingUp size={15} />
            </div>
          </div>
          <div className="font-serif font-black text-2xl text-on-surface">
            {formatNaira(stats?.totalRevenue || 0)}
          </div>
          <p className="text-xs text-on-surface-variant">
            All-time gross sales volume
          </p>
        </div>

        {/* Card 2: Today's Revenue */}
        <div className="bg-white rounded-2xl border border-outline-variant p-5.5 space-y-2 shadow-xs transition-all hover:border-outline">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface-variant">Today's Sales</span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant">
              <DollarSign size={15} />
            </div>
          </div>
          <div className="font-serif font-black text-2xl text-on-surface">
            {formatNaira(stats?.todayRevenue || 0)}
          </div>
          <p className="text-xs text-on-surface-variant">
            {stats?.todayOrders || 0} orders received today
          </p>
        </div>

        {/* Card 3: Total Orders */}
        <div className="bg-white rounded-2xl border border-outline-variant p-5.5 space-y-2 shadow-xs transition-all hover:border-outline">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface-variant">Total Orders</span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant">
              <ShoppingBag size={15} />
            </div>
          </div>
          <div className="font-serif font-black text-2xl text-on-surface">
            {stats?.totalOrders || 0}
          </div>
          <p className="text-xs text-on-surface-variant">
            Dine-in, takeaway & delivery
          </p>
        </div>

        {/* Card 4: Pending Kitchen Queue */}
        <div className="bg-white rounded-2xl border border-outline-variant p-5.5 space-y-2 shadow-xs transition-all hover:border-outline">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface-variant">Active Queue</span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant">
              <Clock size={15} />
            </div>
          </div>
          <div className="font-serif font-black text-2xl text-on-surface">
            {pendingCount}
          </div>
          <p className="text-xs text-on-surface-variant">
            {stats?.receivedOrders || 0} new • {stats?.preparingOrders || 0} preparing
          </p>
        </div>
      </div>

      {/* Main Grid: Recent Orders */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif font-bold text-lg text-on-surface">Recent Orders</h2>
            <p className="text-xs text-on-surface-variant">
              Live orders received from guests and WhatsApp checkouts.
            </p>
          </div>

          <Link
            to="/orders"
            className="text-xs font-semibold text-on-surface hover:text-primary transition-colors flex items-center gap-1"
          >
            <span>View Full Log</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-outline-variant overflow-hidden shadow-xs">
          {recentOrders.length === 0 ? (
            <div className="p-12 text-center text-xs text-on-surface-variant space-y-2">
              <ClipboardList size={24} className="mx-auto text-on-surface-variant/40" />
              <p>No customer orders logged yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-surface-container">
              {recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-container-lowest transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-sm shrink-0">
                      {order.fulfillmentType === 'delivery' ? '🛵' : order.fulfillmentType === 'dine_in' ? '🍽️' : '🛍️'}
                    </div>

                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-on-surface">
                          #{order.orderNumber}
                        </span>
                        <Badge
                          variant={
                            order.status === 'completed'
                              ? 'primary'
                              : order.status === 'preparing'
                              ? 'secondary'
                              : 'neutral'
                          }
                          size="sm"
                        >
                          {order.status}
                        </Badge>
                      </div>

                      <div className="text-xs text-on-surface-variant truncate">
                        {order.customer?.name || 'Guest'} •{' '}
                        {order.fulfillmentType === 'delivery'
                          ? `Delivery (${order.deliveryZoneName || 'Abuja'})`
                          : order.fulfillmentType === 'dine_in'
                          ? `Table #${order.tableNumber || 'N/A'}`
                          : 'Pickup at Bar'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 text-right">
                    <div>
                      <div className="font-serif font-black text-sm text-on-surface">
                        {formatNaira(order.total || order.subtotal)}
                      </div>
                      <div className="text-[10px] text-on-surface-variant font-mono">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    <Link to="/orders">
                      <Button variant="outline" size="sm" icon={<ArrowRight size={13} />}>
                        Manage
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
