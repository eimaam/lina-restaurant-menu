import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Printer, QrCode, Sparkles } from 'lucide-react';
import { Button, Input, Logo } from '@lina/ui';

export const QRCodePage: React.FC = () => {
  const [tableNumber, setTableNumber] = useState('');
  const defaultDomain = import.meta.env.VITE_CLIENT_URL || 'https://linarestaurantandbar.com.ng';
  const [customDomain, setCustomDomain] = useState(() => defaultDomain);

  // Generate target URL
  const qrTargetUrl = tableNumber.trim()
    ? `${customDomain}/menu?table=${encodeURIComponent(tableNumber.trim())}`
    : `${customDomain}/menu`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-on-surface">
            Table & Bar Stand QR Generator
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Generate printable vector QR codes with automatic table deep-linking for dine-in guests
          </p>
        </div>

        <Button onClick={handlePrint} variant="gold" size="sm" icon={<Printer size={14} />}>
          Print Table Stand
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Controls Card */}
        <div className="md:col-span-5 bg-surface-container-lowest rounded-3xl border border-outline-variant p-6 space-y-5 shadow-card">
          <h2 className="font-serif font-bold text-lg text-on-surface">QR Settings</h2>

          <Input
            label="Table / VIP Lounge / Bar Seat Number"
            placeholder="e.g. Table 4 or VIP 1 (leave blank for general menu)"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
          />

          <Input
            label="Base Domain URL"
            value={customDomain}
            onChange={(e) => setCustomDomain(e.target.value)}
          />

          <div className="p-3.5 bg-surface-container-low rounded-2xl border border-outline-variant text-xs space-y-1">
            <div className="font-bold text-on-surface">Live Destination URL:</div>
            <div className="font-mono text-[11px] text-primary break-all">{qrTargetUrl}</div>
          </div>
        </div>

        {/* Printable Stand Card Preview */}
        <div className="md:col-span-7 bg-surface-container-lowest rounded-3xl border-2 border-primary/40 p-8 sm:p-12 text-center shadow-ambient space-y-6 flex flex-col items-center justify-center print:border-none print:shadow-none print:p-0">
          {/* Brand Header */}
          <div className="space-y-1">
            <Logo size="lg" className="justify-center" />
            <p className="text-xs uppercase tracking-[0.25em] font-semibold text-primary">
              Digital Menu & Direct Ordering
            </p>
          </div>

          {/* QR Code Canvas Frame */}
          <div className="p-5 bg-white rounded-3xl border-2 border-outline-variant/60 shadow-md">
            <QRCodeSVG
              value={qrTargetUrl}
              size={220}
              level="H"
              includeMargin={false}
              fgColor="#161311"
            />
          </div>

          {/* Instructions and Table Number */}
          <div className="space-y-2 max-w-xs">
            {tableNumber.trim() ? (
              <div className="inline-block px-4 py-1.5 rounded-full bg-secondary text-on-secondary font-serif font-bold text-sm shadow-wine">
                Table #{tableNumber.trim()}
              </div>
            ) : (
              <div className="inline-block px-4 py-1.5 rounded-full bg-primary-container text-on-primary-container font-serif font-bold text-sm">
                General Guest Menu
              </div>
            )}
            <h3 className="font-serif font-black text-xl text-on-surface">
              Scan to Browse & Order
            </h3>
            <p className="text-xs text-on-surface-variant">
              Open your phone camera to view our live food & drinks catalog and order via WhatsApp.
            </p>
          </div>

          <div className="pt-2 text-[10px] text-on-surface-variant/70">
            27/29 6th Avenue, Gwarinpa, Abuja • 09165196622
          </div>
        </div>
      </div>
    </div>
  );
};
