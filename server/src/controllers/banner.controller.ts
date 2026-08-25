import { Request, Response } from 'express';
import { Banner } from '../models/Banner.model';
import { BannerType } from '../types';
import { logAudit } from '../services/audit.service';

export const getBanners = async (req: Request, res: Response): Promise<void> => {
  try {
    const { includeInactive } = req.query;
    const filter: any = {};
    if (!includeInactive || includeInactive === 'false') {
      filter.isActive = true;
    }

    const banners = await Banner.find(filter).sort({ sortOrder: 1, createdAt: -1 });
    res.json({ success: true, data: banners });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createBanner = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, subtitle, imageUrl, bannerType, actionLink, isActive, sortOrder } = req.body;
    if (!title) {
      res.status(400).json({ success: false, message: 'Banner title is required.' });
      return;
    }

    const banner = await Banner.create({
      title: title.trim(),
      subtitle: subtitle?.trim(),
      imageUrl: imageUrl?.trim(),
      bannerType: bannerType || BannerType.MealPromo,
      actionLink: actionLink?.trim(),
      isActive: isActive !== undefined ? isActive : true,
      sortOrder: Number(sortOrder) || 0,
    });

    await logAudit(req, {
      action: 'create',
      resource: 'Banner',
      resourceId: banner._id.toString(),
      description: `Created promotional banner "${banner.title}".`,
      details: { title: banner.title, bannerType: banner.bannerType },
    });

    res.status(201).json({ success: true, data: banner, message: 'Banner created successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBanner = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const banner = await Banner.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!banner) {
      res.status(404).json({ success: false, message: 'Banner not found.' });
      return;
    }

    await logAudit(req, {
      action: 'update',
      resource: 'Banner',
      resourceId: banner._id.toString(),
      description: `Updated banner "${banner.title}".`,
      details: { title: banner.title, isActive: banner.isActive },
    });

    res.json({ success: true, data: banner, message: 'Banner updated successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleBannerActive = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const banner = await Banner.findById(id);
    if (!banner) {
      res.status(404).json({ success: false, message: 'Banner not found.' });
      return;
    }

    banner.isActive = !banner.isActive;
    await banner.save();

    await logAudit(req, {
      action: banner.isActive ? 'activate' : 'deactivate',
      resource: 'Banner',
      resourceId: banner._id.toString(),
      description: `${banner.isActive ? 'Activated' : 'Deactivated'} banner "${banner.title}".`,
      details: { title: banner.title, isActive: banner.isActive },
    });

    res.json({
      success: true,
      data: banner,
      message: `Banner is now ${banner.isActive ? 'Active' : 'Inactive'}.`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBanner = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await Banner.findByIdAndDelete(id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Banner not found.' });
      return;
    }

    await logAudit(req, {
      action: 'delete',
      resource: 'Banner',
      resourceId: deleted._id.toString(),
      description: `Deleted banner "${deleted.title}".`,
      details: { title: deleted.title },
    });

    res.json({ success: true, message: 'Banner deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
