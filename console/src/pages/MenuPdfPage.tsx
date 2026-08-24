import React, { useState, useEffect, useRef } from 'react';
import { Printer, Download, FileText, Sparkles, Check, Palette, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { publicApi } from '../lib/api';
import { formatNaira, Button, Logo, toast } from '@lina/ui';
import type { MenuCategoryResponse, MenuItemResponse } from '@lina/types';

export const MenuPdfPage: React.FC = () => {
  const [categories, setCategories] = useState<MenuCategoryResponse[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<'midnight' | 'classic'>('midnight');
  const pdfContainerRef = useRef<HTMLDivElement>(null);

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

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!pdfContainerRef.current) return;
    setDownloading(true);
    try {
      // @ts-ignore
      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = html2pdfModule.default || html2pdfModule;

      const element = pdfContainerRef.current;
      const filename = `Lina-Restaurant-Menu-A4-${selectedStyle === 'midnight' ? 'MidnightGold' : 'ClassicCream'}.pdf`;

      const opt = {
        margin: [8, 8, 8, 8] as [number, number, number, number],
        filename,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          scrollY: 0,
          windowWidth: 800,
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
        pagebreak: { mode: ['avoid-all' as const, 'css' as const, 'legacy' as const] },
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

  // Group items by category
  const itemsByCategory = categories.map((cat) => {
    const items = menuItems.filter((item) => {
      const catId = typeof item.categoryId === 'string' ? item.categoryId : item.categoryId?._id;
      return catId === cat._id;
    });
    return { category: cat, items };
  }).filter((group) => group.items.length > 0);

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
            Rendered in true A4 portrait format (210mm × 297mm) with cover page and digital QR code.
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
          <div
            ref={pdfContainerRef}
            className="w-full max-w-[210mm] min-w-[210mm] bg-white print:max-w-none print:w-full"
            style={{ minHeight: '297mm' }}
          >
            {/* ==========================================================================
               STYLE 1: MIDNIGHT OBSIDIAN & GOLD
               ========================================================================== */}
            {selectedStyle === 'midnight' && (
              <div className="bg-[#161311] text-[#FAF7F2] shadow-2xl p-8 sm:p-12 space-y-12 font-serif min-h-[297mm]">
                {/* ── PAGE 1: COVER PAGE ── */}
                <div className="min-h-[260mm] flex flex-col justify-between items-center text-center p-8 sm:p-10 border-4 border-[#C5943A]/50 rounded-xl relative bg-[#1E1A17] html2pdf__page-break">
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
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-[#FAF7F2] leading-tight">
                      Lina Restaurant, Bar And Street Food
                    </h1>
                    <p className="text-xl sm:text-2xl italic text-[#C5943A] font-medium">
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

                {/* ── PAGE 2+: MENU CATALOG PAGES ── */}
                <div className="space-y-10 pt-6">
                  <div className="text-center border-b border-[#3D332A] pb-3">
                    <h2 className="text-2xl font-black text-[#C5943A] uppercase tracking-widest">
                      Dining & Lounge Selection
                    </h2>
                    <p className="text-xs text-[#A89F91] font-sans pt-1">
                      All delicacies prepared fresh to order in our executive kitchen
                    </p>
                  </div>

                  {itemsByCategory.map(({ category, items }) => (
                    <div
                      key={category._id}
                      className="space-y-4 break-inside-avoid html2pdf__page-break-avoid"
                    >
                      <div className="flex items-center gap-2.5 border-b-2 border-[#C5943A]/40 pb-2">
                        <span className="text-lg">{category.icon || '🍽️'}</span>
                        <h3 className="font-bold text-lg text-[#FAF7F2] uppercase tracking-wider">
                          {category.name}
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        {items.map((item) => (
                          <div
                            key={item._id}
                            className="space-y-1 border-b border-[#2E2722] pb-2.5 break-inside-avoid"
                          >
                            <div className="flex items-baseline justify-between gap-2">
                              <h4 className="font-bold text-sm text-[#FAF7F2]">{item.name}</h4>
                              <span className="font-bold text-sm text-[#C5943A] shrink-0 font-sans">
                                {formatNaira(item.basePrice)}
                              </span>
                            </div>
                            {item.description && (
                              <p className="text-[11px] text-[#DDD7CB] font-sans leading-relaxed line-clamp-2">
                                {item.description}
                              </p>
                            )}
                            {item.hasSizes && item.sizes && item.sizes.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-1 font-sans text-[10px] text-[#A89F91]">
                                {item.sizes.map((s, idx) => (
                                  <span key={idx} className="bg-[#2E2722] px-1.5 py-0.5 rounded">
                                    {s.name}: {formatNaira(s.price)}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── FOOTER ── */}
                <div className="border-t border-[#3D332A] pt-4 flex flex-col sm:flex-row items-center justify-between text-[10px] text-[#A89F91] font-sans">
                  <div>© {new Date().getFullYear()} Lina Restaurant, Bar And Street Food • Gwarinpa, Abuja</div>
                  <div>{defaultDomain}</div>
                </div>
              </div>
            )}

            {/* ==========================================================================
               STYLE 2: CLASSIC CREAM ELEGANCE
               ========================================================================== */}
            {selectedStyle === 'classic' && (
              <div className="bg-[#FAF7F2] text-[#161311] shadow-2xl p-8 sm:p-12 space-y-12 font-serif min-h-[297mm]">
                {/* ── PAGE 1: COVER PAGE ── */}
                <div className="min-h-[260mm] flex flex-col justify-between items-center text-center p-8 sm:p-10 border-2 border-amber-900/30 rounded-xl relative bg-[#FFFDF9] html2pdf__page-break">
                  <div className="pt-6">
                    <Logo size="2xl" className="justify-center" />
                  </div>

                  <div className="space-y-4 my-auto max-w-lg">
                    <span className="inline-block px-4 py-1 rounded-full bg-amber-100 text-amber-950 text-xs font-sans font-bold uppercase tracking-[0.25em] border border-amber-300">
                      Fine Dining & Lounge
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-amber-950 leading-tight">
                      Lina Restaurant, Bar And Street Food
                    </h1>
                    <p className="text-xl sm:text-2xl italic text-amber-800 font-medium">
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

                {/* ── PAGE 2+: MENU CATALOG PAGES ── */}
                <div className="space-y-10 pt-6">
                  <div className="text-center border-b-2 border-amber-900/20 pb-3">
                    <h2 className="text-2xl font-black text-amber-950 uppercase tracking-widest">
                      A la Carte Menu
                    </h2>
                    <p className="text-xs text-stone-500 font-sans pt-1">
                      Fresh native soups, charcoal grills, shawarmas, and premium cocktails
                    </p>
                  </div>

                  {itemsByCategory.map(({ category, items }) => (
                    <div
                      key={category._id}
                      className="space-y-4 break-inside-avoid html2pdf__page-break-avoid"
                    >
                      <div className="flex items-center gap-2.5 border-b border-amber-900/30 pb-2">
                        <h3 className="font-bold text-lg text-amber-950 uppercase tracking-wider">
                          {category.name}
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        {items.map((item) => (
                          <div
                            key={item._id}
                            className="space-y-1 border-b border-stone-200 pb-2.5 break-inside-avoid"
                          >
                            <div className="flex items-baseline justify-between gap-2">
                              <h4 className="font-bold text-sm text-stone-900">{item.name}</h4>
                              <span className="font-bold text-sm text-amber-900 shrink-0 font-sans">
                                {formatNaira(item.basePrice)}
                              </span>
                            </div>
                            {item.description && (
                              <p className="text-[11px] text-stone-600 font-sans leading-relaxed line-clamp-2">
                                {item.description}
                              </p>
                            )}
                            {item.hasSizes && item.sizes && item.sizes.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-1 font-sans text-[10px] text-stone-500">
                                {item.sizes.map((s, idx) => (
                                  <span
                                    key={idx}
                                    className="bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200"
                                  >
                                    {s.name}: {formatNaira(s.price)}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── FOOTER ── */}
                <div className="border-t border-amber-900/20 pt-4 flex flex-col sm:flex-row items-center justify-between text-[10px] text-stone-500 font-sans">
                  <div>© {new Date().getFullYear()} Lina Restaurant, Bar And Street Food • Gwarinpa, Abuja</div>
                  <div>{defaultDomain}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
