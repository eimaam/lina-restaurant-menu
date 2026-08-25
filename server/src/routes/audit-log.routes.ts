import { Router } from 'express';
import { getAuditLogs } from '../controllers/audit-log.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { UserRole } from '../types';

const router = Router();

// Only Admin and Developer can view Audit Logs
router.get('/', authenticate, requireRole([UserRole.Admin, UserRole.Developer]), getAuditLogs);

export default router;
