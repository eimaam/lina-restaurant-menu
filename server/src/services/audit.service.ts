import { Request } from 'express';
import { AuditLog } from '../models/audit-log.model';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export interface LogAuditParams {
  action: string;
  resource: string;
  resourceId?: string;
  description: string;
  details?: Record<string, any>;
}

export const logAudit = async (
  req: Request | AuthenticatedRequest,
  params: LogAuditParams
): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const user = authReq.user;

    const ipAddress =
      (req.headers['x-forwarded-for'] as string) ||
      req.socket.remoteAddress ||
      '';

    await AuditLog.create({
      userId: user?._id,
      userName: user?.name || 'System / Guest',
      userEmail: user?.email || 'system@linarestaurant.com',
      userRole: user?.role || 'system',
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId,
      description: params.description,
      details: params.details,
      ipAddress: typeof ipAddress === 'string' ? ipAddress.split(',')[0].trim() : '',
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
};
