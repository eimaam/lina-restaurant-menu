import mongoose, { Document, Schema } from 'mongoose';
import {
  MenuItemSize,
  MenuItemOptionGroup,
  OptionSelectionType,
} from '../types';

export interface IMenuItem extends Document {
  categoryId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  images: string[];
  basePrice: number;
  hasSizes: boolean;
  sizes: MenuItemSize[];
  optionGroups: MenuItemOptionGroup[];
  estimatedPrepTimeMinutes: number;
  isAvailable: boolean;
  isChefSpecial: boolean;
  tags: string[];
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const MenuItemSizeSchema = new Schema<MenuItemSize>(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const MenuItemOptionItemSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    extraPrice: { type: Number, default: 0, min: 0 },
    isAvailable: { type: Boolean, default: true },
  },
  { _id: false }
);

const MenuItemOptionGroupSchema = new Schema<MenuItemOptionGroup>(
  {
    name: { type: String, required: true, trim: true },
    required: { type: Boolean, default: false },
    minSelections: { type: Number, default: 0 },
    maxSelections: { type: Number, default: 1 },
    selectionType: {
      type: String,
      enum: Object.values(OptionSelectionType),
      default: OptionSelectionType.SingleSelect,
    },
    options: { type: [MenuItemOptionItemSchema], default: [] },
  },
  { _id: false }
);

const MenuItemSchema = new Schema<IMenuItem>(
  {
    categoryId: { type: Schema.Types.ObjectId, ref: 'MenuCategory', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    images: { type: [String], default: [] },
    basePrice: { type: Number, default: 0, min: 0 },
    hasSizes: { type: Boolean, default: false },
    sizes: { type: [MenuItemSizeSchema], default: [] },
    optionGroups: { type: [MenuItemOptionGroupSchema], default: [] },
    estimatedPrepTimeMinutes: { type: Number, default: 15 },
    isAvailable: { type: Boolean, default: true, index: true },
    isChefSpecial: { type: Boolean, default: false, index: true },
    tags: { type: [String], default: [] },
    sortOrder: { type: Number, default: 0, index: true },
  },
  {
    timestamps: true,
  }
);

MenuItemSchema.index({ categoryId: 1, isAvailable: 1, sortOrder: 1 });
MenuItemSchema.index({ name: 'text', description: 'text', tags: 'text' });

export const MenuItem = mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);
