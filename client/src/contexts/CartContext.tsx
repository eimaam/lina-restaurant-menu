import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CartItem, MenuItemResponse, MenuItemSize, SelectedOptionItem } from '../types';

interface CartContextType {
  items: CartItem[];
  addItem: (
    menuItem: MenuItemResponse,
    quantity: number,
    selectedSize?: MenuItemSize,
    selectedOptions?: SelectedOptionItem[],
    specialInstructions?: string
  ) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, newQuantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  totalItemsCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('lina_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('lina_cart_items', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to persist cart in storage', e);
    }
  }, [items]);

  const generateCartItemId = (
    itemId: string,
    size?: MenuItemSize,
    options?: SelectedOptionItem[]
  ): string => {
    let key = itemId;
    if (size) key += `_size:${size.name}`;
    if (options && options.length > 0) {
      const sortedOpts = [...options]
        .sort((a, b) => a.optionName.localeCompare(b.optionName))
        .map((o) => `${o.groupName}:${o.optionName}`)
        .join('|');
      key += `_opts:${sortedOpts}`;
    }
    return key;
  };

  const addItem = (
    menuItem: MenuItemResponse,
    quantity: number = 1,
    selectedSize?: MenuItemSize,
    selectedOptions?: SelectedOptionItem[],
    specialInstructions?: string
  ) => {
    // Calculate unit price
    let unitPrice = menuItem.basePrice || 0;
    if (selectedSize) {
      unitPrice = selectedSize.price;
    }
    if (selectedOptions) {
      const extras = selectedOptions.reduce((sum, opt) => sum + (opt.extraPrice || 0), 0);
      unitPrice += extras;
    }

    const uniqueId = generateCartItemId(menuItem._id, selectedSize, selectedOptions);

    setItems((prevItems) => {
      const existingIdx = prevItems.findIndex((item) => item.id === uniqueId);
      if (existingIdx > -1) {
        const updated = [...prevItems];
        updated[existingIdx].quantity += quantity;
        if (specialInstructions) {
          updated[existingIdx].specialInstructions = specialInstructions;
        }
        return updated;
      }

      return [
        ...prevItems,
        {
          id: uniqueId,
          menuItem,
          selectedSize,
          selectedOptions,
          quantity,
          unitPrice,
          specialInstructions,
        },
      ];
    });
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const subtotal = items.reduce((acc, curr) => acc + curr.unitPrice * curr.quantity, 0);
  const totalItemsCount = items.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        totalItemsCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
