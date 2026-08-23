import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Sparkles, UtensilsCrossed, RefreshCw, X } from 'lucide-react';
import { PublicHeader } from '../components/layout/PublicHeader';
import { PublicFooter } from '../components/layout/PublicFooter';
import { CategoryPills } from '../components/menu/CategoryPills';
import { BannersCarousel } from '../components/menu/BannersCarousel';
import { MenuCard } from '../components/menu/MenuCard';
import { ItemCustomizerModal } from '../components/menu/ItemCustomizerModal';
import { FloatingCartBar } from '../components/menu/FloatingCartBar';
import { useCart } from '../contexts/CartContext';
import { publicApi } from '../lib/api';
import type { MenuCategoryResponse, MenuItemResponse, BannerResponse } from '../types';

export const MenuCatalogPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { addItem } = useCart();

  const [categories, setCategories] = useState<MenuCategoryResponse[]>([]);
  const [banners, setBanners] = useState<BannerResponse[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [menuItems, setMenuItems] = useState<MenuItemResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [customizingItem, setCustomizingItem] = useState<MenuItemResponse | null>(null);

  // If table query param exists (e.g. ?table=12 from QR code), preserve in sessionStorage
  useEffect(() => {
    const tableParam = searchParams.get('table');
    if (tableParam) {
      sessionStorage.setItem('lina_table_number', tableParam);
    }
  }, [searchParams]);

  // Initial Fetch Categories and Banners
  useEffect(() => {
    publicApi
      .getCategories()
      .then((cats: MenuCategoryResponse[]) => setCategories(cats || []))
      .catch((err: any) => console.error('Failed to load categories', err));

    publicApi
      .getBanners()
      .then((b: BannerResponse[]) => setBanners(b || []))
      .catch((err: any) => console.error('Failed to load banners', err));
  }, []);

  // Fetch Menu Items with category filter and search
  const loadMenuItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await publicApi.getMenuItems({
        categoryId: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: searchQuery.trim() || undefined,
      });
      setMenuItems(res.items || []);
    } catch (err) {
      console.error('Failed to load menu items', err);
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadMenuItems();
    }, 150);
    return () => clearTimeout(timer);
  }, [loadMenuItems]);

  // Card click handler
  const handleItemSelect = (item: MenuItemResponse) => {
    const hasCustomizations =
      (item.hasSizes && item.sizes && item.sizes.length > 0) ||
      (item.optionGroups && item.optionGroups.length > 0);

    if (hasCustomizations) {
      setCustomizingItem(item);
    } else {
      addItem(item, 1);
    }
  };

  const activeCategoryObj = useMemo(() => {
    return categories.find((c) => c._id === selectedCategory);
  }, [categories, selectedCategory]);

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-between selection:bg-primary/20">
      <PublicHeader />

      {/* Category Pills Navigation (Sticky) */}
      <CategoryPills
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
        {/* Promotional Banners */}
        {banners.length > 0 && <BannersCarousel banners={banners} />}

        {/* Search Bar & Title Header */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
          <div>
            <h1 className="font-serif font-black text-2xl sm:text-3xl text-on-surface flex items-center gap-2">
              <span>{activeCategoryObj ? activeCategoryObj.name : 'All Catalog Offerings'}</span>
              {activeCategoryObj?.icon && <span>{activeCategoryObj.icon}</span>}
            </h1>
            {activeCategoryObj?.description && (
              <p className="text-xs text-on-surface-variant mt-0.5">
                {activeCategoryObj.description}
              </p>
            )}
          </div>

          {/* Search Input */}
          <div className="relative max-w-sm w-full">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes, drinks, ingredients..."
              className="w-full bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/60 text-xs sm:text-sm rounded-2xl pl-10 pr-9 py-2.5 border border-outline-variant/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-1"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Menu Items Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
            <RefreshCw size={24} className="text-primary animate-spin" />
            <p className="text-xs text-on-surface-variant font-medium">
              Loading fresh delicacies...
            </p>
          </div>
        ) : menuItems.length === 0 ? (
          <div className="py-20 text-center space-y-3 bg-surface-container-lowest rounded-3xl border border-outline-variant p-8">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto text-xl">
              <UtensilsCrossed size={20} />
            </div>
            <h3 className="font-serif font-bold text-lg text-on-surface">No dishes found</h3>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
              {searchQuery
                ? `No menu items matching "${searchQuery}". Try a different keyword.`
                : 'No items currently in this category.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 pb-20">
            {menuItems.map((item) => (
              <MenuCard key={item._id} item={item} onSelect={handleItemSelect} />
            ))}
          </div>
        )}
      </main>

      {/* Floating Bottom Cart Bar */}
      <FloatingCartBar />

      {/* Item Customizer Modal */}
      <ItemCustomizerModal
        item={customizingItem}
        isOpen={!!customizingItem}
        onClose={() => setCustomizingItem(null)}
        onAddToCart={addItem}
      />

      <PublicFooter />
    </div>
  );
};
