import { Request, Response } from 'express';
import { MenuCategory } from '../models/MenuCategory.model';
import { MenuItem } from '../models/MenuItem.model';

// ── Categories ────────────────────────────────────────────────────────

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const { includeInactive } = req.query;
    const filter: any = {};
    if (!includeInactive || includeInactive === 'false') {
      filter.isActive = true;
    }

    const categories = await MenuCategory.find(filter).sort({ sortOrder: 1, name: 1 });

    // Aggregate counts of items in each category
    const counts = await MenuItem.aggregate([
      { $match: { isAvailable: true } },
      { $group: { _id: '$categoryId', count: { $sum: 1 } } },
    ]);
    const countsMap = new Map(counts.map((c) => [c._id.toString(), c.count]));

    const categoriesWithCount = categories.map((cat) => ({
      ...cat.toObject(),
      itemCount: countsMap.get(cat._id.toString()) || 0,
    }));

    res.json({ success: true, data: categoriesWithCount });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, icon, sortOrder, isActive } = req.body;
    if (!name) {
      res.status(400).json({ success: false, message: 'Category name is required.' });
      return;
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const existing = await MenuCategory.findOne({ $or: [{ name }, { slug }] });
    if (existing) {
      res.status(409).json({ success: false, message: 'Category with this name already exists.' });
      return;
    }

    const category = await MenuCategory.create({
      name: name.trim(),
      slug,
      description: description?.trim(),
      icon: icon?.trim(),
      sortOrder: sortOrder || 0,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({ success: true, data: category, message: 'Category created successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, icon, sortOrder, isActive } = req.body;

    const category = await MenuCategory.findById(id);
    if (!category) {
      res.status(404).json({ success: false, message: 'Category not found.' });
      return;
    }

    if (name) {
      category.name = name.trim();
      category.slug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }
    if (description !== undefined) category.description = description?.trim();
    if (icon !== undefined) category.icon = icon?.trim();
    if (sortOrder !== undefined) category.sortOrder = sortOrder;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();
    res.json({ success: true, data: category, message: 'Category updated successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const itemsCount = await MenuItem.countDocuments({ categoryId: id });
    if (itemsCount > 0) {
      res.status(400).json({
        success: false,
        message: `Cannot delete category containing ${itemsCount} menu items. Reassign or delete items first.`,
      });
      return;
    }

    const deleted = await MenuCategory.findByIdAndDelete(id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Category not found.' });
      return;
    }

    res.json({ success: true, message: 'Category deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Menu Items ────────────────────────────────────────────────────────

export const getMenuItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId, search, isAvailable, isChefSpecial, limit = 200, page = 1 } = req.query;
    const filter: any = {};

    if (categoryId && categoryId !== 'all') {
      filter.categoryId = categoryId;
    }

    if (isAvailable !== undefined && isAvailable !== '') {
      filter.isAvailable = isAvailable === 'true';
    }

    if (isChefSpecial !== undefined && isChefSpecial !== '') {
      filter.isChefSpecial = isChefSpecial === 'true';
    }

    if (search && typeof search === 'string' && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { tags: { $in: [searchRegex] } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      MenuItem.find(filter)
        .populate('categoryId', 'name slug icon')
        .sort({ isAvailable: -1, sortOrder: 1, name: 1 })
        .skip(skip)
        .limit(Number(limit)),
      MenuItem.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        items,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMenuItemById = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await MenuItem.findById(req.params.id).populate('categoryId', 'name slug icon');
    if (!item) {
      res.status(404).json({ success: false, message: 'Menu item not found.' });
      return;
    }
    res.json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createMenuItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      categoryId,
      name,
      description,
      images,
      basePrice,
      hasSizes,
      sizes,
      optionGroups,
      estimatedPrepTimeMinutes,
      isAvailable,
      isChefSpecial,
      tags,
      sortOrder,
    } = req.body;

    if (!categoryId || !name) {
      res.status(400).json({ success: false, message: 'Category and Item Name are required.' });
      return;
    }

    const item = await MenuItem.create({
      categoryId,
      name: name.trim(),
      description: description?.trim(),
      images: Array.isArray(images) ? images : [],
      basePrice: Number(basePrice) || 0,
      hasSizes: Boolean(hasSizes),
      sizes: Array.isArray(sizes) ? sizes : [],
      optionGroups: Array.isArray(optionGroups) ? optionGroups : [],
      estimatedPrepTimeMinutes: Number(estimatedPrepTimeMinutes) || 15,
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
      isChefSpecial: Boolean(isChefSpecial),
      tags: Array.isArray(tags) ? tags : [],
      sortOrder: Number(sortOrder) || 0,
    });

    const populated = await item.populate('categoryId', 'name slug icon');
    res.status(201).json({ success: true, data: populated, message: 'Menu item created successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateMenuItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const item = await MenuItem.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate('categoryId', 'name slug icon');

    if (!item) {
      res.status(404).json({ success: false, message: 'Menu item not found.' });
      return;
    }

    res.json({ success: true, data: item, message: 'Menu item updated successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleItemAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const item = await MenuItem.findById(id);
    if (!item) {
      res.status(404).json({ success: false, message: 'Menu item not found.' });
      return;
    }

    item.isAvailable = !item.isAvailable;
    await item.save();

    res.json({
      success: true,
      data: { id: item._id, isAvailable: item.isAvailable },
      message: `Item is now ${item.isAvailable ? 'In Stock' : 'Out of Stock'}.`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteMenuItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await MenuItem.findByIdAndDelete(id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Menu item not found.' });
      return;
    }
    res.json({ success: true, message: 'Menu item deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
