import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  Utensils,
  ShoppingBag,
  Truck,
  Send,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { PublicHeader } from '../components/layout/PublicHeader';
import { PublicFooter } from '../components/layout/PublicFooter';
import { Button, Input, WhatsAppIcon, formatNaira } from '@lina/ui';
import { useCart } from '../contexts/CartContext';
import { publicApi } from '../lib/api';
import { generateWhatsAppDeepLink } from '../lib/whatsapp';
import type { FulfillmentTypeType, CartItem, SelectedOptionItem } from '@lina/types';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, clearCart, subtotal } = useCart();

  // Fulfillment State
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentTypeType>('dine_in');
  const [tableNumber, setTableNumber] = useState<string>(
    () => sessionStorage.getItem('lina_table_number') || ''
  );
  const [customerName, setCustomerName] = useState<string>(
    () => localStorage.getItem('lina_customer_name') || ''
  );
  const [customerPhone, setCustomerPhone] = useState<string>(
    () => localStorage.getItem('lina_customer_phone') || ''
  );
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState<string>('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [placedOrderInfo, setPlacedOrderInfo] = useState<{
    orderNumber: string;
    whatsappUrl: string;
  } | null>(null);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (items.length === 0) {
      setErrorMessage('Your cart is empty. Please add menu items before checkout.');
      return;
    }

    // Validation
    if (fulfillmentType === 'dine_in' && !tableNumber.trim()) {
      setErrorMessage('Please enter your Table / Seat Number.');
      return;
    }

    if ((fulfillmentType === 'pickup' || fulfillmentType === 'delivery') && !customerName.trim()) {
      setErrorMessage('Please enter your name.');
      return;
    }

    if ((fulfillmentType === 'pickup' || fulfillmentType === 'delivery') && !customerPhone.trim()) {
      setErrorMessage('Please enter your phone number.');
      return;
    }

    if (fulfillmentType === 'delivery' && !deliveryAddress.trim()) {
      setErrorMessage('Please enter your full delivery address in Abuja.');
      return;
    }

    setSubmitting(true);

    try {
      // Save customer details in storage for next time
      if (customerName) localStorage.setItem('lina_customer_name', customerName.trim());
      if (customerPhone) localStorage.setItem('lina_customer_phone', customerPhone.trim());
      if (tableNumber) sessionStorage.setItem('lina_table_number', tableNumber.trim());

      const orderNumber = `LRB-${Math.floor(1000 + Math.random() * 9000)}`;

      // Generate WhatsApp link
      const whatsappUrl = generateWhatsAppDeepLink({
        orderNumber,
        customerName: customerName.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        fulfillmentType,
        tableNumber: tableNumber.trim() || undefined,
        deliveryAddress: deliveryAddress.trim() || undefined,
        items,
        subtotal,
        orderNotes: orderNotes.trim() || undefined,
      });

      // 1. Asynchronously log order in DB
      try {
        await publicApi.logOrder({
          orderNumber,
          customer: {
            name: customerName.trim() || undefined,
            phone: customerPhone.trim() || undefined,
          },
          fulfillmentType,
          tableNumber: tableNumber.trim() || undefined,
          deliveryAddress: deliveryAddress.trim() || undefined,
          items: items.map((i: CartItem) => ({
            menuItemId: i.menuItem._id,
            name: i.menuItem.name,
            selectedSize: i.selectedSize,
            selectedOptions: i.selectedOptions,
            unitPrice: i.unitPrice,
            quantity: i.quantity,
            specialInstructions: i.specialInstructions,
            lineTotal: i.unitPrice * i.quantity,
          })),
          subtotal,
          orderNotes: orderNotes.trim() || undefined,
          whatsappDeepLinkUrl: whatsappUrl,
        });
      } catch (logErr) {
        console.warn('DB order logging encountered error, proceeding with WhatsApp redirect', logErr);
      }

      // 2. Set placed order info
      setPlacedOrderInfo({ orderNumber, whatsappUrl });
      clearCart();

      // 3. Trigger WhatsApp Deep Link
      window.location.href = whatsappUrl;
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // If order was successfully placed, render Order Success View
  if (placedOrderInfo) {
    return (
      <div className="min-h-screen bg-surface flex flex-col justify-between">
        <PublicHeader />
        <main className="flex-1 max-w-lg mx-auto px-4 py-16 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 size={40} />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container text-on-primary-container text-xs font-bold uppercase">
              Order #{placedOrderInfo.orderNumber}
            </div>
            <h1 className="font-serif font-black text-3xl text-on-surface">
              Order Dispatched!
            </h1>
            <p className="text-sm text-on-surface-variant leading-relaxed max-w-sm mx-auto">
              Your order payload has been formatted and routed to Lina Restaurant's official WhatsApp line.
            </p>
          </div>

          <div className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant text-xs text-on-surface-variant space-y-2">
            <p>If WhatsApp did not automatically open on your device, click below:</p>
            <a
              href={placedOrderInfo.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#1ebd59] text-white font-bold text-sm rounded-xl shadow-xs transition-all"
            >
              <WhatsAppIcon size={18} />
              <span>Open in WhatsApp</span>
            </a>
          </div>

          <div className="pt-4">
            <Link to="/menu">
              <Button variant="outline" size="md">
                <ArrowLeft size={16} />
                <span>Return to Menu</span>
              </Button>
            </Link>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  // If Cart is Empty
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-surface flex flex-col justify-between">
        <PublicHeader />
        <main className="flex-1 max-w-md mx-auto px-4 py-20 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto text-2xl">
            <ShoppingBag size={28} />
          </div>
          <div>
            <h1 className="font-serif font-bold text-2xl text-on-surface">Your Cart is Empty</h1>
            <p className="text-xs text-on-surface-variant mt-1.5 max-w-xs mx-auto">
              Explore our digital catalog to add delicious soups, grills, shawarma, tea, and drinks.
            </p>
          </div>
          <Link to="/menu">
            <Button variant="gold" size="lg">
              Explore Digital Menu
            </Button>
          </Link>
        </main>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-between">
      <PublicHeader />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Back Link */}
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant">
          <Link
            to="/menu"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-on-surface-variant hover:text-primary transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Digital Menu</span>
          </Link>
          <span className="font-serif font-bold text-sm text-on-surface">
            Checkout ({items.length} {items.length === 1 ? 'dish' : 'dishes'})
          </span>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
          {/* Left Column: Cart Items List */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="font-serif font-bold text-xl text-on-surface">Order Items Review</h2>

            <div className="space-y-3">
              {items.map((item: CartItem) => (
                <div
                  key={item.id}
                  className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-4 flex items-start justify-between gap-4 shadow-card"
                >
                  <div className="flex-1 space-y-1">
                    <h3 className="font-serif font-bold text-base text-on-surface">
                      {item.menuItem.name}
                    </h3>

                    {item.selectedSize && (
                      <div className="text-xs font-semibold text-primary">
                        Size: {item.selectedSize.name}
                      </div>
                    )}

                    {item.selectedOptions && item.selectedOptions.length > 0 && (
                      <div className="text-[11px] text-on-surface-variant">
                        Options: {item.selectedOptions.map((o: SelectedOptionItem) => o.optionName).join(', ')}
                      </div>
                    )}

                    {item.specialInstructions && (
                      <div className="text-[11px] text-on-surface-variant/80 italic">
                        Note: "{item.specialInstructions}"
                      </div>
                    )}

                    <div className="font-serif font-black text-sm text-secondary pt-1">
                      {formatNaira(item.unitPrice * item.quantity)}
                    </div>
                  </div>

                  {/* Quantity Actions */}
                  <div className="flex flex-col items-end gap-2">
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-on-surface-variant hover:text-error transition-colors p-1"
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>

                    <div className="flex items-center gap-2 bg-surface-container rounded-xl p-1 border border-outline-variant">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 rounded-lg bg-surface hover:bg-surface-container-high flex items-center justify-center text-xs"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="font-bold text-xs w-4 text-center">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 rounded-lg bg-surface hover:bg-surface-container-high flex items-center justify-center text-xs"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* General Kitchen Notes */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Order Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Any general requests or notes for the cashier / kitchen..."
                className="w-full bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/50 text-xs rounded-xl p-3 border border-outline-variant focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Right Column: Fulfillment & WhatsApp Dispatch */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-6 space-y-6 shadow-ambient">
              <h2 className="font-serif font-bold text-xl text-on-surface">Fulfillment & Delivery</h2>

              {/* 1. Fulfillment Mode Selector */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setFulfillmentType('dine_in')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    fulfillmentType === 'dine_in'
                      ? 'border-primary bg-primary-container/40 text-on-primary-container font-bold ring-2 ring-primary/20'
                      : 'border-outline-variant hover:border-primary/40 bg-surface-container-low text-on-surface-variant'
                  }`}
                >
                  <Utensils size={18} className="mx-auto mb-1 text-primary" />
                  <div className="text-xs">Dine-In</div>
                </button>

                <button
                  type="button"
                  onClick={() => setFulfillmentType('pickup')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    fulfillmentType === 'pickup'
                      ? 'border-primary bg-primary-container/40 text-on-primary-container font-bold ring-2 ring-primary/20'
                      : 'border-outline-variant hover:border-primary/40 bg-surface-container-low text-on-surface-variant'
                  }`}
                >
                  <ShoppingBag size={18} className="mx-auto mb-1 text-primary" />
                  <div className="text-xs">Takeaway</div>
                </button>

                <button
                  type="button"
                  onClick={() => setFulfillmentType('delivery')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    fulfillmentType === 'delivery'
                      ? 'border-primary bg-primary-container/40 text-on-primary-container font-bold ring-2 ring-primary/20'
                      : 'border-outline-variant hover:border-primary/40 bg-surface-container-low text-on-surface-variant'
                  }`}
                >
                  <Truck size={18} className="mx-auto mb-1 text-primary" />
                  <div className="text-xs">Delivery</div>
                </button>
              </div>

              {/* 2. Dynamic Input Fields */}
              <div className="space-y-4">
                {fulfillmentType === 'dine_in' && (
                  <Input
                    label="Table / Seat / Bar Number *"
                    placeholder="e.g. Table 4, VIP Lounge 2"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    required
                  />
                )}

                <Input
                  label="Your Full Name"
                  placeholder="e.g. Emeka Abubakar"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required={fulfillmentType !== 'dine_in'}
                />

                <Input
                  label="Phone Number"
                  placeholder="e.g. 08012345678"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required={fulfillmentType !== 'dine_in'}
                />

                {fulfillmentType === 'delivery' && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      Delivery Street Address in Abuja *
                    </label>
                    <textarea
                      rows={2}
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="e.g. House 14, 4th Avenue, Gwarinpa Estate, Abuja"
                      className="w-full bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/50 text-xs rounded-xl p-3 border border-outline-variant focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                )}
              </div>

              {/* 3. Subtotal Summary */}
              <div className="pt-4 border-t border-surface-container space-y-2">
                <div className="flex items-center justify-between text-sm text-on-surface-variant">
                  <span>Subtotal ({items.length} items)</span>
                  <span className="font-semibold text-on-surface">{formatNaira(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-on-surface-variant">
                  <span>Delivery / Service</span>
                  <span className="italic">Confirmed on WhatsApp</span>
                </div>
                <div className="flex items-center justify-between text-base font-black text-secondary pt-2 border-t border-surface-container">
                  <span>Total Amount</span>
                  <span className="font-serif text-xl">{formatNaira(subtotal)}</span>
                </div>
              </div>

              {/* Error Box */}
              {errorMessage && (
                <div className="flex items-center gap-2 p-3 bg-error-container text-on-error-container text-xs rounded-xl">
                  <AlertCircle size={16} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* 4. WhatsApp Submit Button */}
              <Button
                type="submit"
                variant="gold"
                size="lg"
                loading={submitting}
                className="w-full text-sm gap-2"
              >
                <WhatsAppIcon size={18} className="text-[#161311]" />
                <span>Submit & Order via WhatsApp</span>
              </Button>

              <p className="text-[11px] text-center text-on-surface-variant leading-relaxed">
                Your order payload will open directly in WhatsApp to confirm payment details and delivery fee with our staff.
              </p>
            </div>
          </div>
        </form>
      </main>

      <PublicFooter />
    </div>
  );
};
