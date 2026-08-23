import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { adminApi } from '../lib/api';
import { Button, Input, Modal, Badge, toast } from '@lina/ui';
import { BannerType, type BannerResponse, type BannerTypeType } from '@lina/types';

export const BannerManagementPage: React.FC = () => {
  const [banners, setBanners] = useState<BannerResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerResponse | null>(null);
  const [bannerForm, setBannerForm] = useState<{
    title: string;
    subtitle: string;
    bannerType: BannerTypeType;
    actionLink: string;
    sortOrder: number;
    isActive: boolean;
  }>({
    title: '',
    subtitle: '',
    bannerType: BannerType.MealPromo,
    actionLink: '',
    sortOrder: 0,
    isActive: true,
  });

  const loadBanners = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAllBanners();
      setBanners(data || []);
    } catch (err) {
      console.error('Failed to load banners', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleOpenModal = (banner?: BannerResponse) => {
    if (banner) {
      setEditingBanner(banner);
      setBannerForm({
        title: banner.title,
        subtitle: banner.subtitle || '',
        bannerType: banner.bannerType,
        actionLink: banner.actionLink || '',
        sortOrder: banner.sortOrder || 0,
        isActive: banner.isActive,
      });
    } else {
      setEditingBanner(null);
      setBannerForm({
        title: '',
        subtitle: '',
        bannerType: BannerType.MealPromo,
        actionLink: '',
        sortOrder: 0,
        isActive: true,
      });
    }
    setModalOpen(true);
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerForm.title.trim()) return;

    try {
      if (editingBanner) {
        await adminApi.updateBanner(editingBanner._id, bannerForm);
        toast.success('Banner updated successfully.');
      } else {
        await adminApi.createBanner(bannerForm);
        toast.success('Banner created successfully.');
      }
      setModalOpen(false);
      loadBanners();
    } catch (err: any) {
      toast.error('Failed to save banner.');
    }
  };

  const handleToggleActive = async (bannerId: string) => {
    try {
      await adminApi.toggleBannerActive(bannerId);
      toast.success('Banner status updated.');
      loadBanners();
    } catch (err) {
      toast.error('Failed to toggle banner status.');
    }
  };

  const handleDeleteBanner = async (bannerId: string) => {
    if (!window.confirm('Are you sure you want to delete this promotional banner?')) return;
    try {
      await adminApi.deleteBanner(bannerId);
      toast.success('Banner deleted.');
      loadBanners();
    } catch (err) {
      toast.error('Failed to delete banner.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-on-surface">
            Banners & Announcement Promos
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Configure featured meal discounts, hookah session specials, and top announcements
          </p>
        </div>

        <Button
          onClick={() => handleOpenModal()}
          variant="gold"
          size="sm"
          icon={<Plus size={14} />}
        >
          Create New Banner
        </Button>
      </div>

      {/* Banners Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-on-surface-variant">Loading banners...</div>
      ) : banners.length === 0 ? (
        <div className="p-12 text-center text-xs text-on-surface-variant bg-surface-container-lowest rounded-3xl border border-outline-variant">
          No promotional banners configured yet. Click above to add your first banner.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <div
              key={banner._id}
              className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-6 space-y-4 shadow-card flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <Badge variant="primary">{banner.bannerType}</Badge>
                  <button
                    onClick={() => handleToggleActive(banner._id)}
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full cursor-pointer ${
                      banner.isActive
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {banner.isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    <span>{banner.isActive ? 'Active' : 'Inactive'}</span>
                  </button>
                </div>

                <h3 className="font-serif font-bold text-lg text-on-surface">{banner.title}</h3>
                {banner.subtitle && (
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {banner.subtitle}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-surface-container flex items-center justify-between">
                <span className="text-[11px] text-on-surface-variant">
                  Sort Order: {banner.sortOrder}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenModal(banner)}
                    className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => handleDeleteBanner(banner._id)}
                    className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/40 transition-all"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Banner Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingBanner ? 'Edit Banner' : 'Create Promotional Banner'}
        width={500}
      >
        <form onSubmit={handleSaveBanner} className="space-y-4">
          <Input
            label="Banner Title *"
            placeholder="e.g. Asun & Jollof Rice Special Promo"
            value={bannerForm.title}
            onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Subtitle / Description
            </label>
            <textarea
              rows={2}
              value={bannerForm.subtitle}
              onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
              placeholder="Short promo text shown on digital menu..."
              className="w-full bg-surface-container-low text-xs rounded-xl p-3 border border-outline-variant focus:outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Banner Type
            </label>
            <select
              value={bannerForm.bannerType}
              onChange={(e) => setBannerForm({ ...bannerForm, bannerType: e.target.value as any })}
              className="w-full bg-surface-container-low text-xs rounded-xl p-3 border border-outline-variant focus:outline-none focus:border-primary font-medium"
            >
              <option value={BannerType.MealPromo}>Meal Promo</option>
              <option value={BannerType.Announcement}>General Announcement</option>
              <option value={BannerType.SpecialDiscount}>Special Discount / Happy Hour</option>
            </select>
          </div>

          <Input
            label="Action Link (Optional)"
            placeholder="e.g. /menu or external URL"
            value={bannerForm.actionLink}
            onChange={(e) => setBannerForm({ ...bannerForm, actionLink: e.target.value })}
          />

          <Input
            label="Sort Order"
            type="number"
            value={bannerForm.sortOrder}
            onChange={(e) => setBannerForm({ ...bannerForm, sortOrder: Number(e.target.value) })}
          />

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gold">
              Save Banner
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
