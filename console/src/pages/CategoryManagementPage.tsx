import React, { useState, useEffect, useMemo } from 'react';
import {
  FolderTree,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  UtensilsCrossed,
  Layers,
  ArrowUpDown,
  AlertTriangle,
} from 'lucide-react';
import { adminApi } from '../lib/api';
import { Button, Input, Modal, Badge, toast } from '@lina/ui';
import type { MenuCategoryResponse } from '@lina/types';

const ICON_PRESETS = [
  { emoji: '🍲', label: 'Soups' },
  { emoji: '🍚', label: 'Rice' },
  { emoji: '🥩', label: 'Grills & BBQ' },
  { emoji: '🍗', label: 'Poultry' },
  { emoji: '🐟', label: 'Seafood' },
  { emoji: '🥗', label: 'Sides' },
  { emoji: '🥪', label: 'Snacks' },
  { emoji: '🍹', label: 'Cocktails' },
  { emoji: '🍺', label: 'Drinks' },
  { emoji: '🍰', label: 'Desserts' },
  { emoji: '⭐', label: 'Specials' },
  { emoji: '🍽️', label: 'General' },
];

export const CategoryManagementPage: React.FC = () => {
  const [categories, setCategories] = useState<MenuCategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategoryResponse | null>(null);
  const [saving, setSaving] = useState(false);

  // Delete Dialog State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<MenuCategoryResponse | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: '',
    icon: '🍽️',
    description: '',
    sortOrder: 0,
    isActive: true,
  });

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAllCategories({ includeInactive: true });
      setCategories(data || []);
    } catch (err: any) {
      console.error('Failed to load categories', err);
      toast.error('Failed to load menu categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setForm({
      name: '',
      icon: '🍽️',
      description: '',
      sortOrder: (categories.length + 1) * 10,
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (cat: MenuCategoryResponse) => {
    setEditingCategory(cat);
    setForm({
      name: cat.name,
      icon: cat.icon || '🍽️',
      description: cat.description || '',
      sortOrder: cat.sortOrder ?? 0,
      isActive: cat.isActive,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Category name is required.');
      return;
    }

    setSaving(true);
    try {
      if (editingCategory) {
        await adminApi.updateCategory(editingCategory._id, {
          name: form.name.trim(),
          icon: form.icon.trim() || '🍽️',
          description: form.description.trim(),
          sortOrder: Number(form.sortOrder) || 0,
          isActive: form.isActive,
        });
        toast.success(`Category "${form.name}" updated successfully.`);
      } else {
        await adminApi.createCategory({
          name: form.name.trim(),
          icon: form.icon.trim() || '🍽️',
          description: form.description.trim(),
          sortOrder: Number(form.sortOrder) || 0,
          isActive: form.isActive,
        });
        toast.success(`Category "${form.name}" created successfully.`);
      }
      setModalOpen(false);
      loadCategories();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save category.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (cat: MenuCategoryResponse) => {
    const nextStatus = !cat.isActive;
    try {
      await adminApi.toggleCategoryActive(cat._id, nextStatus);
      setCategories((prev) =>
        prev.map((c) => (c._id === cat._id ? { ...c, isActive: nextStatus } : c))
      );
      toast.success(`Category "${cat.name}" marked as ${nextStatus ? 'Active' : 'Inactive'}.`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to toggle category status.');
    }
  };

  const openDeleteDialog = (cat: MenuCategoryResponse) => {
    setCategoryToDelete(cat);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    setDeleting(true);
    try {
      await adminApi.deleteCategory(categoryToDelete._id);
      toast.success(`Category "${categoryToDelete.name}" deleted successfully.`);
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
      loadCategories();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete category.');
    } finally {
      setDeleting(false);
    }
  };

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return categories
      .filter((cat) => {
        if (statusFilter === 'active' && !cat.isActive) return false;
        if (statusFilter === 'inactive' && cat.isActive) return false;
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          cat.name.toLowerCase().includes(q) ||
          cat.slug.toLowerCase().includes(q) ||
          (cat.description && cat.description.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [categories, search, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = categories.length;
    const active = categories.filter((c) => c.isActive).length;
    const inactive = total - active;
    const totalDishes = categories.reduce((acc, c) => acc + (c.totalItemCount || c.itemCount || 0), 0);
    return { total, active, inactive, totalDishes };
  }, [categories]);

  // Auto-generate preview slug from form name
  const previewSlug = form.name
    ? form.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
    : '';

  return (
    <div className="space-y-6">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-on-surface">
            Menu Category Management
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Organize digital menu taxonomy, display hierarchy, and customer catalog visibility
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadCategories}
            className="flex items-center gap-2"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={openCreateModal}
            className="flex items-center gap-2 shadow-xs"
          >
            <Plus size={16} />
            <span>New Category</span>
          </Button>
        </div>
      </div>

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-outline-variant shadow-xs">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="text-xs font-semibold">Total Categories</span>
            <FolderTree size={16} className="text-primary" />
          </div>
          <div className="text-2xl font-bold font-serif text-on-surface">{stats.total}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-outline-variant shadow-xs">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="text-xs font-semibold">Active Categories</span>
            <CheckCircle2 size={16} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-serif text-emerald-600">{stats.active}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-outline-variant shadow-xs">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="text-xs font-semibold">Hidden / Inactive</span>
            <XCircle size={16} className="text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-serif text-amber-600">{stats.inactive}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-outline-variant shadow-xs">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="text-xs font-semibold">Mapped Dishes</span>
            <UtensilsCrossed size={16} className="text-primary" />
          </div>
          <div className="text-2xl font-bold font-serif text-on-surface">{stats.totalDishes}</div>
        </div>
      </div>

      {/* ── Filters & Search Bar ── */}
      <div className="bg-white p-4 rounded-xl border border-outline-variant shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:w-80 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by category name, slug..."
            className="pl-10 text-xs py-2 h-10 w-full"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'active', 'inactive'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all shrink-0 ${
                statusFilter === filter
                  ? 'bg-[#161311] text-white shadow-xs'
                  : 'bg-surface-variant/40 text-on-surface-variant hover:bg-surface-variant'
              }`}
            >
              {filter === 'all' ? `All (${stats.total})` : `${filter} (${stats[filter]})`}
            </button>
          ))}
        </div>
      </div>

      {/* ── Category List ── */}
      <div className="bg-white rounded-xl border border-outline-variant shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-on-surface-variant flex flex-col items-center justify-center gap-3">
            <RefreshCw size={24} className="animate-spin text-primary" />
            <span>Loading categories...</span>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="py-16 text-center">
            <FolderTree size={40} className="mx-auto text-outline mb-3 stroke-[1.5]" />
            <h3 className="font-serif font-bold text-base text-on-surface">No categories found</h3>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto mt-1 mb-4">
              {search
                ? `No categories match "${search}". Try adjusting your search term.`
                : 'Get started by adding your first food or beverage category.'}
            </p>
            {!search && (
              <Button variant="primary" size="sm" onClick={openCreateModal}>
                <Plus size={14} className="mr-1.5" />
                Create Category
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/80 bg-surface-variant/20 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span>Order</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-center">Dishes</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60 text-xs text-on-surface">
                {filteredCategories.map((cat) => {
                  const dishCount = cat.totalItemCount ?? cat.itemCount ?? 0;
                  const availableCount = cat.itemCount ?? 0;
                  return (
                    <tr
                      key={cat._id}
                      className="hover:bg-surface-variant/20 transition-colors group"
                    >
                      {/* Name & Icon */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-surface-variant/50 border border-outline-variant/60 flex items-center justify-center text-xl shrink-0">
                            {cat.icon || '🍽️'}
                          </div>
                          <div>
                            <div className="font-bold text-on-surface flex items-center gap-2">
                              <span>{cat.name}</span>
                              {!cat.isActive && (
                                <Badge variant="neutral" size="sm" className="text-[10px]">
                                  Hidden
                                </Badge>
                              )}
                            </div>
                            <div className="text-[11px] text-on-surface-variant/70 font-mono">
                              ID: {cat._id.slice(-6)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Slug */}
                      <td className="py-3 px-4">
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-surface-variant/40 border border-outline-variant/50 text-on-surface-variant">
                          {cat.slug}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="py-3 px-4 max-w-xs truncate text-on-surface-variant">
                        {cat.description || <span className="text-on-surface-variant/40 italic">No description</span>}
                      </td>

                      {/* Sort Order */}
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-surface-variant/60 text-xs font-mono font-bold text-on-surface">
                          {cat.sortOrder ?? 0}
                        </span>
                      </td>

                      {/* Dish Counts */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="font-bold text-xs text-on-surface">
                            {dishCount} {dishCount === 1 ? 'dish' : 'dishes'}
                          </span>
                          {dishCount > 0 && availableCount !== dishCount && (
                            <span className="text-[10px] text-on-surface-variant">
                              {availableCount} available
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Active Status Toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(cat)}
                          title={`Click to mark ${cat.isActive ? 'Inactive' : 'Active'}`}
                          className="inline-flex items-center gap-1.5 cursor-pointer focus:outline-none"
                        >
                          {cat.isActive ? (
                            <Badge variant="primary" size="sm" className="cursor-pointer">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="neutral" size="sm" className="cursor-pointer">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-1" />
                              Inactive
                            </Badge>
                          )}
                        </button>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(cat)}
                            title="Edit Category"
                            className="h-8 w-8 p-0 text-on-surface-variant hover:text-primary hover:bg-primary/10"
                          >
                            <Edit2 size={15} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(cat)}
                            title="Delete Category"
                            className="h-8 w-8 p-0 text-on-surface-variant hover:text-error hover:bg-error/10"
                          >
                            <Trash2 size={15} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Create / Edit Modal ── */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Edit Menu Category' : 'Create New Menu Category'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {/* Name & Slug */}
          <div>
            <label className="block text-xs font-bold text-on-surface mb-1">
              Category Name <span className="text-error">*</span>
            </label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Traditional Soups & Swallows"
              required
              className="text-xs"
            />
            {previewSlug && (
              <p className="text-[11px] text-on-surface-variant font-mono mt-1">
                URL Slug: <span className="text-primary font-bold">{previewSlug}</span>
              </p>
            )}
          </div>

          {/* Icon / Emoji Selection */}
          <div>
            <label className="block text-xs font-bold text-on-surface mb-1">
              Category Icon / Emoji
            </label>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-surface-variant/40 border border-outline-variant flex items-center justify-center text-2xl shrink-0">
                {form.icon || '🍽️'}
              </div>
              <Input
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                placeholder="Emoji or short text"
                maxLength={8}
                className="text-xs w-32"
              />
            </div>
            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5">
              {ICON_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.label}
                  onClick={() => setForm({ ...form, icon: preset.emoji })}
                  className={`px-2 py-1 rounded-md text-xs border transition-all ${
                    form.icon === preset.emoji
                      ? 'bg-[#161311] text-white border-[#161311]'
                      : 'bg-white text-on-surface-variant border-outline-variant hover:bg-surface-variant/40'
                  }`}
                >
                  <span className="mr-1">{preset.emoji}</span>
                  <span className="text-[10px] font-semibold">{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-on-surface mb-1">
              Description (Optional)
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief description displayed to customers under category header..."
              rows={3}
              className="w-full text-xs rounded-lg border border-outline-variant p-2.5 bg-white text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          {/* Sort Order & Visibility Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Display Order Priority
              </label>
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                className="text-xs"
              />
              <p className="text-[10px] text-on-surface-variant mt-1">
                Lower numbers appear first on the menu.
              </p>
            </div>

            <div className="flex flex-col justify-center">
              <label className="text-xs font-bold text-on-surface mb-1.5">Visibility</label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 text-primary rounded border-outline-variant focus:ring-primary"
                />
                <span className="text-xs text-on-surface font-semibold">
                  Visible to Customers
                </span>
              </label>
              <p className="text-[10px] text-on-surface-variant mt-1">
                Disable to temporarily hide this category from the online menu.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t border-outline-variant">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setModalOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={saving}
              className="min-w-24"
            >
              {saving ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Safe Delete Dialog ── */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          if (!deleting) {
            setDeleteModalOpen(false);
            setCategoryToDelete(null);
          }
        }}
        title="Delete Menu Category"
      >
        {categoryToDelete && (
          <div className="space-y-4">
            {/* If category has dishes assigned */}
            {(categoryToDelete.totalItemCount ?? categoryToDelete.itemCount ?? 0) > 0 ? (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-900">
                <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold">Cannot Delete Assigned Category</p>
                  <p>
                    Category <span className="font-bold">"{categoryToDelete.name}"</span> contains{' '}
                    <span className="font-bold">
                      {categoryToDelete.totalItemCount ?? categoryToDelete.itemCount}
                    </span>{' '}
                    dishes.
                  </p>
                  <p className="text-amber-800">
                    To prevent broken menu items, please reassign or delete these dishes in Menu & Stock
                    before deleting this category.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-on-surface leading-relaxed">
                Are you sure you want to delete the category{' '}
                <span className="font-bold text-on-surface">"{categoryToDelete.name}"</span>? This action
                cannot be undone.
              </p>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t border-outline-variant">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setCategoryToDelete(null);
                }}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleConfirmDelete}
                disabled={
                  deleting || (categoryToDelete.totalItemCount ?? categoryToDelete.itemCount ?? 0) > 0
                }
                className="bg-error hover:bg-error/90 text-white min-w-24 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
