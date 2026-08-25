import React, { useState, useEffect } from 'react';
import {
  Truck,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { adminApi } from '../lib/api';
import { Button, Input, Modal, Badge, formatNaira, toast } from '@lina/ui';
import type { DeliveryZoneResponse } from '@lina/types';

export const DeliveryZonesPage: React.FC = () => {
  const [zones, setZones] = useState<DeliveryZoneResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Create / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZoneResponse | null>(null);
  const [form, setForm] = useState({
    name: '',
    fee: 1500,
    estimatedMinutes: 45,
    description: '',
    sortOrder: 0,
    isActive: true,
  });

  const loadZones = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAllDeliveryZones();
      setZones(data || []);
    } catch (err) {
      console.error('Failed to load delivery zones', err);
      toast.error('Failed to load delivery zones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadZones();
  }, []);

  const openCreate = () => {
    setEditingZone(null);
    setForm({
      name: '',
      fee: 1500,
      estimatedMinutes: 45,
      description: '',
      sortOrder: zones.length + 1,
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEdit = (zone: DeliveryZoneResponse) => {
    setEditingZone(zone);
    setForm({
      name: zone.name,
      fee: zone.fee,
      estimatedMinutes: zone.estimatedMinutes || 45,
      description: zone.description || '',
      sortOrder: zone.sortOrder || 0,
      isActive: zone.isActive,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Zone name is required.');
      return;
    }
    if (form.fee < 0) {
      toast.error('Delivery fee cannot be negative.');
      return;
    }

    try {
      if (editingZone) {
        await adminApi.updateDeliveryZone(editingZone._id, form);
        toast.success('Delivery zone updated successfully.');
      } else {
        await adminApi.createDeliveryZone(form);
        toast.success('Delivery zone added successfully.');
      }
      setModalOpen(false);
      setEditingZone(null);
      loadZones();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save delivery zone.');
    }
  };

  const handleToggleStatus = async (zone: DeliveryZoneResponse) => {
    try {
      await adminApi.updateDeliveryZone(zone._id, { isActive: !zone.isActive });
      toast.success(`Delivery zone ${!zone.isActive ? 'activated' : 'deactivated'}.`);
      loadZones();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const handleDelete = async (zone: DeliveryZoneResponse) => {
    if (!window.confirm(`Are you sure you want to delete delivery zone "${zone.name}"?`)) return;
    try {
      await adminApi.deleteDeliveryZone(zone._id);
      toast.success('Delivery zone deleted.');
      loadZones();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete delivery zone.');
    }
  };

  const filteredZones = zones.filter((z) =>
    z.name.toLowerCase().includes(search.toLowerCase()) ||
    (z.description && z.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-on-surface flex items-center gap-2">
            <span>Delivery Zones & Dispatch Fees</span>
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Configure delivery coverage areas across Abuja, custom fees in Naira, and estimated arrival windows.
          </p>
        </div>

        <Button onClick={openCreate} variant="gold" size="sm" icon={<Plus size={14} />}>
          Add Delivery Zone
        </Button>
      </div>

      {/* Search Toolbar */}
      <div className="flex items-center justify-between gap-4 bg-surface-container-lowest p-3 rounded-2xl border border-outline-variant">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search delivery zones..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container text-xs rounded-xl pl-9 pr-4 py-2 border border-outline-variant focus:outline-none focus:border-primary"
          />
        </div>

        <button
          onClick={loadZones}
          className="p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all"
          title="Refresh Zones"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Zones Table Container */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant overflow-hidden shadow-card">
        {loading ? (
          <div className="p-12 text-center text-xs text-on-surface-variant">
            Loading delivery zones...
          </div>
        ) : filteredZones.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <Truck size={20} />
            </div>
            <h3 className="font-serif font-bold text-base text-on-surface">No delivery zones found</h3>
            <p className="text-xs text-on-surface-variant max-w-xs mx-auto">
              {search ? 'No zones match your search query.' : 'Add your first delivery zone to start receiving dispatched home orders.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-container-low border-b border-outline-variant text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Zone / Area Name</th>
                  <th className="py-3.5 px-4">Delivery Fee</th>
                  <th className="py-3.5 px-4">Estimated Time</th>
                  <th className="py-3.5 px-4">Sort Order</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {filteredZones.map((zone) => (
                  <tr
                    key={zone._id}
                    onClick={() => openEdit(zone)}
                    className="hover:bg-surface-container-low transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-primary shrink-0" />
                        <div>
                          <div className="font-bold text-sm text-on-surface">{zone.name}</div>
                          {zone.description && (
                            <div className="text-[11px] text-on-surface-variant">
                              {zone.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-serif font-black text-sm text-secondary">
                      {formatNaira(zone.fee)}
                    </td>

                    <td className="py-3.5 px-4 text-on-surface-variant">
                      <div className="flex items-center gap-1.5">
                        <Clock size={13} className="text-primary" />
                        <span>~{zone.estimatedMinutes || 45} mins</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-on-surface-variant font-mono">
                      #{zone.sortOrder}
                    </td>

                    <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleToggleStatus(zone)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                          zone.isActive
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                        }`}
                      >
                        {zone.isActive ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                        <span>{zone.isActive ? 'Active' : 'Disabled'}</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(zone)}
                          className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all"
                          title="Edit Zone"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(zone)}
                          className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/40 transition-all"
                          title="Delete Zone"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Zone Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingZone ? 'Edit Delivery Zone' : 'Add New Delivery Zone'}
        width={480}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Zone / Area Name *"
            placeholder="e.g. Gwarinpa (1st - 7th Avenue) or Maitama"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Delivery Fee (₦) *"
              type="number"
              min={0}
              step={100}
              placeholder="e.g. 1500"
              value={form.fee}
              onChange={(e) => setForm({ ...form, fee: Number(e.target.value) })}
              required
            />

            <Input
              label="Est. Delivery Time (Mins)"
              type="number"
              min={5}
              placeholder="e.g. 45"
              value={form.estimatedMinutes}
              onChange={(e) => setForm({ ...form, estimatedMinutes: Number(e.target.value) })}
            />
          </div>

          <Input
            label="Coverage Details / Landmarks"
            placeholder="e.g. Covers 1st to 7th Avenue, Citec Estate, Setraco"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Sort Order"
              type="number"
              placeholder="e.g. 1"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-on-surface">Status</label>
              <select
                value={form.isActive ? 'true' : 'false'}
                onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}
                className="w-full bg-surface-container-low text-xs rounded-lg p-3 border border-outline-variant focus:outline-none focus:border-primary font-medium"
              >
                <option value="true">Active (Available on Checkout)</option>
                <option value="false">Disabled / Suspended</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-surface-container flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Close
            </Button>
            <Button type="submit" variant="gold">
              {editingZone ? 'Save Changes' : 'Create Zone'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
