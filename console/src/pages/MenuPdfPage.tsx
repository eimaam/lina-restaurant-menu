import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Printer, Download, FileText } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { publicApi } from '../lib/api';
import { formatNaira, Button, Logo, toast } from '@lina/ui';
import type { MenuCategoryResponse, MenuItemResponse } from '@lina/types';

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
  const [catalogMinHeight, setCatalogMinHeight] = useState<string>('297mm');

  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const catalogContentRef = useRef<HTMLDivElement>(null);
  const pageRulerRef = useRef<HTMLDivElement>(null);

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

  // Dynamically calculate the catalog height to ensure the last page goes through to the bottom of the A4 page
  const recalculateCatalogHeight = useCallback(() => {
    if (!catalogContentRef.current || !pageRulerRef.current) return;

    const a4Px = pageRulerRef.current.offsetHeight || 1123;
    const contentHeight = catalogContentRef.current.offsetHeight;
    if (!contentHeight || contentHeight <= 0) return;

    // Footer height (~90px) + p-8 top/bottom padding (64px)
    const footerAndPaddingPx = 154;

    // Estimate small boundary break shifts (at most ~40px per page boundary)
    const roughPages = Math.ceil((contentHeight + footerAndPaddingPx) / a4Px);
    const boundaryBuffer = Math.max(0, roughPages - 1) * 40;

    const totalNeededPx = contentHeight + footerAndPaddingPx + boundaryBuffer;
    const pages = Math.max(1, Math.min(10, Math.ceil(totalNeededPx / a4Px)));

    setCatalogMinHeight(`${pages * 297}mm`);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      recalculateCatalogHeight();
    }, 60);

    const handleResize = () => recalculateCatalogHeight();
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [itemsByCategory, selectedStyle, loading, recalculateCatalogHeight]);

  const handlePrint = () => {
    recalculateCatalogHeight();
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!pdfContainerRef.current) return;
    setDownloading(true);
    try {
      recalculateCatalogHeight();
      await new Promise((r) => setTimeout(r, 100));

      // @ts-ignore
      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = html2pdfModule.default || html2pdfModule;

      const element = pdfContainerRef.current;
      const filename = `Lina-Restaurant-Menu-A4-${selectedStyle === 'midnight' ? 'MidnightGold' : 'ClassicCream'}.pdf`;

      const opt = {
        margin: [0, 0, 0, 0] as [number, number, number, number],
        filename,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          scrollY: 0,
          scrollX: 0,
          windowWidth: 794,
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
        pagebreak: {
          mode: ['avoid-all', 'css', 'legacy'] as const,
          avoid: ['.menu-item-row', '.menu-category-header', '.menu-footer'],
        },
      };

      await html2pdf().set(opt).from(element).save();
      toast.success('A4 Menu PDF downloaded successfully!');
    } catch (err) {
      console.error('PDF download error:', err);
      toast.error('Direct download failed. Opening standard print/save dialog...');
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
              onClick={() => setSelectedStyle('midnight')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${selectedStyle === 'midnight'
                ? 'bg-[#161311] text-[#FAF7F2] shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
                }`}
            >
              Midnight Gold
            </button>
            <button
              onClick={() => setSelectedStyle('classic')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${selectedStyle === 'classic'
                ? 'bg-amber-100 text-amber-950 shadow-xs'
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
        <div className="w-full flex justify-center overflow-x-auto pb-8 print:p-0">
          {/* Hidden reference ruler to accurately measure 297mm in pixels in current environment */}
          <div
            ref={pageRulerRef}
            style={{
              height: '297mm',
              width: '210mm',
              position: 'absolute',
              top: -99999,
              left: -99999,
              visibility: 'hidden',
              pointerEvents: 'none',
            }}
          />

          <div
            ref={pdfContainerRef}
            className={`w-[210mm] max-w-[210mm] min-w-[210mm] ${
              selectedStyle === 'midnight' ? 'bg-[#161311] text-[#FAF7F2]' : 'bg-[#FAF7F2] text-[#161311]'
            } print:max-w-none print:w-full box-border shadow-2xl flex flex-col`}
            style={{ width: '210mm' }}
          >
            {/* ==========================================================================
               STYLE 1: MIDNIGHT OBSIDIAN & GOLD
               ========================================================================== */}
            {selectedStyle === 'midnight' && (
              <>
                {/* ── PAGE 1: COVER PAGE (A4 Portrait) ── */}
                <div
                  className="w-[210mm] min-h-[275mm] p-8 box-border flex flex-col justify-between items-stretch bg-[#161311]"
                  style={{ pageBreakAfter: 'always', breakAfter: 'page' }}
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

                {/* ── PAGE 2+: MENU CATALOG PAGES (Stretches through to bottom of last A4 page) ── */}
                <div
                  className="w-[210mm] p-8 box-border flex flex-col justify-between flex-1 bg-[#161311] text-[#FAF7F2] font-serif"
                  style={{ minHeight: catalogMinHeight }}
                >
                  <div ref={catalogContentRef} className="space-y-8">
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
                          className="menu-category-header flex items-center gap-2.5 border-b-2 border-[#C5943A]/40 pb-2 break-inside-avoid html2pdf__page-break-avoid"
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
                              className="menu-item-row grid grid-cols-2 gap-x-6 break-inside-avoid html2pdf__page-break-avoid"
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
                  <div className="menu-footer mt-auto pt-6 border-t border-[#3D332A] space-y-3 break-inside-avoid html2pdf__page-break-avoid font-sans" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
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
               STYLE 2: CLASSIC CREAM ELEGANCE
               ========================================================================== */}
            {selectedStyle === 'classic' && (
              <>
                {/* ── PAGE 1: COVER PAGE (A4 Portrait) ── */}
                <div
                  className="w-[210mm] min-h-[275mm] p-8 box-border flex flex-col justify-between items-stretch bg-[#FAF7F2]"
                  style={{ pageBreakAfter: 'always', breakAfter: 'page' }}
                >
                  <div className="h-full min-h-[255mm] w-full flex flex-col justify-between items-center text-center p-8 border-2 border-amber-900/30 rounded-xl relative bg-[#FFFDF9] box-border">
                    <div className="pt-6">
                      <Logo size="2xl" className="justify-center" />
                    </div>

                    <div className="space-y-4 my-auto max-w-lg">
                      <span className="inline-block px-4 py-1 rounded-full bg-amber-100 text-amber-950 text-xs font-sans font-bold uppercase tracking-[0.25em] border border-amber-300">
                        Fine Dining & VIP Rooms
                      </span>
                      <h1 className="text-4xl font-black tracking-tight text-amber-950 leading-tight pb-1 font-serif">
                        Lina Restaurant, Bar And Street Food
                      </h1>
                      <p className="text-xl italic text-amber-800 font-medium font-serif">
                        Where Good Food Meets Great Vibes.
                      </p>
                      <div className="w-20 h-0.5 bg-amber-900/30 mx-auto my-3" />
                      <p className="text-xs font-sans text-stone-600 leading-relaxed">
                        27/29 6th Avenue, Gwarinpa Estate, Abuja
                        <br />
                        Reservations & Table Bookings: <strong className="text-stone-900">09165196622</strong>
                      </p>
                    </div>

                    {/* Cover QR Badge */}
                    <div className="pb-4 flex flex-col items-center space-y-2.5">
                      <div className="p-3 bg-white rounded-xl shadow-md border-2 border-amber-300">
                        <QRCodeSVG
                          value={`${defaultDomain}/menu`}
                          size={110}
                          level="H"
                          includeMargin={false}
                        />
                      </div>
                      <div className="text-[10px] font-sans font-bold uppercase tracking-wider text-amber-900">
                        Scan with Phone Camera for Digital Ordering
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── PAGE 2+: MENU CATALOG PAGES (Stretches through to bottom of last A4 page) ── */}
                <div
                  className="w-[210mm] p-8 box-border flex flex-col justify-between flex-1 bg-[#FAF7F2] text-[#161311] font-serif"
                  style={{ minHeight: catalogMinHeight }}
                >
                  <div ref={catalogContentRef} className="space-y-8">
                    <div className="text-center border-b-2 border-amber-900/20 pb-3">
                      <h2 className="text-2xl font-black text-amber-950 uppercase tracking-widest">
                        A la Carte Menu
                      </h2>
                      <p className="text-xs text-stone-500 font-sans pt-1">
                        Fresh native soups, charcoal grills, shawarmas and premium cocktails
                      </p>
                    </div>

                    {itemsByCategory.map(({ category, items }) => (
                      <div
                        key={category._id}
                        className="space-y-3"
                      >
                        <div
                          className="menu-category-header flex items-center gap-2.5 border-b border-amber-900/30 pb-2 break-inside-avoid html2pdf__page-break-avoid"
                          style={{ pageBreakAfter: 'avoid', breakAfter: 'avoid', pageBreakInside: 'avoid', breakInside: 'avoid' }}
                        >
                          <h3 className="font-serif font-bold text-base text-amber-950 uppercase tracking-wider pb-0.5">
                            {category.name}
                          </h3>
                        </div>

                        <div className="space-y-4">
                          {chunkInPairs(items).map((pair, pairIdx) => (
                            <div
                              key={pairIdx}
                              className="menu-item-row grid grid-cols-2 gap-x-6 break-inside-avoid html2pdf__page-break-avoid"
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
                                    className="space-y-1 border-b border-stone-200 pb-3"
                                  >
                                    <div className="flex items-start justify-between gap-2.5">
                                      <h4 className="font-serif font-bold text-xs text-stone-900 leading-snug pb-0.5 break-words">
                                        {item.name}
                                      </h4>
                                      <span className="font-sans font-bold text-xs text-amber-900 shrink-0 whitespace-nowrap tabular-nums pt-0.5">
                                        {priceLabel}
                                      </span>
                                    </div>
                                    {item.description && (
                                      <p className="text-[10px] text-stone-600 font-sans leading-relaxed pb-0.5">
                                        {item.description}
                                      </p>
                                    )}
                                    {hasSizes && item.sizes && (
                                      <div className="pt-0.5 text-[10px] font-sans flex flex-wrap items-center gap-x-2 gap-y-1 text-stone-500">
                                        {item.sizes.map((s, idx) => (
                                          <span key={idx} className="inline-flex items-baseline">
                                            <span className="text-stone-800 font-medium">{s.name}</span>
                                            <span className="mx-1 text-amber-900 font-semibold">{formatNaira(s.price)}</span>
                                            {idx < item.sizes!.length - 1 && (
                                              <span className="ml-2 text-stone-300 select-none">•</span>
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
                  <div className="menu-footer mt-auto pt-6 border-t border-amber-900/20 space-y-3 break-inside-avoid html2pdf__page-break-avoid font-sans" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                    <div className="flex items-center justify-between gap-4 text-left">
                      <div className="space-y-0.5">
                        <div className="text-[11px] font-serif font-bold uppercase tracking-wider text-amber-950">
                          Chef's Note & Dining Information
                        </div>
                        <p className="text-[9px] leading-relaxed max-w-sm text-stone-600">
                          Please inform our service staff of any food allergies or dietary preferences before placing your order.
                          All delicacies are prepared fresh to order in our executive kitchen.
                        </p>
                      </div>
                      <div className="text-right space-y-0.5 shrink-0">
                        <div className="text-[10px] font-bold text-amber-950">
                          Dine-In • Takeaway • Fast Delivery
                        </div>
                        <div className="text-[10px] font-semibold text-amber-900">
                          Reservations & Dispatch: 09165196622
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-amber-900/10 pt-2.5 flex items-center justify-between text-[9px] text-stone-500">
                      <div>© {new Date().getFullYear()} Lina Restaurant, Bar And Street Food • 27/29 6th Avenue, Gwarinpa, Abuja</div>
                      <div className="font-mono text-amber-900">{defaultDomain.replace(/^https?:\/\//, '')}</div>
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

