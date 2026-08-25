import { Request, Response } from 'express';
import { RestaurantSettings } from '../models/settings.model';
import { logAudit } from '../services/audit.service';

export const getSettings = async (_req: Request, res: Response): Promise<void> => {
  try {
    let settings = await RestaurantSettings.findOne();
    if (!settings) {
      settings = await RestaurantSettings.create({});
    }
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

    res.json({ success: true, data: settings, message: 'Settings updated successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
