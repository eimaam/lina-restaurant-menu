import { Request, Response } from 'express';
import { RestaurantSettings, IRestaurantSettings } from '../models/settings.model';
import { logAudit } from '../services/audit.service';

// In-memory cache for high-frequency settings reads
let cachedSettings: IRestaurantSettings | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

export const getSettings = async (_req: Request, res: Response): Promise<void> => {
  try {
    const now = Date.now();
    if (cachedSettings && now - lastCacheTime < CACHE_TTL_MS) {
      res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
      res.json({ success: true, data: cachedSettings, cached: true });
      return;
    }

    let settings = await RestaurantSettings.findOne();
    if (!settings) {
      settings = await RestaurantSettings.create({});
    }

    cachedSettings = settings;
    lastCacheTime = now;

    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    res.json({ success: true, data: settings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const updateData = req.body;
    let settings = await RestaurantSettings.findOne();
    if (!settings) {
      settings = await RestaurantSettings.create(updateData);
    } else {
      settings = await RestaurantSettings.findByIdAndUpdate(settings._id, updateData, {
        new: true,
        runValidators: true,
      });
    }

    // Invalidate server in-memory cache immediately
    cachedSettings = settings;
    lastCacheTime = Date.now();

    await logAudit(req, {
      action: 'update',
      resource: 'Settings',
      description: 'Updated restaurant identity, contact hotlines, address and social handles.',
      details: {
        whatsappNumber: updateData.whatsappNumber,
        contactPhone: updateData.contactPhone,
        address: updateData.address,
      },
    });

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.json({ success: true, data: settings, message: 'Settings updated successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
