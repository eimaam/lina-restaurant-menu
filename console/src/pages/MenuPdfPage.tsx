import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Printer, Download, FileText } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { publicApi } from '../lib/api';
import { formatNaira, Button, Logo, toast } from '@lina/ui';
import type { MenuCategoryResponse, MenuItemResponse } from '@lina/types';
import { toCanvas } from 'html-to-image';
import jsPDF from 'jspdf';

// Helper function to chunk items into pairs of 2 so each row can avoid page break splits
const chunkInPairs = <T,>(arr: T[]): T[][] => {
  const pairs: T[][] = [];
  for (let i = 0; i < arr.length; i += 2) {
    pairs.push(arr.slice(i, i + 2));
  }
  return pairs;
};

export const MenuPdfPage: React.FC = () => {
  const [categories, setCategories] = useState<MenuCategoryResponse[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<'midnight' | 'classic'>('midnight');

  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const coverPageRef = useRef<HTMLDivElement>(null);
  const catalogContainerRef = useRef<HTMLDivElement>(null);

  const defaultDomain = import.meta.env.VITE_CLIENT_URL || 'https://linarestaurantandbar.com.ng';

  useEffect(() => {
    const loadMenuData = async () => {
      setLoading(true);
      try {
        const [catsRes, itemsRes] = await Promise.all([
          publicApi.getCategories(),
          publicApi.getMenuItems({ isAvailable: true }),
        ]);
        setCategories(catsRes.filter((c) => c.isActive).sort((a, b) => a.sortOrder - b.sortOrder));
        setMenuItems(itemsRes.items || []);
      } catch (err) {
        console.error('Failed to load menu for PDF generation', err);
      } finally {
        setLoading(false);
      }
    };

    loadMenuData();
  }, []);

  // Memoize grouped items so object identity is stable across renders
  const itemsByCategory = useMemo(() => {
    return categories
      .map((cat) => {
        const items = menuItems.filter((item) => {
          const catId = typeof item.categoryId === 'string' ? item.categoryId : item.categoryId?._id;
          return catId === cat._id;
        });
        return { category: cat, items };
      })
      .filter((group) => group.items.length > 0);
  }, [categories, menuItems]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!coverPageRef.current || !catalogContainerRef.current) {
      toast.error('Menu elements not ready for export.');
      return;
    }
    setDownloading(true);
    try {
      // Ensure all web fonts are loaded
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }
      await new Promise((r) => setTimeout(r, 120));

      const filename = `Lina-Restaurant-Menu-A4-${selectedStyle === 'midnight' ? 'MidnightGold' : 'ClassicCream'}.pdf`;
      const bgColor = selectedStyle === 'midnight' ? '#161311' : '#FAF7F2';

      // 1. Initialize jsPDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      // 2. Render Cover Page (Page 1)
      const coverCanvas = await toCanvas(coverPageRef.current, {
        pixelRatio: 2,
        backgroundColor: bgColor,
        cacheBust: true,
      });
      const coverImgData = coverCanvas.toDataURL('image/jpeg', 0.98);
      pdf.addImage(coverImgData, 'JPEG', 0, 0, 210, 297);

      // 3. Render Catalog Container
      const catalogEl = catalogContainerRef.current;
      const catalogCanvas = await toCanvas(catalogEl, {
        pixelRatio: 2,
        backgroundColor: bgColor,
        cacheBust: true,
      });

      const canvasWidth = catalogCanvas.width;
      const canvasHeight = catalogCanvas.height;
      const a4PageHeightPx = Math.floor(canvasWidth * (297 / 210));

      // Calculate avoid-break element bounding boxes relative to catalog container in canvas pixels
      const containerRect = catalogEl.getBoundingClientRect();
      const scale = canvasWidth / containerRect.width;

      const avoidElements = Array.from(
        catalogEl.querySelectorAll('.menu-item-row, .menu-category-header, .menu-footer')
      );

      const avoidBoxes = avoidElements.map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          top: (rect.top - containerRect.top) * scale,
          bottom: (rect.bottom - containerRect.top) * scale,
        };
      });

      // Slice the catalog canvas into exact A4 pages
      let currentY = 0;
      while (currentY < canvasHeight) {
        let nextY = currentY + a4PageHeightPx;

        if (nextY >= canvasHeight) {
          nextY = canvasHeight;
        } else {
          // If cutting through an item or header, slice before it
          const cuttingBox = avoidBoxes.find(
            (box) => box.top < nextY && box.bottom > nextY
          );
          if (cuttingBox && cuttingBox.top > currentY + 120) {
            nextY = cuttingBox.top - 6;
          }
        }

        const sliceHeight = nextY - currentY;
        if (sliceHeight <= 0) break;

        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvasWidth;
        pageCanvas.height = a4PageHeightPx;
        const ctx = pageCanvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, canvasWidth, a4PageHeightPx);
          ctx.drawImage(
            catalogCanvas,
            0, currentY, canvasWidth, sliceHeight,
            0, 0, canvasWidth, sliceHeight
          );
        }

        pdf.addPage('a4', 'portrait');
        const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.98);
        pdf.addImage(pageImgData, 'JPEG', 0, 0, 210, 297);

        currentY = nextY;
      }

      pdf.save(filename);
      toast.success('A4 Menu PDF downloaded successfully!');
    } catch (err) {
      console.error('PDF download error:', err);
      toast.error('Direct download failed. Opening standard print dialog...');
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Control Header Bar (Hidden in Print & PDF export) */}
      <div className="print:hidden flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant shadow-card">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2">
            <FileText size={14} />
            <span>A4 Document Generator</span>
          </div>
          <h1 className="font-serif font-black text-2xl text-on-surface">
            Printable Menu PDF Exporter
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Rendered in true A4 portrait format (210mm × 297mm) with cover page, edge-to-edge layout and digital QR code.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Style Selector */}
          <div className="flex items-center p-1 bg-surface-container rounded-xl border border-outline-variant text-xs">
            <button
              type="button"
              onClick={() => setSelectedStyle('midnight')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                selectedStyle === 'midnight'
                  ? 'bg-[#161311] text-[#FAF7F2] shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Midnight Gold
            </button>
            <button
              type="button"
              onClick={() => setSelectedStyle('classic')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                selectedStyle === 'classic'
                  ? 'bg-[#F5EDE0] text-[#5A3816] border border-[#DECDB8] shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Classic Cream
            </button>
          </div>

          <Button
            onClick={handleDownloadPdf}
            variant="gold"
            size="md"
            loading={downloading}
            icon={<Download size={16} />}
            className="shadow-sm font-bold"
          >
            Download A4 PDF
          </Button>

          <Button
            onClick={handlePrint}
            variant="outline"
            size="md"
            icon={<Printer size={16} />}
            className="shadow-sm font-semibold"
          >
            Print
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-on-surface-variant">
          Preparing high-res A4 menu catalog...
        </div>
      ) : (
        /* Printable Document Container (Styled to exact A4 width) */
        <div className="w-full flex justify-center overflow-x-auto pb-8 print:p-0 print:overflow-visible">
          <div
            ref={pdfContainerRef}
            className={`w-[210mm] max-w-[210mm] min-w-[210mm] ${
              selectedStyle === 'midnight' ? 'bg-[#161311] text-[#FAF7F2]' : 'bg-[#FAF7F2] text-[#161311]'
            } print:max-w-none print:w-full print:shadow-none box-border shadow-2xl flex flex-col`}
            style={{ width: '210mm' }}
          >
            {/* ==========================================================================
               STYLE 1: MIDNIGHT OBSIDIAN & GOLD
               ========================================================================== */}
            {selectedStyle === 'midnight' && (
              <>
                {/* ── PAGE 1: COVER PAGE (A4 Portrait) ── */}
                <div
                  ref={coverPageRef}
                  className="menu-page-cover w-[210mm] min-h-[297mm] h-[297mm] p-8 box-border flex flex-col justify-between items-stretch bg-[#161311]"
                  style={{ pageBreakAfter: 'always', breakAfter: 'page', width: '210mm', height: '297mm' }}
                >
                  <div className="h-full min-h-[255mm] w-full flex flex-col justify-between items-center text-center p-8 border-4 border-[#C5943A]/50 rounded-xl relative bg-[#1E1A17] box-border">
                    {/* Corner Luxury Frame Accents */}
                    <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#C5943A]" />
                    <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#C5943A]" />
                    <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[#C5943A]" />
                    <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[#C5943A]" />

                    {/* Top Logo Crest */}
                    <div className="pt-6">
                      <Logo size="2xl" className="justify-center" />
                    </div>

                    {/* Central Typography Header */}
                    <div className="space-y-4 my-auto max-w-lg">
                      <div className="inline-block px-4 py-1 rounded-full bg-[#2E2722] text-[#C5943A] text-xs font-sans font-bold uppercase tracking-[0.25em] border border-[#C5943A]/30">
                        Official Dining & Bar Menu
                      </div>
                      <h1 className="text-4xl font-black tracking-tight text-[#FAF7F2] leading-tight pb-1 font-serif">
                        Lina Restaurant, Bar And Street Food
                      </h1>
                      <p className="text-xl italic text-[#C5943A] font-medium font-serif">
                        Where Good Food Meets Great Vibes.
                      </p>
                      <div className="w-20 h-0.5 bg-[#C5943A]/50 mx-auto my-3" />
                      <p className="text-xs font-sans text-[#DDD7CB] leading-relaxed">
                        27/29 6th Avenue, Gwarinpa Estate, Abuja
                        <br />
                        Reservations & Dispatch: <strong className="text-white">09165196622</strong>
                      </p>
                    </div>

                    {/* Bottom QR Code Block */}
                    <div className="pb-4 flex flex-col items-center space-y-2.5">
                      <div className="p-3 bg-white rounded-xl shadow-lg border-2 border-[#C5943A]">
                        <QRCodeSVG
                          value={`${defaultDomain}/menu`}
                          size={110}
                          level="H"
                          includeMargin={false}
                        />
                      </div>
                      <div className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#C5943A]">
                        Scan with Camera for Digital Menu & Instant Ordering
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── PAGE 2+: MENU CATALOG PAGES ── */}
                <div
                  ref={catalogContainerRef}
                  className="w-[210mm] p-8 box-border flex flex-col justify-between bg-[#161311] text-[#FAF7F2] font-serif"
                  style={{ width: '210mm' }}
                >
                  <div className="space-y-8">
                    <div className="text-center border-b border-[#3D332A] pb-3">
                      <h2 className="text-2xl font-black text-[#C5943A] uppercase tracking-widest">
                        Dining & Room Selection
                      </h2>
                      <p className="text-xs text-[#A89F91] font-sans pt-1">
                        All delicacies prepared fresh to order in our executive kitchen
                      </p>
                    </div>

                    {itemsByCategory.map(({ category, items }) => (
                      <div
                        key={category._id}
                        className="space-y-3"
                      >
                        <div
                          className="menu-category-header flex items-center gap-2.5 border-b-2 border-[#C5943A]/40 pb-2 break-inside-avoid"
                          style={{ pageBreakAfter: 'avoid', breakAfter: 'avoid', pageBreakInside: 'avoid', breakInside: 'avoid' }}
                        >
                          <span className="text-lg">{category.icon || '🍽️'}</span>
                          <h3 className="font-serif font-bold text-base text-[#FAF7F2] uppercase tracking-wider pb-0.5">
                            {category.name}
                          </h3>
                        </div>

                        <div className="space-y-4">
                          {chunkInPairs(items).map((pair, pairIdx) => (
                            <div
                              key={pairIdx}
                              className="menu-item-row grid grid-cols-2 gap-x-6 break-inside-avoid"
                              style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
                            >
                              {pair.map((item) => {
                                const hasSizes = Boolean(item.hasSizes && item.sizes && item.sizes.length > 0);
                                let priceLabel = formatNaira(item.basePrice);
                                if (hasSizes && item.sizes) {
                                  const prices = item.sizes.map((s) => s.price);
                                  const min = Math.min(...prices);
                                  const max = Math.max(...prices);
                                  priceLabel = min === max ? formatNaira(min) : `from ${formatNaira(min)}`;
                                }

                                return (
                                  <div
                                    key={item._id}
                                    className="space-y-1 border-b border-[#2E2722]/80 pb-3"
                                  >
                                    <div className="flex items-start justify-between gap-2.5">
                                      <h4 className="font-serif font-bold text-xs text-[#FAF7F2] leading-snug pb-0.5 break-words">
                                        {item.name}
                                      </h4>
                                      <span className="font-sans font-bold text-xs text-[#C5943A] shrink-0 whitespace-nowrap tabular-nums pt-0.5">
                                        {priceLabel}
                                      </span>
                                    </div>
                                    {item.description && (
                                      <p className="text-[10px] text-[#DDD7CB]/90 font-sans leading-relaxed pb-0.5">
                                        {item.description}
                                      </p>
                                    )}
                                    {hasSizes && item.sizes && (
                                      <div className="pt-0.5 text-[10px] font-sans flex flex-wrap items-center gap-x-2 gap-y-1 text-[#A89F91]">
                                        {item.sizes.map((s, idx) => (
                                          <span key={idx} className="inline-flex items-baseline">
                                            <span className="text-[#DDD7CB] font-medium">{s.name}</span>
                                            <span className="mx-1 text-[#C5943A]/70 font-semibold">{formatNaira(s.price)}</span>
                                            {idx < item.sizes!.length - 1 && (
                                              <span className="ml-2 text-[#594D44] select-none">•</span>
                                            )}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ── PINNED BOTTOM FOOTER ON LAST PAGE ── */}
                  <div className="menu-footer mt-auto pt-6 border-t border-[#3D332A] space-y-3 break-inside-avoid font-sans" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                    <div className="flex items-center justify-between gap-4 text-left">
                      <div className="space-y-0.5">
                        <div className="text-[11px] font-serif font-bold uppercase tracking-wider text-[#C5943A]">
                          Chef's Note & Dining Information
                        </div>
                        <p className="text-[9px] leading-relaxed max-w-sm text-[#DDD7CB]/80">
                          Please inform our service staff of any food allergies or dietary preferences before placing your order.
                          All delicacies are prepared fresh to order in our executive kitchen.
                        </p>
                      </div>
                      <div className="text-right space-y-0.5 shrink-0">
                        <div className="text-[10px] font-bold text-[#FAF7F2]">
                          Dine-In • Takeaway • Fast Delivery
                        </div>
                        <div className="text-[10px] font-semibold text-[#C5943A]">
                          Reservations & Dispatch: 09165196622
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-[#2E2722] pt-2.5 flex items-center justify-between text-[9px] text-[#A89F91]">
                      <div>© {new Date().getFullYear()} Lina Restaurant, Bar And Street Food • 27/29 6th Avenue, Gwarinpa, Abuja</div>
                      <div className="font-mono text-[#C5943A]">{defaultDomain.replace(/^https?:\/\//, '')}</div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ==========================================================================
               STYLE 2: CLASSIC CREAM ELEGANCE (Luxury Warm Cream & Rich Espresso)
               ========================================================================== */}
            {selectedStyle === 'classic' && (
              <>
                {/* ── PAGE 1: COVER PAGE (A4 Portrait) ── */}
                <div
                  ref={coverPageRef}
                  className="menu-page-cover w-[210mm] min-h-[297mm] h-[297mm] p-8 box-border flex flex-col justify-between items-stretch bg-[#FAF7F2]"
                  style={{ pageBreakAfter: 'always', breakAfter: 'page', width: '210mm', height: '297mm' }}
                >
                  <div className="h-full min-h-[255mm] w-full flex flex-col justify-between items-center text-center p-8 border-4 border-[#8C531B]/40 rounded-xl relative bg-[#FFFDF9] box-border">
                    {/* Corner Luxury Frame Accents */}
                    <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#8C531B]" />
                    <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#8C531B]" />
                    <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[#8C531B]" />
                    <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[#8C531B]" />

                    {/* Top Logo Crest */}
                    <div className="pt-6">
                      <Logo size="2xl" className="justify-center" />
                    </div>

                    {/* Central Typography Header */}
                    <div className="space-y-4 my-auto max-w-lg">
                      <div className="inline-block px-4 py-1 rounded-full bg-[#F5EDE0] text-[#5A3816] text-xs font-sans font-bold uppercase tracking-[0.25em] border border-[#DECDB8]">
                        Official Dining & Bar Menu
                      </div>
                      <h1 className="text-4xl font-black tracking-tight text-[#2E1E12] leading-tight pb-1 font-serif">
                        Lina Restaurant, Bar And Street Food
                      </h1>
                      <p className="text-xl italic text-[#8C531B] font-medium font-serif">
                        Where Good Food Meets Great Vibes.
                      </p>
                      <div className="w-20 h-0.5 bg-[#8C531B]/40 mx-auto my-3" />
                      <p className="text-xs font-sans text-[#594D44] leading-relaxed">
                        27/29 6th Avenue, Gwarinpa Estate, Abuja
                        <br />
                        Reservations & Table Bookings: <strong className="text-[#161311]">09165196622</strong>
                      </p>
                    </div>

                    {/* Cover QR Badge */}
                    <div className="pb-4 flex flex-col items-center space-y-2.5">
                      <div className="p-3 bg-white rounded-xl shadow-md border-2 border-[#8C531B]">
                        <QRCodeSVG
                          value={`${defaultDomain}/menu`}
                          size={110}
                          level="H"
                          includeMargin={false}
                        />
                      </div>
                      <div className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#8C531B]">
                        Scan with Phone Camera for Digital Ordering
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── PAGE 2+: MENU CATALOG PAGES ── */}
                <div
                  ref={catalogContainerRef}
                  className="w-[210mm] p-8 box-border flex flex-col justify-between bg-[#FAF7F2] text-[#161311] font-serif"
                  style={{ width: '210mm' }}
                >
                  <div className="space-y-8">
                    <div className="text-center border-b-2 border-[#8C531B]/20 pb-3">
                      <h2 className="text-2xl font-black text-[#2E1E12] uppercase tracking-widest">
                        A la Carte Menu
                      </h2>
                      <p className="text-xs text-[#6B5E54] font-sans pt-1">
                        Fresh native soups, charcoal grills, shawarmas and premium cocktails
                      </p>
                    </div>

                    {itemsByCategory.map(({ category, items }) => (
                      <div
                        key={category._id}
                        className="space-y-3"
                      >
                        <div
                          className="menu-category-header flex items-center gap-2.5 border-b-2 border-[#8C531B]/30 pb-2 break-inside-avoid"
                          style={{ pageBreakAfter: 'avoid', breakAfter: 'avoid', pageBreakInside: 'avoid', breakInside: 'avoid' }}
                        >
                          <span className="text-lg">{category.icon || '🍽️'}</span>
                          <h3 className="font-serif font-bold text-base text-[#2E1E12] uppercase tracking-wider pb-0.5">
                            {category.name}
                          </h3>
                        </div>

                        <div className="space-y-4">
                          {chunkInPairs(items).map((pair, pairIdx) => (
                            <div
                              key={pairIdx}
                              className="menu-item-row grid grid-cols-2 gap-x-6 break-inside-avoid"
                              style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
                            >
                              {pair.map((item) => {
                                const hasSizes = Boolean(item.hasSizes && item.sizes && item.sizes.length > 0);
                                let priceLabel = formatNaira(item.basePrice);
                                if (hasSizes && item.sizes) {
                                  const prices = item.sizes.map((s) => s.price);
                                  const min = Math.min(...prices);
                                  const max = Math.max(...prices);
                                  priceLabel = min === max ? formatNaira(min) : `from ${formatNaira(min)}`;
                                }

                                return (
                                  <div
                                    key={item._id}
                                    className="space-y-1 border-b border-[#E5DDD0] pb-3"
                                  >
                                    <div className="flex items-start justify-between gap-2.5">
                                      <h4 className="font-serif font-bold text-xs text-[#161311] leading-snug pb-0.5 break-words">
                                        {item.name}
                                      </h4>
                                      <span className="font-sans font-bold text-xs text-[#8C531B] shrink-0 whitespace-nowrap tabular-nums pt-0.5">
                                        {priceLabel}
                                      </span>
                                    </div>
                                    {item.description && (
                                      <p className="text-[10px] text-[#6B5E54] font-sans leading-relaxed pb-0.5">
                                        {item.description}
                                      </p>
                                    )}
                                    {hasSizes && item.sizes && (
                                      <div className="pt-0.5 text-[10px] font-sans flex flex-wrap items-center gap-x-2 gap-y-1 text-[#594D44]">
                                        {item.sizes.map((s, idx) => (
                                          <span key={idx} className="inline-flex items-baseline">
                                            <span className="text-[#161311] font-medium">{s.name}</span>
                                            <span className="mx-1 text-[#8C531B] font-semibold">{formatNaira(s.price)}</span>
                                            {idx < item.sizes!.length - 1 && (
                                              <span className="ml-2 text-[#B8AAA0] select-none">•</span>
                                            )}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ── PINNED BOTTOM FOOTER ON LAST PAGE ── */}
                  <div className="menu-footer mt-auto pt-6 border-t border-[#D9D0C3] space-y-3 break-inside-avoid font-sans" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                    <div className="flex items-center justify-between gap-4 text-left">
                      <div className="space-y-0.5">
                        <div className="text-[11px] font-serif font-bold uppercase tracking-wider text-[#8C531B]">
                          Chef's Note & Dining Information
                        </div>
                        <p className="text-[9px] leading-relaxed max-w-sm text-[#6B5E54]">
                          Please inform our service staff of any food allergies or dietary preferences before placing your order.
                          All delicacies are prepared fresh to order in our executive kitchen.
                        </p>
                      </div>
                      <div className="text-right space-y-0.5 shrink-0">
                        <div className="text-[10px] font-bold text-[#2E1E12]">
                          Dine-In • Takeaway • Fast Delivery
                        </div>
                        <div className="text-[10px] font-semibold text-[#8C531B]">
                          Reservations & Dispatch: 09165196622
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-[#E5DDD0] pt-2.5 flex items-center justify-between text-[9px] text-[#8A7E74]">
                      <div>© {new Date().getFullYear()} Lina Restaurant, Bar And Street Food • 27/29 6th Avenue, Gwarinpa, Abuja</div>
                      <div className="font-mono text-[#8C531B]">{defaultDomain.replace(/^https?:\/\//, '')}</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
