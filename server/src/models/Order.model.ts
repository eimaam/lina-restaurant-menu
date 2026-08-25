import mongoose, { Document, Schema } from 'mongoose';
import {
  FulfillmentType,
  FulfillmentTypeType,
  OrderStatus,
  OrderStatusType,
  OrderItemLine,
} from '../types';

export interface IOrder extends Document {
  orderNumber: string;
  customer: {
    name?: string;
    phone?: string;
  };
  fulfillmentType: FulfillmentTypeType;
  tableNumber?: string;
  deliveryZoneId?: string;
  deliveryZoneName?: string;
  deliveryFee?: number;
  deliveryAddress?: string;
  items: OrderItemLine[];
  subtotal: number;
  total?: number;
  orderNotes?: string;
  status: OrderStatusType;
  whatsappDeepLinkUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemLineSchema = new Schema(
  {
    menuItemId: { type: Schema.Types.ObjectId, ref: 'MenuItem' },
    name: { type: String, required: true },
    image: { type: String },
    selectedSize: {
      name: { type: String },
      price: { type: Number },
    },
    selectedOptions: [
      {
        groupName: { type: String },
        optionName: { type: String },
        extraPrice: { type: Number, default: 0 },
      },
    ],
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    specialInstructions: { type: String },
    lineTotal: { type: Number, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customer: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
    },
    fulfillmentType: {
      type: String,
      enum: Object.values(FulfillmentType),
      required: true,
      index: true,
    },
    tableNumber: { type: String, trim: true },
    deliveryZoneId: { type: Schema.Types.ObjectId, ref: 'DeliveryZone' },
    deliveryZoneName: { type: String, trim: true },
    deliveryFee: { type: Number, default: 0 },
    deliveryAddress: { type: String, trim: true },
    items: { type: [OrderItemLineSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    total: { type: Number, min: 0 },
    orderNotes: { type: String, trim: true },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Received,
      index: true,
    },
    whatsappDeepLinkUrl: { type: String },
  },
  {
    timestamps: true,
  }
);

OrderSchema.index({ createdAt: -1 });

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
