import { formatNaira } from '@lina/ui';
import type { CartItem, FulfillmentTypeType } from '@lina/types';

export const RESTAURANT_WHATSAPP_NUMBER = '2349165196622'; // 09165196622 in international format

interface FormatWhatsAppOrderParams {
  orderNumber: string;
  customerName?: string;
  customerPhone?: string;
  fulfillmentType: FulfillmentTypeType;
  tableNumber?: string;
  deliveryAddress?: string;
  items: CartItem[];
  subtotal: number;
  orderNotes?: string;
}

export function formatWhatsAppOrderMessage({
  orderNumber,
  customerName,
  customerPhone,
  fulfillmentType,
  tableNumber,
  deliveryAddress,
  items,
  subtotal,
  orderNotes,
}: FormatWhatsAppOrderParams): string {
  let fulfillmentLabel = 'Dine-in';
  let locationDetails = `Table / Seat #${tableNumber || 'N/A'}`;

  if (fulfillmentType === 'pickup') {
    fulfillmentLabel = 'Takeaway / Pickup';
    locationDetails = 'Pickup at Restaurant Counter (27/29 6th Ave, Gwarinpa)';
  } else if (fulfillmentType === 'delivery') {
    fulfillmentLabel = 'Home Delivery';
    locationDetails = deliveryAddress || 'Address not specified';
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

  let message = `🍽️ *NEW ORDER - #${orderNumber}*\n`;
  message += `--------------------------------\n`;
  message += `👤 *Customer:* ${customerName?.trim() || 'Valued Guest'}\n`;
  if (customerPhone?.trim()) {
    message += `📞 *Phone:* ${customerPhone.trim()}\n`;
  }
  message += `🛵 *Fulfillment:* ${fulfillmentLabel}\n`;
  message += `📍 *Location / Address:* ${locationDetails}\n\n`;

  message += `🛒 *Order Items:*\n${itemsText}\n\n`;

  if (orderNotes?.trim()) {
    message += `📝 *Special Instructions:* ${orderNotes.trim()}\n\n`;
  }

  message += `💰 *Subtotal:* ${formatNaira(subtotal)}\n`;
  message += `--------------------------------\n`;
  message += `_Order generated via Lina Digital Menu._\n`;
  message += `Please confirm total with delivery fee and share payment details.`;

  return message;
}

export function generateWhatsAppDeepLink(params: FormatWhatsAppOrderParams): string {
  const message = formatWhatsAppOrderMessage(params);
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${RESTAURANT_WHATSAPP_NUMBER}?text=${encodedText}`;
}
