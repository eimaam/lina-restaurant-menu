import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Printer, QrCode, Sparkles, ShieldCheck, Code2 } from 'lucide-react';
import { Button, Input, Logo, Badge, toast } from '@lina/ui';

export const QRCodePage: React.FC = () => {
  const [tableNumber, setTableNumber] = useState('');
  const defaultDomain = import.meta.env.VITE_CLIENT_URL || 'https://linarestaurantandbar.com.ng';
  const [customDomain, setCustomDomain] = useState(() => defaultDomain);
  const qrRef = useRef<HTMLDivElement>(null);

  // Generate target URL
  const qrTargetUrl = tableNumber.trim()
    ? `${customDomain}/menu?table=${encodeURIComponent(tableNumber.trim())}`
    : `${customDomain}/menu`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadSvg = () => {
    try {
      const svgElement = qrRef.current?.querySelector('svg');
      if (!svgElement) return;

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = svgUrl;
      downloadLink.download = `lina-qr-table-${tableNumber.trim() || 'menu'}.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      toast.success('Vector SVG QR code downloaded!');
    } catch (err) {
      toast.error('Failed to download SVG.');
    }
  };

  const handleDownloadPng = () => {
    try {
      const svgElement = qrRef.current?.querySelector('svg');
      if (!svgElement) return;

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      canvas.width = 1000;
      canvas.height = 1000;

      img.onload = () => {
        if (!ctx) return;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `lina-qr-table-${tableNumber.trim() || 'menu'}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        toast.success('High-res PNG QR code downloaded!');
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    } catch (err) {
      toast.error('Failed to download PNG.');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2">
            <Code2 size={14} />
            <span>Developer Restricted Tooling</span>
          </div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-on-surface">
            Table & Bar Stand QR Generator
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Generate printable vector QR codes with automatic table deep-linking for dine-in guests.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={handlePrint} variant="gold" size="sm" icon={<Printer size={14} />}>
            Print Table Stand
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Controls Card */}
        <div className="print:hidden md:col-span-5 bg-surface-container-lowest rounded-3xl border border-outline-variant p-6 space-y-5 shadow-card">
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

          <div className="p-3.5 bg-surface-container-low rounded-xl border border-outline-variant text-xs space-y-1">
            <div className="font-bold text-on-surface">Live Destination URL:</div>
            <div className="font-mono text-[11px] text-primary break-all">{qrTargetUrl}</div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Button onClick={handleDownloadPng} variant="outline" size="sm" icon={<Download size={14} />} className="w-full justify-center">
              Download High-Res PNG
            </Button>
            <Button onClick={handleDownloadSvg} variant="ghost" size="sm" icon={<Download size={14} />} className="w-full justify-center">
              Download Vector SVG
            </Button>
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
          <div ref={qrRef} className="p-5 bg-white rounded-3xl border-2 border-outline-variant/60 shadow-md">
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
