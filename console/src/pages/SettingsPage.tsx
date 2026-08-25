import React, { useState, useEffect } from 'react';
import {
  Settings,
  Phone,
  Mail,
  MapPin,
  Clock,
  Save,
  MessageSquare,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { adminApi } from '../lib/api';
import { Button, Input, WhatsAppIcon, InstagramIcon, TikTokIcon, FacebookIcon, toast } from '@lina/ui';
import type { RestaurantSettings } from '@lina/types';

export const SettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<RestaurantSettings>({
    restaurantName: 'Lina Restaurant, Bar And Street Food',
    whatsappNumber: '2349165196622',
    contactPhone: '09165196622',
    contactEmail: 'linarestaurantandbar@gmail.com',
    address: '7/29 6th Avenue, Gwarinpa, Abuja',
    tiktokUrl: 'https://www.tiktok.com/@lina_restaurant?_r=1&_t=ZS-999dMxzyRjV',
    instagramUrl: 'https://www.instagram.com/lina_restaurant_and_streetfood?igsi=MTBndGluYnhyNDY5aA==',
    facebookUrl: 'https://www.facebook.com/share/1EjgzWAGvT/?mibextid=wwXIfr',
    openingHoursRestaurant: '12:00 PM – Late',
    openingHoursStreetFood: '5:00 PM – Late',
  });

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getSettings();
      if (data) {
        setForm(data);
      }
    } catch (err) {
      console.error('Failed to load settings', err);
      toast.error('Failed to load settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.updateSettings(form);
      toast.success('Restaurant contact and social settings updated successfully!');
      loadSettings();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-on-surface flex items-center gap-2">
            <span>Restaurant Contact & Brand Settings</span>
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Configure the live WhatsApp ordering hotline, telephone numbers, address, and social media handles.
          </p>
        </div>

        <Button
          onClick={loadSettings}
          variant="outline"
          size="sm"
          icon={<RefreshCw size={14} className={loading ? 'animate-spin' : ''} />}
        >
          Reload
        </Button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-on-surface-variant bg-surface-container-lowest rounded-3xl border border-outline-variant">
          Loading restaurant configurations...
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* 1. WhatsApp & Dispatch Contacts */}
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-6 space-y-4 shadow-card">
            <div className="flex items-center gap-2 pb-3 border-b border-surface-container">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                <WhatsAppIcon size={18} />
              </div>
              <div>
                <h2 className="font-serif font-bold text-base text-on-surface">
                  WhatsApp Direct Ordering Hotline
                </h2>
                <p className="text-[11px] text-on-surface-variant">
                  Orders placed on the guest menu will be deep-linked directly to this WhatsApp line.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="WhatsApp Phone Number (International format e.g. 2349165196622) *"
                placeholder="2349165196622"
                value={form.whatsappNumber}
                onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value.replace(/[^0-9]/g, '') })}
                required
              />

              <Input
                label="Public Call / Reservation Phone *"
                placeholder="09165196622"
                value={form.contactPhone}
                onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                required
              />
            </div>
          </div>

          {/* 2. Restaurant Identity & Location */}
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-6 space-y-4 shadow-card">
            <div className="flex items-center gap-2 pb-3 border-b border-surface-container">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <MapPin size={18} />
              </div>
              <div>
                <h2 className="font-serif font-bold text-base text-on-surface">
                  Identity & Location
                </h2>
                <p className="text-[11px] text-on-surface-variant">
                  Official brand name, address, email, and operating hours.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Input
                label="Official Brand Title *"
                value={form.restaurantName}
                onChange={(e) => setForm({ ...form, restaurantName: e.target.value })}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Official Email Address"
                  type="email"
                  placeholder="linarestaurantandbar@gmail.com"
                  value={form.contactEmail}
                  onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                />

                <Input
                  label="Physical Address & Area"
                  placeholder="7/29 6th Avenue, Gwarinpa, Abuja"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Opening Hours: Restaurant & Lounge"
                  placeholder="12:00 PM – Late"
                  value={form.openingHoursRestaurant}
                  onChange={(e) => setForm({ ...form, openingHoursRestaurant: e.target.value })}
                />

                <Input
                  label="Opening Hours: Street Food Section"
                  placeholder="5:00 PM – Late"
                  value={form.openingHoursStreetFood}
                  onChange={(e) => setForm({ ...form, openingHoursStreetFood: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* 3. Social Media Links */}
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-6 space-y-4 shadow-card">
            <div className="flex items-center gap-2 pb-3 border-b border-surface-container">
              <div className="p-2 rounded-xl bg-rose-100 text-rose-800">
                <InstagramIcon size={18} />
              </div>
              <div>
                <h2 className="font-serif font-bold text-base text-on-surface">
                  Social Media Links
                </h2>
                <p className="text-[11px] text-on-surface-variant">
                  Verified social media channels displayed on the guest site.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Input
                label="TikTok Profile URL"
                placeholder="https://www.tiktok.com/@lina_restaurant..."
                value={form.tiktokUrl || ''}
                onChange={(e) => setForm({ ...form, tiktokUrl: e.target.value })}
              />

              <Input
                label="Instagram Profile URL"
                placeholder="https://www.instagram.com/lina_restaurant_and_streetfood..."
                value={form.instagramUrl || ''}
                onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })}
              />

              <Input
                label="Facebook Page URL"
                placeholder="https://www.facebook.com/..."
                value={form.facebookUrl || ''}
                onChange={(e) => setForm({ ...form, facebookUrl: e.target.value })}
              />
            </div>
          </div>

          {/* Save Button Bar */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="submit"
              variant="gold"
              size="lg"
              loading={saving}
              icon={<Save size={16} />}
              className="shadow-sm font-bold"
            >
              Save & Apply Settings
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
