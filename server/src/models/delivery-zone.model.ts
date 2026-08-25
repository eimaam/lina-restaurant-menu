import mongoose, { Document, Schema } from 'mongoose';

export interface IDeliveryZone extends Document {
  name: string;
  fee: number;
  estimatedMinutes?: number;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DeliveryZoneSchema = new Schema<IDeliveryZone>(
  {
    name: { type: String, required: true, trim: true },
    fee: { type: Number, required: true, min: 0 },
    estimatedMinutes: { type: Number, default: 45 },
    description: { type: String, trim: true },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
  }
);

DeliveryZoneSchema.index({ sortOrder: 1, name: 1 });

export const DeliveryZone = mongoose.model<IDeliveryZone>('DeliveryZone', DeliveryZoneSchema);
