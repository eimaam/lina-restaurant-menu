import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { toPng, toSvg } from 'html-to-image';
import {
  Download,
  Printer,
  QrCode,
  Sparkles,
  ShieldCheck,
  Code2,
  Image as ImageIcon,
  FileCode,
  Layers,
} from 'lucide-react';
import { Button, Input, Logo, Badge, toast } from '@lina/ui';

export const QRCodePage: React.FC = () => {
  const [tableNumber, setTableNumber] = useState('');
  const defaultDomain = import.meta.env.VITE_CLIENT_URL || 'https://linarestaurantandbar.com.ng';
  const [customDomain, setCustomDomain] = useState(() => defaultDomain);
  const [downloading, setDownloading] = useState<string | null>(null);

  const rawQrRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Generate target URL
  const qrTargetUrl = tableNumber.trim()
    ? `${customDomain}/menu?table=${encodeURIComponent(tableNumber.trim())}`
    : `${customDomain}/menu`;

  const handlePrint = () => {
    window.print();
  };

  // 1. Download Raw Vector SVG QR
  const handleDownloadRawSvg = () => {
    try {
      const svgElement = rawQrRef.current?.querySelector('svg');
      if (!svgElement) return;

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = svgUrl;
      downloadLink.download = `lina-raw-qr-${tableNumber.trim() ? `table-${tableNumber.trim()}` : 'menu'}.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      toast.success('Raw Vector SVG QR code downloaded!');
    } catch (err) {
      toast.error('Failed to download SVG.');
    }
  };

  // 2. Download Raw High-Res PNG QR
  const handleDownloadRawPng = () => {
    try {
      const svgElement = rawQrRef.current?.querySelector('svg');
      if (!svgElement) return;

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      canvas.width = 1200;
      canvas.height = 1200;

      img.onload = () => {
        if (!ctx) return;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `lina-raw-qr-${tableNumber.trim() ? `table-${tableNumber.trim()}` : 'menu'}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        toast.success('Raw High-Res PNG QR code downloaded!');
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    } catch (err) {
      toast.error('Failed to download PNG.');
    }
  };

  // 3. Download Full Designed Stand Card as PNG
  const handleDownloadDesignedCardPng = async () => {
    if (!cardRef.current) return;
    setDownloading('card-png');
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#FAF7F2',
      });
      const link = document.createElement('a');
      link.download = `lina-table-stand-${tableNumber.trim() ? `table-${tableNumber.trim()}` : 'menu'}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Customized Designed Stand Card (PNG) downloaded!');
    } catch (error) {
      console.error('Error generating card image', error);
      toast.error('Failed to download designed card PNG.');
    } finally {
      setDownloading(null);
    }
  };

  // 4. Download Full Designed Stand Card as SVG
  const handleDownloadDesignedCardSvg = async () => {
    if (!cardRef.current) return;
    setDownloading('card-svg');
    try {
      const dataUrl = await toSvg(cardRef.current, {
        cacheBust: true,
        backgroundColor: '#FAF7F2',
      });
      const link = document.createElement('a');
      link.download = `lina-table-stand-${tableNumber.trim() ? `table-${tableNumber.trim()}` : 'menu'}.svg`;
      link.href = dataUrl;
      link.click();
      toast.success('Customized Designed Stand Card (SVG) downloaded!');
    } catch (error) {
      console.error('Error generating card svg', error);
      toast.error('Failed to download designed card SVG.');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2 font-mono">
            <Code2 size={14} />
            <span>Developer Exclusive Tooling</span>
          </div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-on-surface">
            Table & Bar Stand QR Generator
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Generate printable vector QR codes with automatic table deep-linking for dine-in guests and delivery stands.
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
        <div className="print:hidden md:col-span-5 bg-surface-container-lowest rounded-3xl border border-outline-variant p-6 space-y-6 shadow-card">
          <div>
            <h2 className="font-serif font-bold text-lg text-on-surface">QR Settings</h2>
            <p className="text-[11px] text-on-surface-variant">
              Specify table numbers to automatically tag orders in kitchen dispatch.
            </p>
          </div>

          <Input
            label="Table / VIP Lounge / Bar Seat Number"
            placeholder="e.g. 4, VIP 1, Rooftop 2 (optional)"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
          />

          <Input
            label="Target Domain URL"
            value={customDomain}
            onChange={(e) => setCustomDomain(e.target.value)}
          />

          <div className="p-3.5 bg-surface-container-low rounded-xl border border-outline-variant text-xs space-y-1">
            <div className="font-bold text-on-surface">Encoded Destination URL:</div>
            <div className="font-mono text-[11px] text-primary break-all">{qrTargetUrl}</div>
          </div>

          {/* Download Options Group 1: Designed Full Card */}
          <div className="pt-2 border-t border-surface-container space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface">
              <Sparkles size={14} className="text-primary" />
              <span>Full Designed Stand Card</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleDownloadDesignedCardPng}
                variant="gold"
                size="sm"
                loading={downloading === 'card-png'}
                icon={<ImageIcon size={13} />}
                className="justify-center text-xs"
              >
                Card (PNG)
              </Button>
              <Button
                onClick={handleDownloadDesignedCardSvg}
                variant="outline"
                size="sm"
                loading={downloading === 'card-svg'}
                icon={<FileCode size={13} />}
                className="justify-center text-xs"
              >
                Card (SVG)
              </Button>
            </div>
          </div>

          {/* Download Options Group 2: Raw QR Code */}
          <div className="pt-2 border-t border-surface-container space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface">
              <QrCode size={14} className="text-on-surface-variant" />
              <span>Raw QR Code Only</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleDownloadRawPng}
                variant="ghost"
                size="sm"
                icon={<Download size={13} />}
                className="justify-center text-xs border border-outline-variant"
              >
                Raw (PNG)
              </Button>
              <Button
                onClick={handleDownloadRawSvg}
                variant="ghost"
                size="sm"
                icon={<Download size={13} />}
                className="justify-center text-xs border border-outline-variant"
              >
                Raw (SVG)
              </Button>
            </div>
          </div>
        </div>

        {/* Printable Stand Card Preview */}
        <div className="md:col-span-7 flex flex-col items-center">
          <div
            ref={cardRef}
            className="w-full max-w-sm bg-[#FAF7F2] text-[#161311] rounded-3xl border-2 border-[#C5943A]/40 p-8 sm:p-10 text-center shadow-2xl space-y-6 flex flex-col items-center justify-center print:border-none print:shadow-none print:p-0"
          >
            {/* Brand Header */}
            <div className="space-y-1">
              <Logo size="lg" className="justify-center" />
              <p className="text-[11px] uppercase tracking-[0.25em] font-bold text-primary pt-1 font-serif">
                Digital Menu & Direct Ordering
              </p>
            </div>

            {/* QR Code Canvas Frame */}
            <div
              ref={rawQrRef}
              className="p-5 bg-white rounded-3xl border-2 border-outline-variant/60 shadow-md"
            >
              <QRCodeSVG
                value={qrTargetUrl}
                size={210}
                level="H"
                includeMargin={false}
                fgColor="#161311"
              />
            </div>

            {/* Table Badge & Callout */}
            <div className="space-y-2 max-w-xs">
              {tableNumber.trim() ? (
                <div className="inline-block px-4 py-1.5 rounded-full bg-[#161311] text-[#FAF7F2] font-serif font-bold text-sm border border-primary/40 shadow-xs">
                  Table #{tableNumber.trim()}
                </div>
              ) : (
                <div className="inline-block px-4 py-1.5 rounded-full bg-primary/15 text-primary font-serif font-bold text-sm border border-primary/30">
                  Guest Digital Menu
                </div>
              )}
              <h3 className="font-serif font-black text-xl text-[#161311]">
                Scan to Browse & Order
              </h3>
              <p className="text-xs text-[#5C5346] leading-relaxed">
                Point your phone camera to view our live food & drinks catalog and send your order straight to our kitchen.
              </p>
            </div>

            <div className="pt-2 border-t border-[#D9D2C5] w-full text-[10px] text-[#7A6F60] font-serif">
              7/29 6th Avenue, Gwarinpa, Abuja • 09165196622
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
