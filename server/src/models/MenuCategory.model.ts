import mongoose, { Document, Schema } from 'mongoose';

export interface IMenuCategory extends Document {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MenuCategorySchema = new Schema<IMenuCategory>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, trim: true, unique: true, lowercase: true, index: true },
    description: { type: String, trim: true },
    icon: { type: String, trim: true },
    sortOrder: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
  }
);

export const MenuCategory = mongoose.model<IMenuCategory>('MenuCategory', MenuCategorySchema);
