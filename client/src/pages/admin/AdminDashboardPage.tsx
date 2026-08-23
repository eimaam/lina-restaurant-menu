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
  Users,
} from 'lucide-react';
import { adminApi } from '../../lib/api';
import { formatNaira } from '../../lib/utils';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../contexts/AuthContext';

export const AdminDashboardPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const [statsData, ordersRes] = await Promise.all([
          adminApi.getOrderStats(),
          adminApi.getOrders({ limit: 5 }),
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

  return (
    <div className="space-y-8">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-on-surface">
            Welcome back, {user?.name || 'Manager'}
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Lina Restaurant & Bar Management Portal • 27/29 6th Avenue, Gwarinpa
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/menu"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-on-primary font-bold text-xs rounded-xl shadow-xs transition-all"
          >
            <UtensilsCrossed size={14} />
            <span>Manage Menu & Stock</span>
          </Link>
          <Link
            to="/admin/qr"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-surface-container-high hover:bg-surface-container text-on-surface font-semibold text-xs rounded-xl border border-outline-variant transition-all"
          >
            <QrCode size={14} />
            <span>QR Codes</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-5 space-y-2 shadow-card">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-xs font-bold uppercase tracking-wider">Total Sales Volume</span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="font-serif font-black text-2xl text-secondary">
            {formatNaira(stats?.totalRevenue || 0)}
          </div>
          <p className="text-[11px] text-on-surface-variant">
            Logged from customer WhatsApp dispatches
          </p>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-5 space-y-2 shadow-card">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-xs font-bold uppercase tracking-wider">Today's Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Sparkles size={18} />
            </div>
          </div>
          <div className="font-serif font-black text-2xl text-emerald-700">
            {formatNaira(stats?.todayRevenue || 0)}
          </div>
          <p className="text-[11px] text-on-surface-variant">
            {stats?.todayOrdersCount || 0} orders received today
          </p>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-5 space-y-2 shadow-card">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-xs font-bold uppercase tracking-wider">Total Orders Log</span>
            <div className="p-2 rounded-xl bg-secondary/10 text-secondary">
              <ClipboardList size={18} />
            </div>
          </div>
          <div className="font-serif font-black text-2xl text-on-surface">
            {stats?.totalOrdersCount || 0}
          </div>
          <p className="text-[11px] text-on-surface-variant">Dine-in, pickup & delivery</p>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-5 space-y-2 shadow-card">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-xs font-bold uppercase tracking-wider">Status Breakdown</span>
            <div className="p-2 rounded-xl bg-surface-container text-on-surface">
              <Clock size={18} />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Badge variant="primary" size="sm">
              {stats?.statusBreakdown?.received || 0} New
            </Badge>
            <Badge variant="secondary" size="sm">
              {stats?.statusBreakdown?.preparing || 0} Active
            </Badge>
          </div>
          <p className="text-[11px] text-on-surface-variant">Real-time status</p>
        </div>
      </div>

      {/* Main Grid: Recent Orders & Top Dishes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders Log */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-bold text-lg text-on-surface">Recent Order Dispatches</h2>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant overflow-hidden shadow-card">
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center text-xs text-on-surface-variant">
                No orders logged yet. Customer checkouts will show up here in real-time.
              </div>
            ) : (
              <div className="divide-y divide-surface-container">
                {recentOrders.map((order) => (
                  <div key={order._id} className="p-4 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-on-surface">
                          #{order.orderNumber}
                        </span>
                        <Badge
                          variant={
                            order.fulfillmentType === 'dine_in'
                              ? 'primary'
                              : order.fulfillmentType === 'delivery'
                              ? 'secondary'
                              : 'neutral'
                          }
                          size="sm"
                        >
                          {order.fulfillmentType}
                        </Badge>
                        {order.tableNumber && (
                          <span className="text-xs text-on-surface-variant">
                            Table #{order.tableNumber}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-on-surface-variant">
                        {order.customer?.name || 'Guest'} • {order.items?.length || 0} line items
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-serif font-bold text-sm text-secondary">
                        {formatNaira(order.subtotal)}
                      </div>
                      <div className="text-[11px] text-on-surface-variant">
                        {new Date(order.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Popular Dishes Breakdown */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="font-serif font-bold text-lg text-on-surface">Top Selling Items</h2>

          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5 space-y-3 shadow-card">
            {stats?.popularItems && stats.popularItems.length > 0 ? (
              stats.popularItems.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2 border-b border-surface-container last:border-none"
                >
                  <div className="space-y-0.5">
                    <div className="font-serif font-bold text-sm text-on-surface">{item.name}</div>
                    <div className="text-xs text-on-surface-variant">
                      {item.orderCount} portions ordered
                    </div>
                  </div>
                  <div className="font-serif font-bold text-xs text-primary">
                    {formatNaira(item.totalSales)}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-on-surface-variant py-4 text-center">
                Sales statistics will populate as orders are completed.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
