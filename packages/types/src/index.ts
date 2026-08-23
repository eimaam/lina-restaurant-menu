export const UserRole = {
  Admin: 'admin',
  Staff: 'staff',
} as const;
export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

export const OptionSelectionType = {
  SingleSelect: 'single_select',
  MultiSelect: 'multi_select',
} as const;
export type OptionSelectionTypeType = (typeof OptionSelectionType)[keyof typeof OptionSelectionType];

export const BannerType = {
  MealPromo: 'meal_promo',
  Announcement: 'announcement',
  SpecialDiscount: 'special_discount',
} as const;
export type BannerTypeType = (typeof BannerType)[keyof typeof BannerType];

export const FulfillmentType = {
  DineIn: 'dine_in',
  Pickup: 'pickup',
  Delivery: 'delivery',
} as const;
export type FulfillmentTypeType = (typeof FulfillmentType)[keyof typeof FulfillmentType];

export const OrderStatus = {
  Received: 'received',
  Confirmed: 'confirmed',
  Preparing: 'preparing',
  Completed: 'completed',
  Cancelled: 'cancelled',
} as const;
export type OrderStatusType = (typeof OrderStatus)[keyof typeof OrderStatus];

export interface MenuItemSize {
  name: string;
  price: number;
  isDefault?: boolean;
}

export interface MenuItemOptionItem {
  name: string;
  extraPrice: number;
  isAvailable?: boolean;
}

export interface MenuItemOptionGroup {
  name: string;
  required: boolean;
  minSelections?: number;
  maxSelections?: number;
  selectionType: OptionSelectionTypeType;
  options: MenuItemOptionItem[];
}

export interface SelectedOptionItem {
  groupName: string;
  optionName: string;
  extraPrice: number;
}

export interface MenuCategoryResponse {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
  itemCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItemResponse {
  _id: string;
  categoryId: string | MenuCategoryResponse;
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
  createdAt: string;
  updatedAt: string;
}

export interface BannerResponse {
  _id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  bannerType: BannerTypeType;
  actionLink?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItemLine {
  menuItemId: string;
  name: string;
  image?: string;
  selectedSize?: MenuItemSize;
  selectedOptions?: SelectedOptionItem[];
  unitPrice: number;
  quantity: number;
  specialInstructions?: string;
  lineTotal: number;
}

export interface OrderResponse {
  _id: string;
  orderNumber: string;
  customer?: {
    name?: string;
    phone?: string;
  };
  fulfillmentType: FulfillmentTypeType;
  tableNumber?: string;
  deliveryAddress?: string;
  items: OrderItemLine[];
  subtotal: number;
  orderNotes?: string;
  status: OrderStatusType;
  whatsappDeepLinkUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserResponse {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRoleType;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt?: string;
}

export interface CartItem {
  id: string;
  menuItem: MenuItemResponse;
  selectedSize?: MenuItemSize;
  selectedOptions?: SelectedOptionItem[];
  quantity: number;
  unitPrice: number;
  specialInstructions?: string;
}
