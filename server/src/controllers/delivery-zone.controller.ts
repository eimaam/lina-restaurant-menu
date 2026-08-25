import { Request, Response } from 'express';
import { DeliveryZone } from '../models/delivery-zone.model';
import { logAudit } from '../services/audit.service';

export const getDeliveryZones = async (req: Request, res: Response): Promise<void> => {
  try {
    const { all } = req.query;
    const filter = all === 'true' ? {} : { isActive: true };
    const zones = await DeliveryZone.find(filter).sort({ sortOrder: 1, name: 1 });
    res.json({ success: true, data: zones });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createDeliveryZone = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, fee, estimatedMinutes, description, sortOrder, isActive } = req.body;
    if (!name || fee === undefined) {
      res.status(400).json({ success: false, message: 'Name and delivery fee are required.' });
      return;
    }

    const zone = await DeliveryZone.create({
      name: name.trim(),
      fee: Number(fee),
      estimatedMinutes: estimatedMinutes ? Number(estimatedMinutes) : 45,
      description: description?.trim(),
      sortOrder: sortOrder ? Number(sortOrder) : 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    await logAudit(req, {
      action: 'create',
      resource: 'DeliveryZone',
      resourceId: zone._id.toString(),
      description: `Created delivery coverage zone "${zone.name}" with fee ₦${zone.fee}.`,
      details: { name: zone.name, fee: zone.fee, estimatedMinutes: zone.estimatedMinutes },
    });

    res.status(201).json({ success: true, data: zone });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDeliveryZone = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const zone = await DeliveryZone.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!zone) {
      res.status(404).json({ success: false, message: 'Delivery zone not found.' });
      return;
    }

    await logAudit(req, {
      action: 'update',
      resource: 'DeliveryZone',
      resourceId: zone._id.toString(),
      description: `Updated delivery zone "${zone.name}".`,
      details: { name: zone.name, fee: zone.fee, isActive: zone.isActive },
    });

    res.json({ success: true, data: zone });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteDeliveryZone = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const zone = await DeliveryZone.findByIdAndDelete(id);
    if (!zone) {
      res.status(404).json({ success: false, message: 'Delivery zone not found.' });
      return;
    }

    await logAudit(req, {
      action: 'delete',
      resource: 'DeliveryZone',
      resourceId: zone._id.toString(),
      description: `Deleted delivery zone "${zone.name}".`,
      details: { name: zone.name },
    });

    res.json({ success: true, message: 'Delivery zone deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
