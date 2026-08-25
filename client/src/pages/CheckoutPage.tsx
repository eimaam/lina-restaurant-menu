import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
  MapPin,
  Clock,
} from 'lucide-react';
import { PublicHeader } from '../components/layout/PublicHeader';
import { PublicFooter } from '../components/layout/PublicFooter';
import { Button, Input, WhatsAppIcon, formatNaira } from '@lina/ui';
import { useCart } from '../contexts/CartContext';
import { publicApi } from '../lib/api';
import { generateWhatsAppDeepLink } from '../lib/whatsapp';
import type {
  FulfillmentTypeType,
  CartItem,
  DeliveryZoneResponse,
  RestaurantSettings,
} from '@lina/types';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { items, updateQuantity, removeItem, clearCart, subtotal } = useCart();

  const tableParam = searchParams.get('table') || sessionStorage.getItem('lina_table_number') || '';

  // Default fulfillment: 'dine_in' if table is scanned, otherwise 'delivery'
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentTypeType>(
    () => (tableParam ? 'dine_in' : 'delivery')
  );

  const [tableNumber, setTableNumber] = useState<string>(tableParam);
  const [customerName, setCustomerName] = useState<string>(
    () => localStorage.getItem('lina_customer_name') || ''
  );
  const [customerPhone, setCustomerPhone] = useState<string>(
    () => localStorage.getItem('lina_customer_phone') || ''
  );
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState<string>('');

  // Delivery Zones & Settings State
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZoneResponse[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [placedOrderInfo, setPlacedOrderInfo] = useState<{
    orderNumber: string;
    whatsappUrl: string;
  } | null>(null);

  // Load delivery zones & restaurant settings
  useEffect(() => {
    const init = async () => {
      try {
        const [zonesData, settingsData] = await Promise.all([
          publicApi.getDeliveryZones(),
          publicApi.getSettings(),
        ]);
        if (zonesData && zonesData.length > 0) {
          setDeliveryZones(zonesData);
          setSelectedZoneId(zonesData[0]._id);
        }
        if (settingsData) {
          setSettings(settingsData);
        }
      } catch (err) {
        console.error('Failed to load checkout options', err);
      }
    };
    init();
  }, []);

  const selectedZone = deliveryZones.find((z) => z._id === selectedZoneId);
  const deliveryFee = fulfillmentType === 'delivery' ? (selectedZone?.fee || 0) : 0;
  const grandTotal = subtotal + deliveryFee;

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
      setErrorMessage('Please enter your full delivery street address in Abuja.');
      return;
    }

    setSubmitting(true);

    try {
      // Save customer details in storage for next time
      if (customerName) localStorage.setItem('lina_customer_name', customerName.trim());
      if (customerPhone) localStorage.setItem('lina_customer_phone', customerPhone.trim());
      if (tableNumber) sessionStorage.setItem('lina_table_number', tableNumber.trim());

      const orderNumber = `LRB-${Math.floor(1000 + Math.random() * 9000)}`;

      // Generate WhatsApp link with dynamic settings hotline
      const whatsappUrl = generateWhatsAppDeepLink({
        orderNumber,
        customerName: customerName.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        fulfillmentType,
        tableNumber: tableNumber.trim() || undefined,
        deliveryZoneName: fulfillmentType === 'delivery' ? selectedZone?.name : undefined,
        deliveryFee: fulfillmentType === 'delivery' ? deliveryFee : undefined,
        deliveryAddress: deliveryAddress.trim() || undefined,
        items,
        subtotal,
        orderNotes: orderNotes.trim() || undefined,
        whatsappNumber: settings?.whatsappNumber,
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
          deliveryZoneId: fulfillmentType === 'delivery' ? selectedZone?._id : undefined,
          deliveryZoneName: fulfillmentType === 'delivery' ? selectedZone?.name : undefined,
          deliveryFee: fulfillmentType === 'delivery' ? deliveryFee : 0,
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
          total: grandTotal,
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
              Your order payload has been formatted and routed to Lina Restaurant's official WhatsApp hotline.
            </p>
          </div>

          <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant text-xs text-on-surface-variant space-y-2">
            <p>If WhatsApp did not automatically open on your device, click below:</p>
            <a
              href={placedOrderInfo.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#1ebd59] text-white font-bold text-sm rounded-lg shadow-xs transition-all"
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
              Explore our digital catalog to add delicious native soups, charcoal grills, shawarma, Arabian tea, and cocktails.
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

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
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
                      <div className="text-xs text-primary font-bold">
                        Portion: {item.selectedSize.name}
                      </div>
                    )}

                    {item.selectedOptions && item.selectedOptions.length > 0 && (
                      <div className="text-[11px] text-on-surface-variant space-y-0.5">
                        {item.selectedOptions.map((opt, idx) => (
                          <div key={idx}>
                            + {opt.optionName}{' '}
                            {opt.extraPrice > 0 && `(${formatNaira(opt.extraPrice)})`}
                          </div>
                        ))}
                      </div>
                    )}

                    {item.specialInstructions && (
                      <div className="text-[11px] text-amber-800 italic bg-amber-50 rounded-md p-1 border border-amber-200 inline-block">
                        Note: {item.specialInstructions}
                      </div>
                    )}

                    <div className="text-xs font-serif font-black text-secondary pt-1">
                      {formatNaira(item.unitPrice * item.quantity)}
                    </div>
                  </div>

                  {/* Quantity Actions */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-on-surface-variant hover:text-error transition-colors p-1"
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>

                    <div className="flex items-center gap-2 bg-surface-container rounded-lg p-1 border border-outline-variant">
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
                placeholder="Any special requests or instructions for the kitchen / dispatch..."
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
                  onClick={() => setFulfillmentType('delivery')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    fulfillmentType === 'delivery'
                      ? 'border-primary bg-primary-container/40 text-on-primary-container font-bold ring-2 ring-primary/20'
                      : 'border-outline-variant hover:border-primary/40 bg-surface-container-low text-on-surface-variant'
                  }`}
                >
                  <Truck size={18} className="mx-auto mb-1 text-primary" />
                  <div className="text-xs">Delivery</div>
                </button>

                <button
                  type="button"
                  onClick={() => setFulfillmentType('dine_in')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
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
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    fulfillmentType === 'pickup'
                      ? 'border-primary bg-primary-container/40 text-on-primary-container font-bold ring-2 ring-primary/20'
                      : 'border-outline-variant hover:border-primary/40 bg-surface-container-low text-on-surface-variant'
                  }`}
                >
                  <ShoppingBag size={18} className="mx-auto mb-1 text-primary" />
                  <div className="text-xs">Takeaway</div>
                </button>
              </div>

              {/* 2. Dynamic Input Fields */}
              <div className="space-y-4">
                {/* Dine-In Table Number */}
                {fulfillmentType === 'dine_in' && (
                  <Input
                    label="Table / Seat / VIP Lounge Number *"
                    placeholder="e.g. Table 4, VIP Lounge 2"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    required
                  />
                )}

                {/* Delivery Zone Selector */}
                {fulfillmentType === 'delivery' && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      Delivery Zone / Area *
                    </label>
                    <select
                      value={selectedZoneId}
                      onChange={(e) => setSelectedZoneId(e.target.value)}
                      className="w-full bg-surface-container-low text-xs rounded-xl p-3 border border-outline-variant focus:outline-none focus:border-primary font-medium text-on-surface"
                    >
                      {deliveryZones.map((zone) => (
                        <option key={zone._id} value={zone._id}>
                          {zone.name} — {formatNaira(zone.fee)} (~{zone.estimatedMinutes || 45} mins)
                        </option>
                      ))}
                    </select>
                    {selectedZone?.description && (
                      <p className="text-[11px] text-on-surface-variant italic">
                        {selectedZone.description}
                      </p>
                    )}
                  </div>
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

                {/* Street Delivery Address */}
                {fulfillmentType === 'delivery' && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      Delivery Street Address *
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

              {/* 3. Subtotal & Grand Total Summary */}
              <div className="pt-4 border-t border-surface-container space-y-2">
                <div className="flex items-center justify-between text-xs text-on-surface-variant">
                  <span>Food & Drinks Subtotal</span>
                  <span className="font-semibold text-on-surface">{formatNaira(subtotal)}</span>
                </div>

                {fulfillmentType === 'delivery' && (
                  <div className="flex items-center justify-between text-xs text-on-surface-variant">
                    <span>
                      Delivery Fee ({selectedZone?.name || 'Abuja Zone'})
                    </span>
                    <span className="font-bold text-primary">{formatNaira(deliveryFee)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-base font-black text-secondary pt-2 border-t border-surface-container">
                  <span>Total Amount Due</span>
                  <span className="font-serif text-xl">{formatNaira(grandTotal)}</span>
                </div>
              </div>

              {/* Error Box */}
              {errorMessage && (
                <div className="flex items-center gap-2 p-3 bg-error-container text-on-error-container text-xs rounded-lg">
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
                Your order payload will open directly in WhatsApp with {settings?.restaurantName || 'Lina Restaurant'} to confirm payment and dispatch.
              </p>
            </div>
          </div>
        </form>
      </main>

      <PublicFooter />
    </div>
  );
};
