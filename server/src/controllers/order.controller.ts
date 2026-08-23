import { Request, Response } from 'express';
import { Order } from '../models/Order.model';
import { OrderStatus } from '../types';

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      customer,
      fulfillmentType,
      tableNumber,
      deliveryAddress,
      items,
      subtotal,
      orderNotes,
      whatsappDeepLinkUrl,
    } = req.body;

    if (!fulfillmentType || !items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, message: 'Fulfillment type and ordered items are required.' });
      return;
    }

    // Generate unique human-readable Order Number: LRB-XXXX (e.g. #LRB-1082)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `LRB-${randomSuffix}`;

    const order = await Order.create({
      orderNumber,
      customer: customer || {},
      fulfillmentType,
      tableNumber: tableNumber?.trim(),
      deliveryAddress: deliveryAddress?.trim(),
      items,
      subtotal: Number(subtotal) || 0,
      orderNotes: orderNotes?.trim(),
      status: OrderStatus.Received,
      whatsappDeepLinkUrl,
    });

    res.status(201).json({
      success: true,
      data: order,
      message: 'Order logged successfully.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to record order.' });
  }
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, fulfillmentType, search, limit = 50, page = 1 } = req.query;
    const filter: any = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (fulfillmentType && fulfillmentType !== 'all') {
      filter.fulfillmentType = fulfillmentType;
    }

    if (search && typeof search === 'string' && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { orderNumber: regex },
        { 'customer.name': regex },
        { 'customer.phone': regex },
        { tableNumber: regex },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        orders,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await Order.findOne({
      $or: [{ _id: req.params.id }, { orderNumber: req.params.id }],
    });

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    res.json({ success: true, data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !Object.values(OrderStatus).includes(status)) {
      res.status(400).json({ success: false, message: 'Valid status is required.' });
      return;
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    res.json({ success: true, data: order, message: `Order status updated to ${status}.` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrderStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalOrdersCount,
      todayOrdersCount,
      revenueAggregation,
      todayRevenueAggregation,
      popularItemsAggregation,
      statusBreakdown,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: todayStart } }),
      Order.aggregate([
        { $match: { status: { $ne: OrderStatus.Cancelled } } },
        { $group: { _id: null, totalRevenue: { $sum: '$subtotal' } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: todayStart }, status: { $ne: OrderStatus.Cancelled } } },
        { $group: { _id: null, todayRevenue: { $sum: '$subtotal' } } },
      ]),
      Order.aggregate([
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.name',
            orderCount: { $sum: '$items.quantity' },
            totalSales: { $sum: '$items.lineTotal' },
          },
        },
        { $sort: { orderCount: -1 } },
        { $limit: 5 },
      ]),
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    const totalRevenue = revenueAggregation[0]?.totalRevenue || 0;
    const todayRevenue = todayRevenueAggregation[0]?.todayRevenue || 0;

    res.json({
      success: true,
      data: {
        totalOrdersCount,
        todayOrdersCount,
        totalRevenue,
        todayRevenue,
        popularItems: popularItemsAggregation.map((i) => ({
          name: i._id,
          orderCount: i.orderCount,
          totalSales: i.totalSales,
        })),
        statusBreakdown: Object.fromEntries(statusBreakdown.map((s) => [s._id, s.count])),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
