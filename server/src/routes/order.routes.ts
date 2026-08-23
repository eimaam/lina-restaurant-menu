import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getOrderStats,
} from '../controllers/order.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Public: Log order on checkout
router.post('/', createOrder);

// Staff & Admin Protected
router.get('/', authenticate, getOrders);
router.get('/stats', authenticate, getOrderStats);
router.get('/:id', authenticate, getOrderById);
router.patch('/:id/status', authenticate, updateOrderStatus);

export default router;
