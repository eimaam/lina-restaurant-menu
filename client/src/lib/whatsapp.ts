import { formatNaira } from '@lina/ui';
import type { CartItem, FulfillmentTypeType } from '@lina/types';

export const DEFAULT_RESTAURANT_WHATSAPP_NUMBER = '2349165196622';

interface FormatWhatsAppOrderParams {
  orderNumber: string;
  customerName?: string;
  customerPhone?: string;
  fulfillmentType: FulfillmentTypeType;
  tableNumber?: string;
  deliveryZoneName?: string;
  deliveryFee?: number;
  deliveryAddress?: string;
  items: CartItem[];
  subtotal: number;
  orderNotes?: string;
  whatsappNumber?: string;
}

export function formatWhatsAppOrderMessage({
  orderNumber,
  customerName,
  customerPhone,
  fulfillmentType,
  tableNumber,
  deliveryZoneName,
  deliveryFee = 0,
  deliveryAddress,
  items,
  subtotal,
  orderNotes,
}: FormatWhatsAppOrderParams): string {
  let fulfillmentLabel = 'Home Delivery';
  let locationDetails = '';

  if (fulfillmentType === 'delivery') {
    fulfillmentLabel = 'Home Delivery';
    locationDetails = `${deliveryAddress || 'Address not specified'}${
      deliveryZoneName ? ` (${deliveryZoneName})` : ''
    }`;
  } else if (fulfillmentType === 'dine_in') {
    fulfillmentLabel = 'Dine-in';
    locationDetails = `Table / Seat #${tableNumber || 'N/A'}`;
  } else if (fulfillmentType === 'pickup') {
    fulfillmentLabel = 'Takeaway / Pickup';
    locationDetails = 'Pickup at Restaurant Counter (7/29 6th Ave, Gwarinpa)';
  }

  // Format Items
  const itemsText = items
    .map((item) => {
      let line = `• ${item.quantity}x ${item.menuItem.name}`;
      if (item.selectedSize) {
        line += ` (${item.selectedSize.name})`;
      }
      if (item.selectedOptions && item.selectedOptions.length > 0) {
        const optNames = item.selectedOptions.map((o) => o.optionName).join(', ');
        line += ` [${optNames}]`;
      }
      line += ` - ${formatNaira(item.unitPrice * item.quantity)}`;

      if (item.specialInstructions?.trim()) {
        line += `\n  ↳ _Note: ${item.specialInstructions.trim()}_`;
      }
      return line;
    })
    .join('\n');

  const grandTotal = subtotal + (fulfillmentType === 'delivery' ? deliveryFee : 0);

  let message = `🍽️ *LINA RESTAURANT, BAR AND STREET FOOD - ORDER #${orderNumber}*\n`;
  message += `--------------------------------\n`;
  message += `👤 *Customer:* ${customerName?.trim() || 'Valued Guest'}\n`;
  if (customerPhone?.trim()) {
    message += `📞 *Phone:* ${customerPhone.trim()}\n`;
  }
  message += `🛵 *Fulfillment:* ${fulfillmentLabel}\n`;
  message += `📍 *Location / Destination:* ${locationDetails}\n\n`;

  message += `🛒 *Order Items:*\n${itemsText}\n\n`;

  if (orderNotes?.trim()) {
    message += `📝 *Special Instructions:* ${orderNotes.trim()}\n\n`;
  }

  message += `💰 *Items Subtotal:* ${formatNaira(subtotal)}\n`;
  if (fulfillmentType === 'delivery' && deliveryFee > 0) {
    message += `🛵 *Delivery Fee (${deliveryZoneName || 'Zone'}):* ${formatNaira(deliveryFee)}\n`;
    message += `💳 *Total Amount Due:* ${formatNaira(grandTotal)}\n`;
  } else {
    message += `💳 *Total Amount Due:* ${formatNaira(grandTotal)}\n`;
  }
  message += `--------------------------------\n`;
  message += `_Order sent via Lina Digital Menu._\n`;
  message += `Please reply with payment account details to confirm dispatch!`;

  return message;
}

export function generateWhatsAppDeepLink(params: FormatWhatsAppOrderParams): string {
  const message = formatWhatsAppOrderMessage(params);
  const encodedText = encodeURIComponent(message);
  const targetPhone = params.whatsappNumber?.replace(/[^0-9]/g, '') || DEFAULT_RESTAURANT_WHATSAPP_NUMBER;
  return `https://wa.me/${targetPhone}?text=${encodedText}`;
}
