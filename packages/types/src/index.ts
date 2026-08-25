export const UserRole = {
  Developer: 'developer',
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
  Delivery: 'delivery',
  DineIn: 'dine_in',
  Pickup: 'pickup',
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

export interface DeliveryZoneResponse {
  _id: string;
  name: string;
  fee: number;
  estimatedMinutes?: number;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface RestaurantSettings {
  _id?: string;
  restaurantName: string;
  whatsappNumber: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  tiktokUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  openingHoursRestaurant?: string;
  openingHoursStreetFood?: string;
  updatedAt?: string;
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

export interface AuditLogResponse {
  _id: string;
  userId?: string;
  userName: string;
  userEmail: string;
  userRole: UserRoleType | 'system';
  action: string;
  resource: string;
  resourceId?: string;
  description: string;
  details?: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
}
