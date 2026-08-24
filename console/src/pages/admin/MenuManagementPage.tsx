import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  FolderPlus,
  SlidersHorizontal,
  X,
  AlertCircle,
  Flame,
  Sparkles,
} from 'lucide-react';
import { adminApi, publicApi } from '../../lib/api';
import { formatNaira } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Drawer } from '../../components/ui/Drawer';
import { Badge } from '../../components/ui/Badge';
import { toast } from '../../components/ui/Toast';
import { useAuth } from '../../contexts/AuthContext';
import {
  OptionSelectionType,
  type MenuCategoryResponse,
  type MenuItemResponse,
  type MenuItemSize,
  type MenuItemOptionGroup,
} from '../../types';

export const MenuManagementPage: React.FC = () => {
  const { isAdmin } = useAuth();

  const [categories, setCategories] = useState<MenuCategoryResponse[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [menuItems, setMenuItems] = useState<MenuItemResponse[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Category Modal State
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', icon: '🍽️', description: '' });

  // Dish Item Drawer State
  const [itemDrawerOpen, setItemDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItemResponse | null>(null);

  // Form State for MenuItem
  const [itemForm, setItemForm] = useState({
    name: '',
    categoryId: '',
    description: '',
    basePrice: 0,
    hasSizes: false,
    sizes: [] as MenuItemSize[],
    optionGroups: [] as MenuItemOptionGroup[],
    isChefSpecial: false,
    tags: [] as string[],
    isAvailable: true,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [cats, itemsRes] = await Promise.all([
        publicApi.getCategories(),
        publicApi.getMenuItems({
          categoryId: selectedCategoryId !== 'all' ? selectedCategoryId : undefined,
          search: search.trim() || undefined,
        }),
      ]);
      setCategories(cats || []);
      setMenuItems(itemsRes.items || []);
    } catch (err) {
      console.error('Failed to load menu data', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategoryId, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Instant 1-Click Stock Toggle
  const handleToggleStock = async (itemId: string, currentStatus: boolean) => {
    try {
      await adminApi.toggleItemAvailability(itemId);
      setMenuItems((prev) =>
        prev.map((i) => (i._id === itemId ? { ...i, isAvailable: !currentStatus } : i))
      );
      toast.success(`Dish marked as ${!currentStatus ? 'In Stock' : 'Out of Stock'}.`);
    } catch (err: any) {
      toast.error('Failed to update item availability.');
    }
  };

  // Open Create/Edit Item Drawer
  const handleOpenItemDrawer = (item?: MenuItemResponse) => {
    if (item) {
      setEditingItem(item);
      setItemForm({
        name: item.name,
        categoryId: typeof item.categoryId === 'string' ? item.categoryId : item.categoryId._id,
        description: item.description || '',
        basePrice: item.basePrice || 0,
        hasSizes: item.hasSizes || false,
        sizes: item.sizes ? [...item.sizes] : [],
        optionGroups: item.optionGroups ? JSON.parse(JSON.stringify(item.optionGroups)) : [],
        isChefSpecial: item.isChefSpecial || false,
        tags: item.tags || [],
        isAvailable: item.isAvailable,
      });
    } else {
      setEditingItem(null);
      setItemForm({
        name: '',
        categoryId: categories[0]?._id || '',
        description: '',
        basePrice: 0,
        hasSizes: false,
        sizes: [
          { name: 'Small Pack', price: 2500, isDefault: true },
          { name: 'Big Pack', price: 3000 },
        ],
        optionGroups: [],
        isChefSpecial: false,
        tags: [],
        isAvailable: true,
      });
    }
    setItemDrawerOpen(true);
  };

  // Save Item
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.name || !itemForm.categoryId) {
      toast.error('Name and Category are required.');
      return;
    }

    try {
      if (editingItem) {
        await adminApi.updateMenuItem(editingItem._id, itemForm);
        toast.success('Menu item updated successfully.');
      } else {
        await adminApi.createMenuItem(itemForm);
        toast.success('Menu item created successfully.');
      }
      setItemDrawerOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save menu item.');
    }
  };

  // Delete Item
  const handleDeleteItem = async (itemId: string, itemName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${itemName}"?`)) return;
    try {
      await adminApi.deleteMenuItem(itemId);
      toast.success('Menu item deleted.');
      loadData();
    } catch (err: any) {
      toast.error('Failed to delete item.');
    }
  };

  // Save Category
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return;
    try {
      await adminApi.createCategory(categoryForm);
      toast.success('Category created.');
      setCategoryModalOpen(false);
      setCategoryForm({ name: '', icon: '🍽️', description: '' });
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create category.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-on-surface">
            Menu Catalog & Stock Control
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Real-time item availability toggles, pricing, pack sizes and categories
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {isAdmin && (
            <Button
              onClick={() => setCategoryModalOpen(true)}
              variant="outline"
              size="sm"
              icon={<FolderPlus size={14} />}
            >
              Add Category
            </Button>
          )}

          {isAdmin && (
            <Button
              onClick={() => handleOpenItemDrawer()}
              variant="gold"
              size="sm"
              icon={<Plus size={14} />}
            >
              Add Dish / Item
            </Button>
          )}
        </div>
      </div>

      {/* Category Pills & Search Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-surface-container-lowest p-3 rounded-xl border border-outline-variant">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
          <button
            onClick={() => setSelectedCategoryId('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${selectedCategoryId === 'all'
              ? 'bg-primary text-on-primary shadow-sm'
              : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
              }`}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c._id}
              onClick={() => setSelectedCategoryId(c._id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${selectedCategoryId === c._id
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                }`}
            >
              <span>{c.icon || '🍽️'}</span>
              <span>{c.name}</span>
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items..."
            className="w-full bg-surface-container-low text-xs rounded-lg pl-9 pr-4 py-2 border border-outline-variant focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Menu Items Table */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant overflow-hidden shadow-card">
        {loading ? (
          <div className="p-12 text-center text-xs text-on-surface-variant">Loading menu catalog...</div>
        ) : menuItems.length === 0 ? (
          <div className="p-12 text-center text-xs text-on-surface-variant space-y-2">
            <p>No menu items found matching the selected filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-container-low border-b border-outline-variant text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Item Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Pricing & Sizes</th>
                  <th className="py-3.5 px-4 text-center">Availability (Instant Toggle)</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {menuItems.map((item) => (
                  <tr key={item._id} className="hover:bg-surface-container/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-serif font-bold text-sm text-on-surface">
                        {item.name}
                      </div>
                      {item.description && (
                        <div className="text-[11px] text-on-surface-variant line-clamp-1 max-w-xs">
                          {item.description}
                        </div>
                      )}
                      <div className="flex items-center gap-1 mt-1">
                        {item.isChefSpecial && (
                          <Badge variant="secondary" size="sm">
                            Chef Special
                          </Badge>
                        )}
                        {item.tags?.includes('spicy') && (
                          <Badge variant="error" size="sm">
                            Spicy
                          </Badge>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-on-surface-variant">
                        {typeof item.categoryId === 'object' ? item.categoryId?.name : 'Category'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {item.hasSizes && item.sizes && item.sizes.length > 0 ? (
                        <div className="space-y-0.5">
                          {item.sizes.map((s, idx) => (
                            <div key={idx} className="text-[11px] text-on-surface">
                              <span className="font-medium">{s.name}:</span>{' '}
                              <span className="font-serif font-bold text-secondary">
                                {formatNaira(s.price)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="font-serif font-bold text-sm text-secondary">
                          {formatNaira(item.basePrice)}
                        </div>
                      )}
                    </td>

                    {/* Stock Switch Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleStock(item._id, item.isAvailable)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer select-none ${item.isAvailable
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          }`}
                      >
                        {item.isAvailable ? (
                          <>
                            <CheckCircle2 size={14} />
                            <span>In Stock</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={14} />
                            <span>Sold Out</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Edit / Delete Buttons */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isAdmin && (
                          <button
                            onClick={() => handleOpenItemDrawer(item)}
                            className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all"
                            title="Edit Item"
                          >
                            <Edit2 size={15} />
                          </button>
                        )}

                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteItem(item._id, item.name)}
                            className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/40 transition-all"
                            title="Delete Item"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Category Modal ── */}
      <Modal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        title="Create Menu Category"
        width={440}
      >
        <form onSubmit={handleSaveCategory} className="space-y-4">
          <Input
            label="Category Name *"
            placeholder="e.g. Seafood Delicacies"
            value={categoryForm.name}
            onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
            required
          />
          <Input
            label="Emoji / Icon"
            placeholder="e.g. 🦀"
            value={categoryForm.icon}
            onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
          />
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Description
            </label>
            <textarea
              rows={2}
              value={categoryForm.description}
              onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              placeholder="Short description of this food/drink section..."
              className="w-full bg-surface-container-low text-xs rounded-lg p-3 border border-outline-variant focus:outline-none focus:border-primary"
            />
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setCategoryModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gold">
              Create Category
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Menu Item Form Drawer ── */}
      <Drawer
        isOpen={itemDrawerOpen}
        onClose={() => setItemDrawerOpen(false)}
        title={editingItem ? `Edit: ${editingItem.name}` : 'Create Menu Item'}
        width={560}
      >
        <form onSubmit={handleSaveItem} className="space-y-5">
          <Input
            label="Item Title *"
            placeholder="e.g. Banga Soup"
            value={itemForm.name}
            onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Category *
            </label>
            <select
              value={itemForm.categoryId}
              onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })}
              className="w-full bg-surface-container-low text-xs rounded-lg p-3 border border-outline-variant focus:outline-none focus:border-primary"
              required
            >
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Description / Ingredients
            </label>
            <textarea
              rows={2}
              value={itemForm.description}
              onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
              placeholder="e.g. Rich palm nut broth cooked with Delta spices and fresh catfish."
              className="w-full bg-surface-container-low text-xs rounded-lg p-3 border border-outline-variant focus:outline-none focus:border-primary"
            />
          </div>

          {/* Portion Sizes Toggle & Builder */}
          <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-on-surface">Portion / Pack Sizes</div>
                <div className="text-[11px] text-on-surface-variant">
                  e.g. Small Pack (₦2,300), Big Pack (₦2,900)
                </div>
              </div>
              <input
                type="checkbox"
                checked={itemForm.hasSizes}
                onChange={(e) => setItemForm({ ...itemForm, hasSizes: e.target.checked })}
                className="w-4 h-4 accent-primary cursor-pointer"
              />
            </div>

            {itemForm.hasSizes ? (
              <div className="space-y-2 pt-2 border-t border-outline-variant">
                {itemForm.sizes.map((size, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Size Name (e.g. Big Pack)"
                      value={size.name}
                      onChange={(e) => {
                        const updated = [...itemForm.sizes];
                        updated[idx].name = e.target.value;
                        setItemForm({ ...itemForm, sizes: updated });
                      }}
                      className="flex-1 bg-surface text-xs rounded-lg p-2.5 border border-outline-variant"
                    />
                    <input
                      type="number"
                      placeholder="Price (₦)"
                      value={size.price}
                      onChange={(e) => {
                        const updated = [...itemForm.sizes];
                        updated[idx].price = Number(e.target.value);
                        setItemForm({ ...itemForm, sizes: updated });
                      }}
                      className="w-28 bg-surface text-xs rounded-lg p-2.5 border border-outline-variant"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setItemForm({
                          ...itemForm,
                          sizes: itemForm.sizes.filter((_, i) => i !== idx),
                        });
                      }}
                      className="text-error p-1"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setItemForm({
                      ...itemForm,
                      sizes: [...itemForm.sizes, { name: 'New Size', price: 1000 }],
                    })
                  }
                >
                  + Add Another Size
                </Button>
              </div>
            ) : (
              <Input
                label="Base Price (₦)"
                type="number"
                value={itemForm.basePrice}
                onChange={(e) => setItemForm({ ...itemForm, basePrice: Number(e.target.value) })}
              />
            )}
          </div>

          {/* Special Flags */}
          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={itemForm.isChefSpecial}
                onChange={(e) => setItemForm({ ...itemForm, isChefSpecial: e.target.checked })}
                className="w-4 h-4 accent-primary"
              />
              <span>Chef's Special Badge</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={itemForm.isAvailable}
                onChange={(e) => setItemForm({ ...itemForm, isAvailable: e.target.checked })}
                className="w-4 h-4 accent-primary"
              />
              <span>In Stock</span>
            </label>
          </div>

          <div className="pt-4 border-t border-surface-container flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setItemDrawerOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gold">
              Save Menu Item
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
};
