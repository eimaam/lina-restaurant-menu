import { Request, Response } from 'express';
import { AuditLog } from '../models/audit-log.model';

export const getAuditLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '30',
      action,
      resource,
      userRole,
      search,
    } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 30;
    const skip = (pageNum - 1) * limitNum;

    const filter: Record<string, any> = {};

    if (action) {
      filter.action = action;
    }

    if (resource) {
      filter.resource = resource;
    }

    if (userRole) {
      filter.userRole = userRole;
    }

    if (search) {
      filter.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      AuditLog.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        logs,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
