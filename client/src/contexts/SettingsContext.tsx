import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { RestaurantSettings } from '@lina/types';
import { publicApi } from '../lib/api';

export const DEFAULT_SETTINGS: RestaurantSettings = {
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
};

const SETTINGS_CACHE_KEY = 'lina_restaurant_settings_cache';

const sanitizeSettings = (data?: Partial<RestaurantSettings> | null): RestaurantSettings => {
  return {
    ...DEFAULT_SETTINGS,
    ...(data || {}),
    openingHoursRestaurant:
      data?.openingHoursRestaurant?.trim() || DEFAULT_SETTINGS.openingHoursRestaurant,
    openingHoursStreetFood:
      data?.openingHoursStreetFood?.trim() || DEFAULT_SETTINGS.openingHoursStreetFood,
    restaurantName: data?.restaurantName?.trim() || DEFAULT_SETTINGS.restaurantName,
    whatsappNumber: data?.whatsappNumber?.trim() || DEFAULT_SETTINGS.whatsappNumber,
    contactPhone: data?.contactPhone?.trim() || DEFAULT_SETTINGS.contactPhone,
    contactEmail: data?.contactEmail?.trim() || DEFAULT_SETTINGS.contactEmail,
    address: data?.address?.trim() || DEFAULT_SETTINGS.address,
    tiktokUrl: data?.tiktokUrl?.trim() || DEFAULT_SETTINGS.tiktokUrl,
    instagramUrl: data?.instagramUrl?.trim() || DEFAULT_SETTINGS.instagramUrl,
    facebookUrl: data?.facebookUrl?.trim() || DEFAULT_SETTINGS.facebookUrl,
  };
};

const getCachedSettings = (): { settings: RestaurantSettings; hasCache: boolean } => {
  try {
    const raw = localStorage.getItem(SETTINGS_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const data = parsed?.data || parsed;
      return { settings: sanitizeSettings(data), hasCache: true };
    }
  } catch (err) {
    console.warn('Failed to read settings from cache', err);
  }
  return { settings: DEFAULT_SETTINGS, hasCache: false };
};

interface SettingsContextType {
  settings: RestaurantSettings;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Stale-While-Revalidate: hydrate instantly from cache or fallback defaults
  const [settings, setSettings] = useState<RestaurantSettings>(() => getCachedSettings().settings);
  const [isLoading, setIsLoading] = useState<boolean>(() => !getCachedSettings().hasCache);

  const fetchSettings = useCallback(async () => {
    try {
      const data = await publicApi.getSettings();
      if (data) {
        const sanitized = sanitizeSettings(data);
        setSettings(sanitized);

        // Persist to local cache with timestamp
        try {
          localStorage.setItem(
            SETTINGS_CACHE_KEY,
            JSON.stringify({ data: sanitized, timestamp: Date.now() })
          );
        } catch (storageErr) {
          console.warn('Failed to save settings to local cache', storageErr);
        }
      }
    } catch (err) {
      console.warn('Could not load restaurant settings from API, using fallback/cached values:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();

    // Listen for storage events across tabs to keep settings synchronized in real-time
    const handleStorage = (e: StorageEvent) => {
      if (e.key === SETTINGS_CACHE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          const data = parsed?.data || parsed;
          if (data) {
            setSettings(sanitizeSettings(data));
          }
        } catch {}
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, [fetchSettings]);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        isLoading,
        refetch: fetchSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
