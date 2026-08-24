import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Minus, Check, AlertCircle } from 'lucide-react';
import { Modal, Button, formatNaira } from '@lina/ui';
import type {
  MenuItemResponse,
  MenuItemSize,
  MenuItemOptionGroup,
  SelectedOptionItem,
} from '@lina/types';

interface ItemCustomizerModalProps {
  item: MenuItemResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (
    item: MenuItemResponse,
    quantity: number,
    selectedSize?: MenuItemSize,
    selectedOptions?: SelectedOptionItem[],
    specialInstructions?: string
  ) => void;
}

export const ItemCustomizerModal: React.FC<ItemCustomizerModalProps> = ({
  item,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  if (!item) return null;

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<MenuItemSize | undefined>(() => {
    if (item.hasSizes && item.sizes && item.sizes.length > 0) {
      return item.sizes.find((s) => s.isDefault) || item.sizes[0];
    }
    return undefined;
  });

  // Map of groupName -> list of selected option names
  const [selectedOptionsMap, setSelectedOptionsMap] = useState<Record<string, string[]>>({});
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Initialize defaults on modal open
  useEffect(() => {
    if (item) {
      setQuantity(1);
      setSpecialInstructions('');
      setValidationError(null);

      if (item.hasSizes && item.sizes && item.sizes.length > 0) {
        setSelectedSize(item.sizes.find((s) => s.isDefault) || item.sizes[0]);
      } else {
        setSelectedSize(undefined);
      }

      if (item.optionGroups && item.optionGroups.length > 0) {
        const initialMap: Record<string, string[]> = {};
        for (const og of item.optionGroups) {
          if (og.required && og.options.length > 0) {
            initialMap[og.name] = [og.options[0].name];
          } else {
            initialMap[og.name] = [];
          }
        }
        setSelectedOptionsMap(initialMap);
      } else {
        setSelectedOptionsMap({});
      }
    }
  }, [item]);

  // Compute live unit price
  const unitPrice = useMemo(() => {
    let base = item.basePrice || 0;
    if (item.hasSizes && selectedSize) {
      base = selectedSize.price;
    }

    let extras = 0;
    if (item.optionGroups) {
      for (const og of item.optionGroups) {
        const selected = selectedOptionsMap[og.name] || [];
        for (const optName of selected) {
          const matched = og.options.find((o) => o.name === optName);
          if (matched && matched.extraPrice) {
            extras += matched.extraPrice;
          }
        }
      }
    }

    return base + extras;
  }, [item, selectedSize, selectedOptionsMap]);

  const totalCalculated = unitPrice * quantity;

  // Handle option toggle
  const handleToggleOption = (group: MenuItemOptionGroup, optName: string) => {
    setValidationError(null);
    setSelectedOptionsMap((prev) => {
      const currentList = prev[group.name] || [];
      if (group.selectionType === 'single_select') {
        return { ...prev, [group.name]: [optName] };
      } else {
        // Multi-select
        if (currentList.includes(optName)) {
          return { ...prev, [group.name]: currentList.filter((n) => n !== optName) };
        } else {
          if (group.maxSelections && currentList.length >= group.maxSelections) {
            return prev; // max reached
          }
          return { ...prev, [group.name]: [...currentList, optName] };
        }
      }
    });
  };

  const handleConfirm = () => {
    // Validate required groups
    if (item.optionGroups) {
      for (const og of item.optionGroups) {
        const selected = selectedOptionsMap[og.name] || [];
        if (og.required && selected.length === 0) {
          setValidationError(`Please make a selection for "${og.name}"`);
          return;
        }
        if (og.minSelections && selected.length < og.minSelections) {
          setValidationError(
            `Please select at least ${og.minSelections} option(s) for "${og.name}"`
          );
          return;
        }
      }
    }

    // Flatten selected options array
    const selectedOptionsList: SelectedOptionItem[] = [];
    if (item.optionGroups) {
      for (const og of item.optionGroups) {
        const selected = selectedOptionsMap[og.name] || [];
        for (const optName of selected) {
          const matched = og.options.find((o) => o.name === optName);
          if (matched) {
            selectedOptionsList.push({
              groupName: og.name,
              optionName: matched.name,
              extraPrice: matched.extraPrice || 0,
            });
          }
        }
      }
    }

    onAddToCart(
      item,
      quantity,
      selectedSize,
      selectedOptionsList.length > 0 ? selectedOptionsList : undefined,
      specialInstructions.trim() || undefined
    );
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} width={540}>
      <div className="space-y-6">
        {/* Header Dish Overview */}
        <div>
          <h2 className="font-serif font-bold text-2xl text-on-surface leading-tight">
            {item.name}
          </h2>
          {item.description && (
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>

        {/* 1. Portion / Pack Sizes */}
        {item.hasSizes && item.sizes && item.sizes.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-surface-container">
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Select Portion / Pack Size <span className="text-primary">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {item.sizes.map((size) => {
                const isSelected = selectedSize?.name === size.name;
                return (
                  <button
                    key={size.name}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary-container/40 text-on-primary-container ring-2 ring-primary/20 font-bold'
                        : 'border-outline-variant hover:border-primary/40 bg-surface-container-low text-on-surface'
                    }`}
                  >
                    <div>
                      <div className="text-sm">{size.name}</div>
                    </div>
                    <div className="font-serif font-black text-sm text-secondary">
                      {formatNaira(size.price)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. Nested Option Groups */}
        {item.optionGroups &&
          item.optionGroups.map((group) => {
            const selectedList = selectedOptionsMap[group.name] || [];
            return (
              <div key={group.name} className="space-y-3 pt-2 border-t border-surface-container">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    {group.name} {group.required && <span className="text-primary">*</span>}
                  </label>
                  <span className="text-[11px] text-on-surface-variant">
                    {group.selectionType === 'single_select'
                      ? 'Choose 1'
                      : `Choose up to ${group.maxSelections || 'any'}`}
                  </span>
                </div>

                <div className="space-y-2">
                  {group.options.map((opt) => {
                    const isChecked = selectedList.includes(opt.name);
                    return (
                      <button
                        key={opt.name}
                        type="button"
                        onClick={() => handleToggleOption(group, opt.name)}
                        className={`flex items-center justify-between w-full p-3 rounded-2xl border transition-all cursor-pointer ${
                          isChecked
                            ? 'border-primary bg-primary-container/30 text-on-primary-container font-semibold'
                            : 'border-outline-variant hover:border-primary/30 bg-surface-container-low text-on-surface'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                              isChecked
                                ? 'border-primary bg-primary text-on-primary'
                                : 'border-outline-variant'
                            }`}
                          >
                            {isChecked && <Check size={10} strokeWidth={3} />}
                          </div>
                          <span className="text-sm">{opt.name}</span>
                        </div>

                        {opt.extraPrice > 0 && (
                          <span className="text-xs font-serif font-bold text-secondary">
                            +{formatNaira(opt.extraPrice)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

        {/* 3. Special Instructions / Notes */}
        <div className="space-y-2 pt-2 border-t border-surface-container">
          <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Special Instructions / Kitchen Note
          </label>
          <textarea
            rows={2}
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            placeholder="e.g. Extra pepper, no onions, pack stew separately..."
            className="w-full bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/50 text-xs rounded-xl p-3 border border-outline-variant focus:outline-none focus:border-primary"
          />
        </div>

        {/* Validation Alert */}
        {validationError && (
          <div className="flex items-center gap-2 p-3 bg-error-container text-on-error-container text-xs rounded-xl">
            <AlertCircle size={16} />
            <span>{validationError}</span>
          </div>
        )}

        {/* Quantity and Submit Bar */}
        <div className="pt-4 border-t border-surface-container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 bg-surface-container rounded-2xl p-1.5 border border-outline-variant">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 rounded-xl bg-surface hover:bg-surface-container-high flex items-center justify-center text-on-surface transition-all cursor-pointer"
            >
              <Minus size={14} />
            </button>
            <span className="font-bold text-sm w-5 text-center">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 rounded-xl bg-surface hover:bg-surface-container-high flex items-center justify-center text-on-surface transition-all cursor-pointer"
            >
              <Plus size={14} />
            </button>
          </div>

          <Button onClick={handleConfirm} variant="gold" size="md" className="flex-1">
            <span>Add to Cart</span>
            <span>•</span>
            <span className="font-serif">{formatNaira(totalCalculated)}</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
};
