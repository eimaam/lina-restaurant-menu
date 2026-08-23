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
