import mongoose, { Document, Schema } from 'mongoose';
import { BannerType, BannerTypeType } from '../types';

export interface IBanner extends Document {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  bannerType: BannerTypeType;
  actionLink?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const BannerSchema = new Schema<IBanner>(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true },
    imageUrl: { type: String, trim: true },
    bannerType: {
      type: String,
      enum: Object.values(BannerType),
      default: BannerType.MealPromo,
    },
    actionLink: { type: String, trim: true },
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0, index: true },
  },
  {
    timestamps: true,
  }
);

export const Banner = mongoose.model<IBanner>('Banner', BannerSchema);
